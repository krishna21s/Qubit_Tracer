import React, { useRef, useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
// import VisualAssistPanel from "./VisualAssistPanel"; // <- Unused, relying on Card
import { useVisualAssist } from "../../context/VisualAssistContext";
import VisualAssistCard from "./VisualAssistCard";

export default function VisualAssistButton() {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const { setIsVisionActive } = useVisualAssist();

  // The function to stop the stream and clean up state
  const stopShare = (reason) => {
    if (stream) {
      console.log("Sharing stopped. Reason:", reason);
      stream.getTracks().forEach((t) => t.stop());
    }

    setStream(null);
    setOpen(false);
    setIsVisionActive(false); // ❌ TURN OFF GLOW
    // Optionally notify the user via a temporary status message if needed
  };

  // Function to check if the stream selected is only the browser tab
  const validateStream = (s) => {
    const track = s.getVideoTracks()[0];
    const settings = track.getSettings();

    // If the browser provides displaySurface info, we check it
    if (settings.displaySurface && settings.displaySurface !== "browser") {
      console.warn("User selected a Window or Screen.");
      return false;
    }

    // If the stream is confirmed (or validation is unavailable), attach handler
    track.onended = () => {
      stopShare("Sharing stopped by user or browser.");
    };

    return true;
  };

  async function startShare() {
    if (stream) return; // Prevent double click

    try {
      // 1. ATTEMPT TO RESTRICT THE OPTIONS
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser", // Hint: prefer tabs
        },
        audio: false, // We use Web Speech API in VisualAssistCard, not stream audio
        preferCurrentTab: true, // Hint: pre-select the current tab (Chrome)
        selfBrowserSurface: "include", // Ensure current tab is shareable
      });

      // 2. VALIDATION CHECK
      if (!validateStream(s)) {
        // If validation fails (e.g., they picked a desktop), immediately stop the stream
        s.getTracks().forEach((t) => t.stop());
        alert(
          "Please select ONLY the 'Qubit Tracer' tab, not your entire screen or another window."
        );
        return;
      }

      // 3. SUCCESSFUL START
      setStream(s);
      setIsVisionActive(true); // 🌈 TURN ON GLOW

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }

      setOpen(true);
    } catch (err) {
      console.error("Screen sharing failed:", err);
      // 8 is AbortError (often user cancellation)
      if (err.name !== "NotAllowedError" && err.code !== 8) {
        alert("Screen sharing cancelled or failed. Check permissions.");
      }
    }
  }

  // --- 4. THE MAGIC: KILL SWITCH on Tab Change ---
  useEffect(() => {
    // We only add the listener when the stream is active
    if (!stream) return;

    const handleVisibilityChange = () => {
      // Check if the page is hidden AND we have an active stream
      if (document.visibilityState === "hidden" && stream) {
        stopShare("Sharing stopped: Switched tabs.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup: remove the event listener when the component unmounts or stream stops
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stream]); // Re-run effect whenever stream changes (starts/stops)

  function toggleAssist() {
    if (!stream) startShare();
    else stopShare("Button clicked.");
  }

  // Note: The VisualAssistCard uses the ref'd video stream to capture screenshots
  return (
    <>
      <div style={{ display: "inline-flex", flexDirection: "column" }}>
        <div data-va-trigger="button">
          <Tooltip
            title={stream ? "Stop Quantum Vision" : "Start Quantum Vision"}
            placement="left"
          >
            <IconButton
              onClick={toggleAssist}
              color="secondary"
              size="large"
              sx={{
                backgroundColor: "rgba(15, 23, 42, 0.88)",
                color: "#f8fafc",
                boxShadow: "0 10px 28px rgba(15,23,42,0.45)",
                border: "1px solid rgba(148,163,184,0.35)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "transform .18s ease, box-shadow .2s ease",
                '&:hover': {
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 32px rgba(15,23,42,0.55)",
                },
              }}
            >
              <VisibilityRoundedIcon />
            </IconButton>
          </Tooltip>
        </div>

        {/* Hidden video element used as a canvas source for captureFrameToDataUrl */}
        <video ref={videoRef} style={{ display: "none" }} playsInline></video>

        {/* Only render card when stream is active */}
        {open && <VisualAssistCard onClose={stopShare} />}
      </div>
    </>
  );
}
