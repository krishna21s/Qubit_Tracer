// utils/speech.js
let indianMaleVoice = null;

const initVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  // Try to find a specific deep/natural voice, fallback to system default
  indianMaleVoice = voices.find(
    (v) =>
      v.name.includes("Microsoft Prabhat") || // Common on Windows
      v.name.includes("Google US English") ||
      (v.lang === "en-IN" && !v.name.toLowerCase().includes("neerja"))
  );
};

// Init immediately and on change
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = initVoices;
}
initVoices();

export function speak(text, onEndCallback) {
  if (!text) return;
  cancelSpeak(); // Safety clear

  const msg = new SpeechSynthesisUtterance(text);
  if (indianMaleVoice) msg.voice = indianMaleVoice;

  // Tuned for a "Copilot" conversational pace
  msg.rate = 1.1;
  msg.pitch = 1.0;

  msg.onend = () => {
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(msg);
}

export function cancelSpeak() {
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.warn("TTS Cancel failed", e);
  }
}

export function isSpeaking() {
  return window.speechSynthesis.speaking;
}
