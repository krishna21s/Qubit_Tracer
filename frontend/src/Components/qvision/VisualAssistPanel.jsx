import React, { useState } from "react";
import { captureFrameToDataUrl } from "../../utils/CaptureUtils";
import { visionAsk } from "../../utils/api";
import { speak } from "../../utils/speech";

export default function VisualAssistPanel({ videoRef, onClose }) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // AUTO SCREENSHOT
  function captureScreenshot() {
    try {
      return captureFrameToDataUrl(videoRef.current, 1024, 0.85);
    } catch (e) {
      alert("Screenshot capture failed");
      return null;
    }
  }

  async function handleAskAI() {
    if (!chatInput.trim()) return;

    // USER MESSAGE
    setChatMessages((msgs) => [...msgs, { role: "user", text: chatInput }]);

    // Auto Capture
    const screenshot = captureScreenshot();
    if (!screenshot) return;

    try {
      const response = await visionAsk(screenshot, chatInput);

      // AI MESSAGE
      setChatMessages((msgs) => [
        ...msgs,
        { role: "assistant", text: response.answer },
      ]);

      // Voice Speak
      speak(response.answer);

      setChatInput("");
    } catch (err) {
      alert("Vision Ask failed: " + err.message);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        top: 80,
        width: 350,
        background: "#fff",
        padding: 12,
        borderRadius: 10,
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        height: "80vh",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Visual Assist</strong>
        <button
          onClick={onClose}
          style={{ border: 0, background: "transparent", fontSize: 18 }}
        >
          ✕
        </button>
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          marginTop: 10,
          flex: 1,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#e8f0fe" : "#f1eaff",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <strong>{msg.role === "user" ? "You:" : "AI:"}</strong>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>

      {/* INPUT BOX */}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask AI about your screen..."
        />

        <button onClick={handleAskAI}>Ask</button>
      </div>
    </div>
  );
}
