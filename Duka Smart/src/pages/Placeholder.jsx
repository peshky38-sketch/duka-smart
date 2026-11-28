import { useParams } from "react-router-dom";

// Expenses, Reports etc. come in later tasks (SBRR-23 to SBRR-25)
export default function Placeholder() {
  const { page } = useParams();
  return (
    <div className="top">
      <div>
        <h1 style={{ textTransform: "capitalize" }}>{page}</h1>
        <p className="muted">Coming soon.</p>
      </div>
    </div>
  );
}
