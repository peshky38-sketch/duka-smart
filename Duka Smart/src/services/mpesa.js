// M-Pesa payment prompt (STK push). The backend talks to Safaricom, never the browser,
// because the Safaricom keys must stay secret. See docs/MPESA-BACKEND.md
import { request } from "./api";

export const mpesaApi = {
  // Sends the prompt to the customer's phone. phone looks like 254712345678.
  push: async ({ phone, amount }) =>
    (await request("/api/payments/mpesa/stk-push", { method: "POST", body: { phone, amount } })).checkout_request_id,

  // Returns { status: "pending" | "success" | "failed" | "cancelled" | "timeout", message, receipt }
  status: (checkoutId) => request(`/api/payments/mpesa/status/${checkoutId}`),
};
