import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const FEATURES = [
  {
    title: "Real-time inventory",
    text: "Know what is in stock, what is running low and what to reorder, instantly.",
    icon: <Icon><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" /></Icon>,
  },
  {
    title: "Effortless sales",
    text: "Record a sale in seconds with cash, M-Pesa or card.",
    icon: <Icon><path d="M4 6h16l-1.5 9h-13L4 6zM4 6L3 3H1M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z" /></Icon>,
  },
  {
    title: "Expenses and profit",
    text: "Log rent, transport and stock costs. See your true profit.",
    icon: <Icon><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6" /></Icon>,
  },
  {
    title: "Low-stock alerts",
    text: "Get a message before the shelf is empty, not after.",
    icon: <Icon><path d="M6 17V11a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4" /></Icon>,
  },
];

const STEPS = [
  { title: "Add your products", text: "Type them in, or scan barcodes with your phone." },
  { title: "Record every sale", text: "Cash, M-Pesa or card. Stock goes down automatically." },
  { title: "See your real profit", text: "Sales, costs and expenses in one clear number, every day." },
];

const STATS = [
  ["5 min", "to set up your first shop"],
  ["3 ways", "to pay: cash, M-Pesa, card"],
  ["Live", "stock count after every sale"],
  ["1 click", "to see your daily profit"],
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// an original illustration: a corner shop, a shelf of goods and two shopkeepers
function ShopArt() {
  return (
    <svg className="lp-art" viewBox="0 0 520 400" role="img" aria-label="Two shopkeepers behind the counter of a small shop">
      <rect width="520" height="400" rx="28" fill="#d9f1e4" />
      <rect x="28" y="70" width="464" height="330" fill="#eaf8f0" />
      {/* awning */}
      <g>
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M${28 + i * 58} 22h58v34a29 29 0 01-58 0z`} fill={i % 2 ? "#ffffff" : "#12805c"} />
        ))}
        <rect x="28" y="14" width="464" height="12" rx="4" fill="#0b3d2e" />
      </g>
      {/* shelves */}
      <rect x="52" y="140" width="416" height="6" rx="3" fill="#b9dcc9" />
      <rect x="52" y="210" width="416" height="6" rx="3" fill="#b9dcc9" />
      {/* top shelf goods */}
      <rect x="66" y="104" width="30" height="36" rx="4" fill="#12805c" />
      <rect x="74" y="94" width="14" height="12" rx="3" fill="#3eb489" />
      <rect x="108" y="112" width="26" height="28" rx="4" fill="#3eb489" />
      <rect x="146" y="100" width="24" height="40" rx="8" fill="#f2a93b" />
      <rect x="152" y="90" width="12" height="12" rx="3" fill="#0b3d2e" />
      <rect x="182" y="110" width="34" height="30" rx="4" fill="#0b3d2e" />
      <rect x="360" y="108" width="28" height="32" rx="4" fill="#d9482b" />
      <rect x="398" y="98" width="22" height="42" rx="8" fill="#3eb489" />
      <rect x="430" y="112" width="28" height="28" rx="4" fill="#f2a93b" />
      {/* second shelf goods */}
      <rect x="66" y="176" width="34" height="34" rx="4" fill="#0b3d2e" />
      <rect x="112" y="184" width="30" height="26" rx="4" fill="#12805c" />
      <rect x="154" y="170" width="22" height="40" rx="8" fill="#3eb489" />
      <rect x="360" y="180" width="34" height="30" rx="4" fill="#f2a93b" />
      <rect x="406" y="172" width="22" height="38" rx="8" fill="#12805c" />
      <rect x="438" y="184" width="24" height="26" rx="4" fill="#3eb489" />
      {/* till screen */}
      <rect x="64" y="236" width="124" height="86" rx="8" fill="#ffffff" stroke="#0b3d2e" strokeWidth="4" />
      <rect x="82" y="284" width="14" height="24" rx="2" fill="#3eb489" />
      <rect x="104" y="268" width="14" height="40" rx="2" fill="#12805c" />
      <rect x="126" y="276" width="14" height="32" rx="2" fill="#3eb489" />
      <rect x="148" y="256" width="14" height="52" rx="2" fill="#12805c" />
      {/* shopkeeper 1: taller, green dotted top, amber head wrap */}
      <g>
        <path d="M222 340c0-52 30-84 70-84s70 32 70 84z" fill="#12805c" />
        {[[250, 300], [280, 284], [312, 296], [334, 318], [262, 328], [296, 322]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#d9f1e4" />
        ))}
        <rect x="278" y="236" width="28" height="30" rx="12" fill="#5b3524" />
        <ellipse cx="292" cy="216" rx="34" ry="38" fill="#6b3f2a" />
        <path d="M252 206c2-30 20-46 42-46s40 14 42 44c-18-14-34-20-42-20s-26 6-42 22z" fill="#f2a93b" />
        <path d="M262 190c14-10 30-12 44-6" stroke="#fdecc8" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="278" cy="218" r="3.2" fill="#0b3d2e" />
        <circle cx="306" cy="218" r="3.2" fill="#0b3d2e" />
        <path d="M276 232c8 9 22 9 30 0" stroke="#0b3d2e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="254" cy="226" r="4" fill="#f2a93b" />
        <circle cx="330" cy="226" r="4" fill="#f2a93b" />
      </g>
      {/* shopkeeper 2: amber top, dark green cap */}
      <g>
        <path d="M372 340c0-40 22-66 52-66s52 26 52 66z" fill="#f2a93b" />
        {[[396, 306], [424, 292], [452, 308], [410, 330], [440, 328]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.6" fill="#fdecc8" />
        ))}
        <rect x="414" y="250" width="22" height="26" rx="10" fill="#3b2216" />
        <ellipse cx="425" cy="232" rx="28" ry="31" fill="#4a2c1b" />
        <path d="M396 226c0-24 14-36 30-36s30 12 30 34c-10-8-20-12-30-12s-20 4-30 14z" fill="#0b3d2e" />
        <rect x="428" y="200" width="42" height="12" rx="6" fill="#0b3d2e" />
        <circle cx="414" cy="234" r="2.8" fill="#ffffff" />
        <circle cx="436" cy="234" r="2.8" fill="#ffffff" />
        <path d="M414 246c6 7 16 7 22 0" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      {/* counter */}
      <rect x="28" y="326" width="464" height="14" rx="4" fill="#f2c477" />
      <rect x="28" y="340" width="464" height="60" fill="#12805c" />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={44 + i * 28} y="346" width="6" height="54" fill="#0e6b4d" />
      ))}
      {/* plant */}
      <rect x="468" y="298" width="20" height="28" rx="4" fill="#b9733a" />
      <path d="M478 298c-10-14-8-26-2-34 8 8 12 20 2 34zM478 298c10-12 20-14 28-10-6 10-16 16-28 10z" fill="#12805c" />
    </svg>
  );
}

function Landing() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-in">
          <Link to="/" className="lp-logo">
            <img src={logo} alt="" width="34" height="34" />
            <span>Duka<b>Smart</b></span>
          </Link>
          <nav className="lp-links" aria-label="Page sections">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#start">Pricing</a>
            <a href="#stories">Stories</a>
          </nav>
          <div className="lp-nav-act">
            <Link to="/login" className="lp-login">Log in</Link>
            <Link to="/register" className="lp-btn lp-btn-sm">Start free</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-wrap lp-hero">
          <div className="lp-hero-text">
            <span className="lp-eyebrow">Built for shop owners across Africa</span>
            <h1>Know your stock.<br /><em>Grow your shop.</em></h1>
            <p className="lp-lead">
              DukaSmart helps you track stock, record sales and expenses, and see your profit, all from your phone or computer. You also get an alert before you run out.
            </p>
            <div className="lp-cta">
              <Link to="/register" className="lp-btn">Start managing for free <Arrow /></Link>
              <a href="#how" className="lp-btn lp-btn-ghost">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 5l11 7-11 7z" /></svg>
                See how it works
              </a>
            </div>
            <div className="lp-proof">
              <span className="lp-dots" aria-hidden="true">
                <i style={{ background: "#6b3f2a" }} /><i style={{ background: "#f2a93b" }} /><i style={{ background: "#12805c" }} /><i style={{ background: "#4a2c1b" }} />
              </span>
              <span><b>Made for small shops like yours</b></span>
            </div>
          </div>

          <div className="lp-hero-art">
            <ShopArt />
            <div className="lp-float lp-float-low">
              <span className="lp-float-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l9 16H3L12 4zM12 10v4M12 17h.01" /></svg>
              </span>
              <span><b>Sugar 1kg is running low</b><small>4 left · reorder at 25</small></span>
            </div>
            <div className="lp-float lp-float-sales">
              <span className="lp-float-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
              </span>
              <span><small>Today's sales</small><b className="lp-float-big">KES 48,250</b></span>
              <em>+12%</em>
            </div>
          </div>
        </section>

        <section className="lp-wrap lp-stats" aria-label="At a glance">
          {STATS.map(([big, small]) => (
            <div key={big}>
              <strong>{big}</strong>
              <span>{small}</span>
            </div>
          ))}
        </section>

        <section id="features" className="lp-wrap lp-section">
          <span className="lp-eyebrow plain">Everything in one place</span>
          <h2>Run your shop with <em>confidence</em></h2>
          <p className="lp-sub">From the shelf to the counter, you see what you have, what you sold and what you earned.</p>
          <div className="lp-cards">
            {FEATURES.map((f) => (
              <article className="lp-card" key={f.title}>
                <span className="lp-card-ic">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <Link to="/register" className="lp-more">Learn more →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-wrap lp-two">
          <div id="stories" className="lp-quote">
            <span className="lp-quote-ava" aria-hidden="true">
              <svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="#b7ead3" /><path d="M16 128c0-34 20-52 48-52s48 18 48 52z" fill="#12805c" /><ellipse cx="64" cy="58" rx="22" ry="25" fill="#6b3f2a" /><path d="M38 52c2-20 14-30 27-30s25 9 26 28c-10-9-20-12-27-12s-17 4-26 14z" fill="#f2a93b" /><circle cx="56" cy="60" r="2.5" fill="#0b3d2e" /><circle cx="73" cy="60" r="2.5" fill="#0b3d2e" /><path d="M55 70c6 6 16 6 20 0" stroke="#0b3d2e" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>
            </span>
            <div>
              <blockquote>"I knew when sugar was running low before a customer asked. Now I end every day knowing my profit."</blockquote>
              <cite>Sample testimonial<small>Replace with a real shop owner and a real photo</small></cite>
            </div>
          </div>

          <div id="how">
            <span className="lp-eyebrow plain">How it works</span>
            <ol className="lp-steps">
              {STEPS.map((st, i) => (
                <li key={st.title}>
                  <span className="lp-num">{i + 1}</span>
                  <div>
                    <h3>{st.title}</h3>
                    <p>{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="start" className="lp-wrap">
          <div className="lp-banner">
            <div>
              <h2>Ready to take control<br />of your stock?</h2>
              <p>Free to start. No card needed.</p>
            </div>
            <Link to="/register" className="lp-btn lp-btn-light">Start managing for free <Arrow /></Link>
          </div>
        </section>
      </main>

      <footer className="lp-wrap lp-foot">
        <span className="lp-logo">
          <img src={logo} alt="" width="30" height="30" />
          <span>Duka<b>Smart</b></span>
        </span>
        <span className="lp-foot-note">DukaSmart · Smart Business Management System · Final year project</span>
      </footer>
    </div>
  );
}

export default Landing;
