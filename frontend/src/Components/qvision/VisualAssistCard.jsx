import React, { useEffect, useRef, useState } from "react";
import { visionAsk } from "../../utils/api";
import { captureWebsiteScreenshot } from "../../utils/captureWebsite";
import { speak, cancelSpeak, isSpeaking } from "../../utils/speech";
import { useVisualAssist } from "../../context/VisualAssistContext";

// --- ICONS ---
const IconMic = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconMute = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ff4d4d"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <path d="M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M19 10v2a7 7 0 0 1-2.9 5.69" />
    <path d="M12 19v4" />
    <path d="M8 23h8" />
  </svg>
);
const IconStop = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

export default function VisualAssistCard({ onClose }) {
  const cardRef = useRef(null);
  const pointerRef = useRef(null);
  const recogRef = useRef(null);
  const silenceTimer = useRef(null);

  // Ref tracks "Muted" status for event listeners
  const mutedRef = useRef(true);

  const { setIsVisionActive } = useVisualAssist();

  // --- STATE ---
  const [pos, setPos] = useState(() => {
    const cardW = 320; // smaller, gemini-like footprint
    const x = Math.max(12, Math.round((window.innerWidth - cardW) / 2));
    const y = Math.max(12, window.innerHeight - 160); // bottom-center by default
    return { x, y };
  });
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Microphone is off.");
  const [previewImg, setPreviewImg] = useState(null);

  // Sync Ref
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // --- 1. INITIALIZE SPEECH RECOGNITION ---
  useEffect(() => {
    const WebSpeech =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!WebSpeech) {
      setAiResponse("Browser does not support Speech Recognition.");
      return;
    }

    const rec = new WebSpeech();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const currentResult = e.results[e.results.length - 1];
      const text = currentResult[0].transcript.trim();
      if (!text) return;

      setTranscript(text);
      setStatus("listening");

      // Silence Timer: 1.5s -> Auto Submit
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        // Only submit if mic is active
        if (!mutedRef.current) {
          handleQuerySubmit(text);
        }
      }, 1500);
    };

    rec.onerror = (event) => {
      if (event.error === "not-allowed") {
        setAiResponse("Microphone denied.");
        setMuted(true);
      }
    };

    rec.onend = () => {
      // If system thinks we should be listening, restart the service
      if (!mutedRef.current) {
        try {
          rec.start();
        } catch (err) {}
      } else {
        setStatus("idle");
      }
    };

    recogRef.current = rec;
    return () => {
      if (recogRef.current) recogRef.current.abort();
      cancelSpeak();
    };
  }, []);

  // --- 2. CONTROL MIC STATE ---
  useEffect(() => {
    if (!recogRef.current) return;

    if (muted) {
      recogRef.current.stop();
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    } else {
      try {
        recogRef.current.start();
        setStatus("listening");
        setAiResponse("I'm listening...");
        setTranscript("");
      } catch (e) {
        setStatus("listening");
      }
    }
  }, [muted]);

  // --- 3. MANUAL TOGGLE (The Interruption Logic) ---
  const handleManualToggle = () => {
    if (muted) {
      cancelSpeak();
      setMuted(false);
    } else {
      cancelSpeak();
      setMuted(true);
    }
  };

  // --- 4. HANDLE QUERY (The Loop Protection Logic) ---
  const handleQuerySubmit = async (finalText) => {
    if (!finalText) return;

    setMuted(true);

    setStatus("processing");
    setTranscript(finalText);

    try {
      const imageBase64 = await captureWebsiteScreenshot("#root", 0.7, 1024);
      if (!imageBase64) throw new Error("Capture failed");
      setPreviewImg(imageBase64);

      const res = await visionAsk(imageBase64, finalText);
      const answer = res.answer || "I didn't catch that.";

      setStatus("speaking");
      setAiResponse(answer);

      speak(answer, () => {
        setMuted(false);
        setStatus("listening");
        setTranscript("");
      });
    } catch (err) {
      console.error("Vision Error:", err);
      setAiResponse("Something went wrong.");
      setStatus("idle");
      setMuted(true);
    }
  };

  // --- DRAG LOGIC ---
  function onPointerDown(e) {
    e.preventDefault();
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    pointerRef.current = { sx: clientX, sy: clientY, ox: pos.x, oy: pos.y };
    const onMove = (ev) => {
      if (!pointerRef.current) return;
      const cx = ev.clientX ?? (ev.touches && ev.touches[0].clientX);
      const cy = ev.clientY ?? (ev.touches && ev.touches[0].clientY);
      setPos({
        x: pointerRef.current.ox + (cx - pointerRef.current.sx),
        y: pointerRef.current.oy + (cy - pointerRef.current.sy),
      });
    };
    const onUp = () => {
      pointerRef.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  // --- STYLES (Gemini-like small UI + flowing border) ---
  const statusColorMap = {
    listening: "#4ade80",
    processing: "#c084fc",
    speaking: "#60a5fa",
    idle: "#94a3b8",
  };

  const cardStyle = {
    position: "fixed",
    left: pos.x,
    top: pos.y,
    width: "320px",
    borderRadius: "16px",
    background:
      "linear-gradient(145deg, rgba(16,23,42,0.92), rgba(2,6,23,0.88))",
    backdropFilter: "blur(18px) saturate(140%)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow:
      "0 12px 28px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.02)",
    color: "#e2e8f0",
    zIndex: 10000,
    fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, sans-serif",
    overflow: "hidden",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    cursor: "grab",
    userSelect: "none",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
    minHeight: "40px",
  };

  const btnIconBase = {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "6px",
    width: 30,
    height: 30,
    cursor: "pointer",
    transition: "transform .15s ease, filter .2s ease, box-shadow .2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  };

  const statusPillStyle = {
    marginLeft: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.6px",
    padding: "4px 8px",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.08)",
    color: statusColorMap[status],
  };

  const footerStyle = {
    padding: "8px 10px 10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    position: "relative",
    minHeight: 44,
  };

  const micButtonStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    background: muted
      ? "rgba(255,255,255,0.05)"
      : "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.12))",
    border: muted
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(34,197,94,0.45)",
    color: muted ? "#cbd5e1" : "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform .15s ease, filter .2s ease, box-shadow .2s ease",
    boxShadow: muted ? "none" : "0 6px 14px -6px rgba(34,197,94,0.5)",
  };

  return (
    /* ID REQUIRED FOR SCREENSHOT EXCLUSION */
    <div
      id="visual-assist-card"
      ref={cardRef}
      className="va-card"
      style={cardStyle}
      aria-label="Qubit Vision assistant"
    >
      {/* Flowing Shine Border (Approach A refined: smooth perimeter runner) */}
      <div
        aria-hidden="true"
        className="va-shine-base"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16px",
          padding: "1px",
          background:
            "linear-gradient(90deg, #A07CFE, #FE8FB5, #FFBE7B, #A07CFE) border-box",
          backgroundSize: "250% 100%",
          animation: "vaBaseShift 14s linear infinite",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          opacity: 0.9,
        }}
      />
      <div
        aria-hidden="true"
        className="va-shine-runner"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16px",
          padding: "1px",
          background:
            "conic-gradient(from var(--va-angle, 0deg), rgba(255,255,255,0) 0deg, rgba(255,255,255,0) 338deg, rgba(255,255,255,0.9) 350deg, rgba(255,255,255,0) 360deg) border-box",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          filter: "blur(6px)",
          mixBlendMode: "screen",
          animation: "vaOrbit 6s linear infinite",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}
      <div style={headerStyle} onPointerDown={onPointerDown}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: statusColorMap[status],
              boxShadow:
                status === "listening"
                  ? "0 0 0 2px rgba(74,222,128,.18)"
                  : status === "processing"
                  ? "0 0 0 2px rgba(192,132,252,.18)"
                  : status === "speaking"
                  ? "0 0 0 2px rgba(96,165,250,.18)"
                  : "0 0 0 2px rgba(148,163,184,.18)",
              transition: "all .25s ease",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: ".35px",
              opacity: 0.95,
            }}
          >
            Qubit Vision
          </span>

          <span style={statusPillStyle}>
            {status === "listening" && "LISTENING"}
            {status === "processing" && "PROCESSING"}
            {status === "speaking" && "RESPONDING"}
            {status === "idle" && "IDLE"}
          </span>
        </div>

        {/* STOP/CLOSE BUTTON */}
        <button
          onClick={() => {
            onClose();
            cancelSpeak();
          }}
          style={{
            ...btnIconBase,
            color: "#f87171",
            borderColor: "rgba(239,68,68,0.35)",
          }}
          title="Close Assistant"
          aria-label="Close assistant"
        >
          <IconStop />
        </button>
      </div>

      {/* BODY (Minimal – no AI response, no preview) */}
      <div
        style={{
          padding: "6px 10px",
          minHeight: 8,
        }}
      />

      {/* FOOTER: small mic indicator centered at bottom */}
      <div style={footerStyle}>
        <div
          title={
            muted
              ? "Microphone is off. Tap to unmute."
              : "Microphone is on. Tap to mute."
          }
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          onClick={handleManualToggle}
          style={micButtonStyle}
          onMouseDown={(e) => e.preventDefault()}
        >
          {muted ? <IconMute /> : <IconMic />}
        </div>

        {/* tiny status dot */}
        <div
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "999px",
            background: statusColorMap[status],
            boxShadow:
              status === "speaking"
                ? "0 0 6px rgba(96,165,250,.85)"
                : "0 0 4px rgba(148,163,184,.5)",
            marginLeft: 6,
            opacity: 0.9,
          }}
        />
      </div>

      <style>{`
        /* Animate custom angle for the conic runner */
        @property --va-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        /* Base rainbow border subtle motion */
        @keyframes vaBaseShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 250% 50%; }
        }

        /* Runner glint that orbits the card like Gemini */
        @keyframes vaOrbit {
          0%   { --va-angle: 0deg;   opacity: .5; }
          50%  { --va-angle: 180deg; opacity: .65; }
          100% { --va-angle: 360deg; opacity: .5; }
        }

        .animate-spin { display:inline-block; animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        button:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }
        button:hover { filter: brightness(1.06); }
        button:active { transform: translateY(1px); }

        /* Hover: slightly faster orbit and brighter glint */
        .va-card:hover .va-shine-runner {
          animation-duration: 0.1s;
          opacity: .75;
          filter: blur(5px);
        }
      `}</style>
    </div>
  );
}
