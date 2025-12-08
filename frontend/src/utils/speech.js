// utils/speech.js
let indianMaleVoice = null;

const initVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  // Try to find a specific deep/natural voice, fallback to system default
  indianMaleVoice = voices.find(
    (v) =>
      v.name.includes("Microsoft Guy Online (Natural)") 
      // v.name.includes("Microsoft Prabhat Online (Natural)") 
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
  msg.rate = 1.0;
  msg.pitch = 1.35;

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
