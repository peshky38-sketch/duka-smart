import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

// Opens the camera and reads a barcode. Calls onDetected(code) once, then stops the camera.
// Browsers only allow the camera on https:// pages or on localhost.
export default function BarcodeScanner({ onDetected, onClose }) {
  const video = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let controls = null;
    let stopped = false;
    let found = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints({ video: { facingMode: "environment" } }, video.current, (result, _err, c) => {
        if (result && !found) {
          found = true;
          c.stop();
          onDetected(result.getText());
        }
      })
      .then((c) => {
        controls = c;
        if (stopped) c.stop();
      })
      .catch(() => setError("Could not open the camera. Allow camera access in your browser, and use https or localhost."));

    return () => { stopped = true; controls?.stop(); };
  }, []);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card modal" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <h2>Scan a barcode</h2>
        {error ? (
          <div className="banner">{error}</div>
        ) : (
          <>
            <video ref={video} playsInline muted style={{ width: "100%", borderRadius: 12, background: "#000", marginTop: 12 }} />
            <p className="muted" style={{ marginTop: 10 }}>Hold the barcode steady in front of the camera.</p>
          </>
        )}
        <div className="actions"><button type="button" className="btn out" onClick={onClose}>Cancel</button></div>
      </div>
    </div>
  );
}
