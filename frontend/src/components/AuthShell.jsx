import { useState } from "react";
import logo from "../assets/logo.svg";
import "./AuthShell.css";

// the sign-in pages are the front of a shop: an awning, a Karibu sign, crates and shelves, and the form on the counter
function Crate() {
  const tomatoes = [[34, 40], [62, 36], [90, 40], [118, 36], [146, 40], [48, 58], [78, 56], [108, 58], [136, 56]];
  return (
    <svg className="au-crate" viewBox="0 0 190 150" aria-hidden="true">
      {tomatoes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="15" fill={i % 3 === 1 ? "#f2a93b" : "#e5533d"} />
          <path d={"M" + (x - 5) + " " + (y - 13) + "l5 4 5-4" } fill="none" stroke="#3f8f4e" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      <rect x="10" y="62" width="170" height="82" rx="6" fill="#c8955a" />
      <path d="M10 88h170M10 114h170" stroke="#a97742" strokeWidth="3" />
      <rect x="10" y="62" width="170" height="10" rx="4" fill="#d9a96c" />
      <rect x="22" y="136" width="14" height="10" fill="#a97742" /><rect x="154" y="136" width="14" height="10" fill="#a97742" />
    </svg>
  );
}

function Shelf() {
  return (
    <svg className="au-shelf" viewBox="0 0 220 190" aria-hidden="true">
      <rect x="6" y="64" width="208" height="9" rx="3" fill="#b98550" />
      <rect x="6" y="128" width="208" height="9" rx="3" fill="#b98550" />
      <rect x="14" y="73" width="7" height="116" fill="#a97742" /><rect x="199" y="73" width="7" height="116" fill="#a97742" />
      {/* top shelf: jars and a tin */}
      <rect x="28" y="28" width="30" height="36" rx="5" fill="#f4d58d" /><rect x="31" y="22" width="24" height="8" rx="2" fill="#12805c" />
      <rect x="66" y="22" width="30" height="42" rx="5" fill="#f6b7a4" /><rect x="69" y="16" width="24" height="8" rx="2" fill="#12805c" />
      <rect x="106" y="34" width="44" height="30" rx="4" fill="#3eb489" /><rect x="106" y="34" width="44" height="9" fill="#12805c" />
      <circle cx="178" cy="46" r="18" fill="#e9eef0" /><circle cx="178" cy="46" r="11" fill="#c9d6dc" />
      {/* middle shelf: bread and packets */}
      <ellipse cx="52" cy="112" rx="28" ry="16" fill="#d9a15c" /><path d="M36 106q16-8 32 0" fill="none" stroke="#b9803f" strokeWidth="3" strokeLinecap="round" />
      <rect x="92" y="84" width="30" height="44" rx="3" fill="#ffffff" /><rect x="92" y="96" width="30" height="14" fill="#e5533d" />
      <rect x="128" y="90" width="30" height="38" rx="3" fill="#ffffff" /><rect x="128" y="100" width="30" height="12" fill="#5b9bd5" />
      <rect x="166" y="94" width="30" height="34" rx="3" fill="#f2a93b" />
    </svg>
  );
}

function Plant() {
  return (
    <svg className="au-plant" viewBox="0 0 90 130" aria-hidden="true">
      <path d="M45 92C20 80 14 46 22 18c22 8 30 36 23 74z" fill="#3eb489" />
      <path d="M45 92C70 78 78 44 66 14c-22 10-28 38-21 78z" fill="#12805c" />
      <path d="M45 92C44 70 46 44 52 26" stroke="#0b3d2e" strokeWidth="2" fill="none" />
      <path d="M22 92h46l-6 36H28z" fill="#d9774f" />
    </svg>
  );
}

function AuthShell({ children, wide = false }) {
  return (
    <div className="au-page">
      <div className="au-awning" aria-hidden="true" />
      <div className="au-sign" aria-hidden="true">
        <span className="string l" /><span className="string r" />
        <div className="board"><small>Karibu</small><strong>OPEN</strong></div>
      </div>

      <div className="au-decor" aria-hidden="true">
        <div className="au-left">
          <div className="au-chalk">
            <b>Today</b>
            <span>Unga <i>• • •</i></span>
            <span>Sukari <i>• • •</i></span>
            <span>Maziwa <i>• •</i></span>
          </div>
          <Crate />
        </div>
        <div className="au-right">
          <Plant />
          <Shelf />
        </div>
      </div>

      <main className="au-main">
        <div className={wide ? "au-box wide" : "au-box"}>
          <div className="au-logo">
            <img src={logo} alt="" width="44" height="44" />
            <span>Duka<b>Smart</b></span>
          </div>
          {children}
        </div>
        <p className="au-foot">Know your stock. Grow your shop.</p>
      </main>
      <div className="au-counter" aria-hidden="true" />
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
