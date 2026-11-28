# M-Pesa payment prompt: what the backend needs

For your backend teammate. The frontend already works. This describes the three endpoints it calls and a working FastAPI example that talks to Safaricom's Daraja API (M-Pesa Express, also called STK Push).

## How it works
```
Cashier picks M-Pesa, enters the customer's number
        |  POST /api/payments/mpesa/stk-push
FastAPI -> Daraja (Safaricom) -> prompt appears on the customer's phone
        |
Customer enters their PIN (or cancels)
        |
Daraja -> POST /api/payments/mpesa/callback  (Safaricom calls your server)
        |
Frontend polls GET /api/payments/mpesa/status/<id> every 3 seconds
        |  status = success
Frontend records the sale (POST /api/sales) and stock goes down
```
The sale is only recorded after the payment succeeds.

## Endpoints the frontend calls

| Method | Endpoint | Body / response |
|---|---|---|
| POST | `/api/payments/mpesa/stk-push` (needs JWT) | body `{phone: "254712345678", amount: 720}` returns `{checkout_request_id}` |
| GET | `/api/payments/mpesa/status/<checkout_request_id>` (needs JWT) | returns `{status, message, receipt}` where status is `pending`, `success`, `failed`, `cancelled` or `timeout` |
| POST | `/api/payments/mpesa/callback` (public, called by Safaricom) | Safaricom's result, see below |

## One-time setup
1. Create a free account at https://developer.safaricom.co.ke and create an app with the **M-Pesa Express (STK Push)** API enabled.
2. Copy the sandbox **Consumer Key**, **Consumer Secret**, **Shortcode** and **Passkey** from the app's test credentials page.
3. Safaricom must reach your callback over public HTTPS, so on your laptop use a tunnel:
   `ngrok http 8000` and use the https address it prints.
4. Put the values in the backend `.env` (never in the frontend, never on GitHub):
```
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://YOUR-NGROK-ADDRESS/api/payments/mpesa/callback
```
5. `pip install httpx` and add the router in `app/main.py`: `app.include_router(mpesa.router)`.

## FastAPI example: `app/routes/mpesa.py`
```python
import base64
import os
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.auth import get_current_user  # your existing JWT dependency

router = APIRouter(prefix="/api/payments/mpesa", tags=["mpesa"])

BASE = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
KEY, SECRET = os.getenv("MPESA_CONSUMER_KEY"), os.getenv("MPESA_CONSUMER_SECRET")
SHORTCODE, PASSKEY = os.getenv("MPESA_SHORTCODE"), os.getenv("MPESA_PASSKEY")
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")

# For the demo this is kept in memory. For production store it in a payments table.
payments: dict[str, dict] = {}


async def get_token() -> str:
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE}/oauth/v1/generate", params={"grant_type": "client_credentials"}, auth=(KEY, SECRET))
        r.raise_for_status()
        return r.json()["access_token"]


def password_and_timestamp():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{SHORTCODE}{PASSKEY}{timestamp}".encode()).decode()
    return password, timestamp


class PushIn(BaseModel):
    phone: str   # 2547XXXXXXXX
    amount: int  # whole shillings


@router.post("/stk-push")
async def stk_push(body: PushIn, user=Depends(get_current_user)):
    token = await get_token()
    password, timestamp = password_and_timestamp()
    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",  # use CustomerBuyGoodsOnline for a Till number
        "Amount": body.amount,
        "PartyA": body.phone,
        "PartyB": SHORTCODE,
        "PhoneNumber": body.phone,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "DukaSmart",
        "TransactionDesc": "Shop payment",
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{BASE}/mpesa/stkpush/v1/processrequest", json=payload, headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    if data.get("ResponseCode") != "0":
        raise HTTPException(400, data.get("errorMessage") or data.get("ResponseDescription") or "M-Pesa request failed")
    checkout_id = data["CheckoutRequestID"]
    payments[checkout_id] = {"status": "pending", "message": "Waiting for the customer", "receipt": None}
    return {"checkout_request_id": checkout_id}


@router.post("/callback")  # public: Safaricom calls this, so it has no login
async def callback(request: Request):
    cb = (await request.json())["Body"]["stkCallback"]
    checkout_id, code = cb["CheckoutRequestID"], int(cb["ResultCode"])
    if code == 0:
        items = {i["Name"]: i.get("Value") for i in cb["CallbackMetadata"]["Item"]}
        payments[checkout_id] = {"status": "success", "message": "Paid", "receipt": items.get("MpesaReceiptNumber")}
    else:
        status = "cancelled" if code == 1032 else "timeout" if code == 1037 else "failed"
        payments[checkout_id] = {"status": status, "message": cb["ResultDesc"], "receipt": None}
    return {"ResultCode": 0, "ResultDesc": "Accepted"}


@router.get("/status/{checkout_id}")
async def status(checkout_id: str, user=Depends(get_current_user)):
    payment = payments.get(checkout_id)
    if not payment:
        raise HTTPException(404, "Unknown payment")
    return payment
```

## Result codes Safaricom sends in the callback
| ResultCode | Meaning | Frontend status |
|---|---|---|
| 0 | Paid | success |
| 1 | Not enough M-Pesa balance | failed |
| 1032 | Customer cancelled the prompt | cancelled |
| 1037 | Customer did not respond in time | timeout |
| 2001 | Wrong PIN | failed |

The text in `ResultDesc` is shown to the cashier as it is.

## If the callback never arrives
Safaricom also offers a query endpoint, `POST /mpesa/stkpushquery/v1/query`, which takes `BusinessShortCode`, `Password`, `Timestamp` and `CheckoutRequestID`. You can call it from the `status` endpoint when a payment is still `pending` after about 20 seconds. The frontend also has a manual "Mark as paid" fallback for the cashier.

## Things to know
- **Sandbox:** the sandbox does not send a real prompt to a real phone. To see the full flow on a phone you need a live Paybill or Till number, which Safaricom approves through their go-live process. Until then, the frontend's demo mode (`VITE_USE_API=false`) shows the whole flow for your presentation.
- **Security:** the Safaricom keys stay on the server. Consider checking that callbacks come from Safaricom (for example a secret token in the callback URL), and ignore a callback you have already processed.
- **Amount:** Daraja takes whole shillings, so round the total.
- **Record the receipt:** save `receipt` with the sale (for example an `mpesa_receipt` column) so each M-Pesa sale can be matched to the customer's SMS.
