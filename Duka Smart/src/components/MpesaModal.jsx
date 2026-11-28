import { useEffect, useRef, useState } from "react";
import { mpesaApi } from "../services/mpesa";
import { USE_API } from "../services/api";
import { toWhatsAppNumber } from "../whatsapp";
import { kes } from "../utils";
import "../mpesa.css";

const WAIT_SECONDS = 90; // how long we wait for the customer to enter their PIN

// Asks the customer's phone for payment, waits for the result, then calls onPaid(receipt)
export default function MpesaModal({ amount, onPaid, onClose }) {
  const [phone, setPhone] = useState(() => localStorage.getItem("mpesaPhone") || "");
  const [step, setStep] = useState("phone"); // phone -> waiting -> failed
  const [checkoutId, setCheckoutId] = useState(null);
  const [message, setMessage] = useState("");
  const [left, setLeft] = useState(WAIT_SECONDS);
  const [busy, setBusy] = useState(false);
  const done = useRef(false); // makes sure onPaid runs only once

  const number = toWhatsAppNumber(phone); // 2547XXXXXXXX
  const valid = /^254[17]\d{8}$/.test(number);

  const paid = (receipt) => {
    if (done.current) return;
    done.current = true;
    onPaid(receipt);
  };
  const fail = (text) => {
    setMessage(text);
    setStep("failed");
  };

  const send = async (e) => {
    e.preventDefault();
    if (!valid) return setMessage("Enter a valid Safaricom number, for example 0712 345 678.");
    localStorage.setItem("mpesaPhone", phone);
    setBusy(true);
    setMessage("");
    try {
      if (USE_API) setCheckoutId(await mpesaApi.push({ phone: number, amount }));
      setLeft(WAIT_SECONDS);
      setStep("waiting");
    } catch (err) {
      setMessage(err.message);
    }
    setBusy(false);
  };

  // While waiting: count down, and (with the backend) ask for the result every 3 seconds
  useEffect(() => {
    if (step !== "waiting") return;
    const tick = setInterval(() => setLeft((l) => l - 1), 1000);
    let poll;
    if (USE_API) {
      poll = setInterval(async () => {
        try {
          const s = await mpesaApi.status(checkoutId);
          if (s.status === "success") paid(s.receipt);
          else if (s.status !== "pending") fail(s.message || "The payment did not go through.");
        } catch {
          /* a network blip: try again on the next round */
        }
      }, 3000);
    }
    return () => { clearInterval(tick); clearInterval(poll); };
  }, [step, checkoutId]);

  useEffect(() => {
    if (step === "waiting" && left <= 0) fail("No response from the customer. The prompt timed out.");
  }, [left, step]);

  const manual = () => {
    if (window.confirm("Only continue if you have seen the M-Pesa confirmation message. Mark this sale as paid?")) paid("manual");
  };

  return (
    <div className="overlay" onClick={step === "waiting" ? undefined : onClose}>
      <div className="card modal mpesa" onClick={(e) => e.stopPropagation()}>
        {step === "phone" && (
          <form onSubmit={send}>
            <h2>M-Pesa payment</h2>
            <p className="muted">Amount to pay</p>
            <p className="total">{kes(amount)}</p>
            {message && <div className="banner">{message}</div>}
            <label>Customer's M-Pesa number
              <input type="tel" autoFocus placeholder="07xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <div className="actions">
              <button type="button" className="btn out" onClick={onClose}>Cancel</button>
              <button className="btn" disabled={busy}>{busy ? "Sending..." : "Send payment prompt"}</button>
            </div>
          </form>
        )}

        {step === "waiting" && (
          <>
            <div className="emoji">📲</div>
            <h2>Waiting for payment</h2>
            <p className="muted">A prompt for <b>{kes(amount)}</b> was sent to {phone}. Ask the customer to enter their M-Pesa PIN.</p>
            <div className="count">{Math.max(left, 0)}s</div>

            {!USE_API && (
              <>
                <p className="muted tiny">Demo mode: no real prompt is sent. Choose what the customer does.</p>
                <div className="demo">
                  <button className="btn" onClick={() => paid("DEMO" + Math.random().toString(36).slice(2, 8).toUpperCase())}>Customer paid</button>
                  <button className="btn out" onClick={() => fail("The customer cancelled the payment.")}>Customer cancelled</button>
                </div>
              </>
            )}

            <p className="muted tiny">
              Customer already paid but nothing happened? <button className="link" onClick={manual}>Mark as paid</button>
            </p>
            <div className="actions"><button className="btn out" onClick={onClose}>Cancel payment</button></div>
          </>
        )}

        {step === "failed" && (
          <>
            <div className="emoji" style={{ animation: "none" }}>⚠️</div>
            <h2>Payment not completed</h2>
            <div className="banner">{message}</div>
            <div className="actions">
              <button className="btn out" onClick={onClose}>Close</button>
              <button className="btn" onClick={() => { setMessage(""); setStep("phone"); }}>Try again</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
