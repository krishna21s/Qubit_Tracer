export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Use Vite proxy via window.location.origin so cross-device requests never face firewall or port-binding issues
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "http://127.0.0.1:8000";
}

export function getWsBaseUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const apiBase = getApiBaseUrl();
  return apiBase.replace(/^http/, "ws");
}

/**
 * fetch() with exponential-backoff retry.
 * Silently retries on network errors (e.g. ECONNREFUSED while backend is starting).
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} maxRetries  – default 4
 * @param {number} baseDelayMs – first retry delay in ms (doubles each time)
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 4, baseDelayMs = 500) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (attempt === maxRetries) throw err;           // give up after last retry
      const delay = baseDelayMs * Math.pow(2, attempt); // 500 → 1000 → 2000 → 4000 ms
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export const API_BASE = getApiBaseUrl();


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
// Q-Circuit Studio Simulate
// ---------------------------
export async function simulateQCircuit(qasm) {
  const res = await fetch(`${API_BASE}/api/qcircuit/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qasm }),
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
// NEW: Convert Circuit Code
// ---------------------------
export async function convertCircuitCode(qasmStr) {
  if (!qasmStr) throw new Error("Missing QASM string");
  const res = await fetch(`${API_BASE}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qasm: qasmStr }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Conversion failed");
  }
  return res.json(); // { cirq: string, pennylane: string }
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
  const res = await fetchWithRetry(`${API_BASE}/qlive/providers`);
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
  const url = new URL(
    `${API_BASE}/qlive/jobs/${encodeURIComponent(jobId)}/cancel`
  );
  if (providerId) url.searchParams.set("provider_id", providerId);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : "{}",
  });
  return handleQLiveResponse(res, "Failed to cancel QLive job");
}

export async function visionTest() {
  const res = await fetch(`${API_BASE}/vision/test`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Vision test failed");
  }

  return res.json(); // { message: "something" }
}

// ---------------------------
// NEW: Vision Analyze Screenshot
// ---------------------------
export async function visionAnalyze(imageBase64, query = "") {
  if (!imageBase64) throw new Error("Missing screenshot image");

  const payload = {
    image: imageBase64,
    query: query || "frontend-image",
  };

  const res = await fetch(`${API_BASE}/vision/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(err.error || "Vision analyze failed");
  }

  return res.json(); // { message, query, length }
}



export async function visionAsk(image_b64, query) {
  const res = await fetch(`${API_BASE}/vision/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: image_b64,
      query: query
    })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "server error" }));
    throw new Error(error.error || "Vision ask failed");
  }

  return res.json();
}