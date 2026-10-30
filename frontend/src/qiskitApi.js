const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function checkQiskitHealth({ fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${API_BASE}/api/qiskit/health`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.detail || "Qiskit service is unavailable.");
  }
  return data;
}

export async function executeWithQiskit(payload, { fetchImpl = fetch, timeoutMs = 20000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${API_BASE}/api/qiskit/execute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.detail || `Qiskit execution failed (HTTP ${response.status}).`);
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Qiskit execution timed out. Check that the backend and Qiskit service are running.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the Quantum Explorer backend. Check that the Node API is running.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
