import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card" style={{ maxWidth: 520, textAlign: "center", margin: "40px auto" }}>
      <div style={{ fontSize: 56 }}>🔎</div>
      <h1>Page not found</h1>
      <p className="muted" style={{ margin: "8px 0 18px" }}>We could not find the page you were looking for. It may have been moved or the address is wrong.</p>
      <Link className="btn" to="/">Back to dashboard</Link>
    </div>
  );
}
