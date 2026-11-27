// shows a loading line or an error line at the top of a page
function Status({ loading, error }) {
  if (error) return <p className="auth-error" style={{ margin: "0 0 16px" }}>{error}</p>;
  if (loading) return <p className="dash-sub" style={{ margin: "0 0 16px" }}>Loading...</p>;
  return null;
}

export default Status;
