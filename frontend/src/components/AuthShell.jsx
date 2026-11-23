import { useState } from "react";
import logo from "../assets/logo.svg";
import mpesa from "../assets/pay/mpesa.svg";
import "./AuthShell.css";

// left: what DukaSmart does, shown as a small picture of the product. right: the form (children).
function AuthShell({ children, wide = false }) {
  return (
    <div className="au-page">
      <aside className="au-show">
        <div className="au-brand">
          <img src={logo} alt="" width="40" height="40" />
          <span>Duka<b>Smart</b></span>
        </div>

        <div className="au-pitch">
          <h1>Know your stock.<br />Grow your shop.</h1>
          <p>Record sales in seconds, get a warning before an item runs out, and see your real profit every day.</p>
        </div>

        <div className="au-stage" aria-hidden="true">
          <div className="au-card c-sales">
            <span className="au-lab">Sales today</span>
            <strong>KES 2,880</strong>
            <span className="au-up">Up 12% on yesterday</span>
            <div className="au-bars">
              {[38, 55, 42, 70, 60, 86, 64].map((h, i) => (
                <i key={i} style={{ height: h + "%" }} className={i === 6 ? "now" : ""} />
              ))}
            </div>
          </div>

          <div className="au-card c-stock">
            <span className="au-dot" />
            <div>
              <strong>Cooking oil 1L</strong>
              <span className="au-lab">2 left, reorder soon</span>
            </div>
          </div>

          <div className="au-card c-pay">
            <img src={mpesa} alt="" />
            <div>
              <strong>KES 425 received</strong>
              <span className="au-lab">Sale #149C5</span>
            </div>
          </div>
        </div>

        <ul className="au-points">
          <li>Stock that updates itself</li>
          <li>Cash, M-Pesa and card</li>
          <li>Works on your phone</li>
        </ul>
      </aside>

      <main className="au-main">
        <div className="au-mobile-brand">
          <img src={logo} alt="" width="32" height="32" />
          <span>Duka<b>Smart</b></span>
        </div>
        <div className={wide ? "au-box wide" : "au-box"}>{children}</div>
      </main>
    </div>
  );
}

// a password box with a show/hide button
export function PasswordField({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="au-pass">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {show && <path d="M4 20L20 4" />}
        </svg>
      </button>
    </div>
  );
}

export default AuthShell;
