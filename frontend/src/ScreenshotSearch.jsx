import React, { useEffect, useRef, useState } from "react";

const GEMINI_URL = "https://gemini.google.com/app";

export default function ScreenshotSearch() {
  const [capturing, setCapturing] = useState(false);
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const startCapture = async () => {
    setError("");
    setStatus("");
    setSelection(null);
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen capture is not supported in this browser. Use the screenshot upload option instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false
      });
      streamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      videoRef.current = video;
      setCapturing(true);
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setCapturing(false);
        setSelection(null);
      });
    } catch (captureError) {
      if (captureError.name !== "NotAllowedError") setError(captureError.message || "Could not capture this tab.");
    }
  };

  const stopCapture = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    videoRef.current = null;
    setCapturing(false);
  };

  const pointerStart = (event) => {
    if (event.target.closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
    startRef.current = { x, y };
    setSelection({ x, y, width: 0, height: 0 });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event) => {
    if (!startRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
    const start = startRef.current;
    setSelection({ x: Math.min(start.x, x), y: Math.min(start.y, y), width: Math.abs(x - start.x), height: Math.abs(y - start.y) });
  };

  const pointerEnd = () => {
    if (!startRef.current) return;
    startRef.current = null;
    setSelection((current) => current && current.width > 12 && current.height > 12 ? current : null);
  };

  const searchSelection = async () => {
    if (!selection || !videoRef.current) return;
    const video = videoRef.current;
    const overlay = document.getElementById("quantum-screenshot-selection");
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scaleX = video.videoWidth / viewportWidth;
    const scaleY = video.videoHeight / viewportHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(selection.width * scaleX);
    canvas.height = Math.round(selection.height * scaleY);
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Could not prepare the selected screenshot.");
      return;
    }
    if (overlay) overlay.style.visibility = "hidden";
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    context.drawImage(
      video,
      Math.round(selection.x * scaleX),
      Math.round(selection.y * scaleY),
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    if (overlay) overlay.style.visibility = "visible";
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Could not create the selected screenshot.");
        return;
      }
      try {
        if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
          throw new Error("Image clipboard access is unavailable. Please use the download option.");
        }
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setStatus("Screenshot copied. Paste it into Gemini with Ctrl+V.");
      } catch (clipboardError) {
        setError(clipboardError.message || "Clipboard access was blocked. Download the screenshot instead.");
      }
      stopCapture();
      setSelection(null);
    }, "image/png");
  };

  const downloadSelection = () => {
    if (!selection || !videoRef.current) return;
    const video = videoRef.current;
    const sx = video.videoWidth / window.innerWidth;
    const sy = video.videoHeight / window.innerHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(selection.width * sx);
    canvas.height = Math.round(selection.height * sy);
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, selection.x * sx, selection.y * sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "quantum-explorer-selection.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div style={styles.root}>
      <button type="button" onClick={startCapture} style={styles.start}>
        ▧ SELECT AREA & SEARCH WITH GOOGLE AI
      </button>
      {error && <div role="alert" style={styles.error}>{error}</div>}
      {status && <div role="status" style={styles.status}>{status} <button type="button" onClick={() => window.open(GEMINI_URL, "_blank", "noopener,noreferrer")} style={styles.link}>Open Gemini</button></div>}
      {capturing && <div id="quantum-screenshot-selection" style={styles.overlay}
        onPointerDown={pointerStart} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}>
        <div style={styles.instructions}>DRAG TO SELECT AN AREA · SHARE THIS BROWSER TAB FOR ACCURATE CROPPING</div>
        {selection && <div style={{ ...styles.rect, left: selection.x, top: selection.y, width: selection.width, height: selection.height }} />}
        {selection && selection.width > 12 && selection.height > 12 && <div style={{ ...styles.actions, left: Math.min(selection.x, window.innerWidth - 290), top: Math.min(selection.y + selection.height + 10, window.innerHeight - 95) }}>
          <button type="button" onClick={searchSelection} style={styles.search}>Search this on web ↗</button>
          <button type="button" onClick={downloadSelection} style={styles.download}>Download</button>
          <button type="button" onClick={() => setSelection(null)} style={styles.cancel}>Cancel</button>
        </div>}
        <button type="button" onClick={stopCapture} style={styles.exit}>CANCEL CAPTURE ×</button>
      </div>}
    </div>
  );
}

const styles = {
  root: { display: "flex", flexDirection: "column", gap: ".4rem" },
  start: { width: "100%", padding: ".6rem .7rem", background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.5)", color: "#a5f3fc", fontFamily: "monospace", fontSize: ".64rem", cursor: "pointer" },
  error: { color: "#fecaca", fontSize: ".68rem", lineHeight: 1.5 },
  status: { color: "#a7f3d0", fontSize: ".68rem", lineHeight: 1.5 },
  link: { background: "transparent", border: 0, color: "#67e8f9", textDecoration: "underline", cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, zIndex: 2147483640, cursor: "crosshair", touchAction: "none", background: "rgba(2,6,23,.28)", userSelect: "none" },
  instructions: { position: "absolute", top: "1rem", left: "50%", transform: "translateX(-50%)", padding: ".6rem .9rem", background: "#07111d", border: "1px solid #0e7490", color: "#cffafe", fontFamily: "monospace", fontSize: ".68rem", whiteSpace: "nowrap", pointerEvents: "none" },
  rect: { position: "absolute", border: "2px solid #34d399", background: "rgba(16,185,129,.08)", boxShadow: "0 0 0 9999px rgba(2,6,23,.24)", pointerEvents: "none" },
  actions: { position: "absolute", display: "flex", gap: ".35rem", padding: ".4rem", background: "#07111d", border: "1px solid #0e7490", cursor: "default" },
  search: { background: "#059669", border: "1px solid #34d399", color: "white", padding: ".5rem .65rem", fontSize: ".7rem", cursor: "pointer" },
  download: { background: "#0f172a", border: "1px solid #475569", color: "#cbd5e1", padding: ".5rem .55rem", fontSize: ".7rem", cursor: "pointer" },
  cancel: { background: "transparent", border: "1px solid #475569", color: "#cbd5e1", padding: ".5rem .55rem", fontSize: ".7rem", cursor: "pointer" },
  exit: { position: "absolute", top: "1rem", right: "1rem", background: "#7f1d1d", border: "1px solid #f87171", color: "white", padding: ".55rem .7rem", fontFamily: "monospace", fontSize: ".65rem", cursor: "pointer" }
};
