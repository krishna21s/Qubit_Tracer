// Base URL (configure via .env if possible)
const API_BASE =
  // import.meta.env.VITE_API_URL || "http://35.207.194.112:5000"; // 4gb gc-ram
  // import.meta.env.VITE_API_URL || "https://qubit-tracer.onrender.com";
import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// ---------------------------
// Simulate Circuit API
// ---------------------------
export async function simulateCircuit(payload) {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Simulation failed");
  }
  return res.json();
}

// ---------------------------
// Ask Query (Chatbot)
// ---------------------------
export async function askQuery(query, top_k = 5) {
  if (!query.trim()) throw new Error("Query is empty");

  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Chatbot query failed");
  }
  return res.json();
}

// ---------------------------
// Reindex Data for RAG
// ---------------------------
export async function reindexData() {
  const res = await fetch(`${API_BASE}/reindex`, {
    method: "POST",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Reindexing failed");
  }
  return res.json();
}

// ---------------------------
// Voice Assistant
// ---------------------------
export async function voiceAssist(query) {
  if (!query.trim()) throw new Error("Query is empty");

  const res = await fetch(`${API_BASE}/voice-assist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Voice assistant failed");
  }

  return res.json();
}

// ---------------------------
// NEW: Analyze Simulation Result
// ---------------------------
export async function analyzeSimulation(simulationResult) {
  if (!simulationResult) throw new Error("Missing simulation result");
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result: simulationResult }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Analysis failed");
  }
  return res.json(); // { analysis: string }
}
