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

// ---------------------------
// QLive Preview API helpers
// ---------------------------
async function handleQLiveResponse(res, defaultError = "QLive request failed") {
  if (res.status === 404) {
    const data = await res.json().catch(() => ({}));
    const message = data.error || "QLive preview is disabled";
    const error = new Error(message);
    error.code = "QLIVE_DISABLED";
    throw error;
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: defaultError }));
    throw new Error(data.error || defaultError);
  }
  return res.json();
}

export async function fetchQLiveProviders() {
  const res = await fetch(`${API_BASE}/qlive/providers`);
  return handleQLiveResponse(res, "Failed to fetch QLive providers");
}

export async function fetchQLiveDevices(providerId) {
  const url = new URL(`${API_BASE}/qlive/devices`);
  if (providerId) url.searchParams.set("provider_id", providerId);
  const res = await fetch(url);
  return handleQLiveResponse(res, "Failed to fetch QLive devices");
}

export async function submitQLiveJob(payload) {
  const res = await fetch(`${API_BASE}/qlive/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleQLiveResponse(res, "Failed to submit QLive job");
}

export async function fetchQLiveJobs(providerId) {
  const url = new URL(`${API_BASE}/qlive/jobs`);
  if (providerId) url.searchParams.set("provider_id", providerId);
  const res = await fetch(url);
  return handleQLiveResponse(res, "Failed to fetch QLive jobs");
}

export async function fetchQLiveJob(jobId, providerId) {
  const url = new URL(`${API_BASE}/qlive/jobs/${encodeURIComponent(jobId)}`);
  if (providerId) url.searchParams.set("provider_id", providerId);
  const res = await fetch(url);
  return handleQLiveResponse(res, "Failed to fetch QLive job");
}

export async function cancelQLiveJob(jobId, providerId, payload) {
  const url = new URL(`${API_BASE}/qlive/jobs/${encodeURIComponent(jobId)}/cancel`);
  if (providerId) url.searchParams.set("provider_id", providerId);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : "{}",
  });
  return handleQLiveResponse(res, "Failed to cancel QLive job");
}
