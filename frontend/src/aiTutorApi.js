export async function askQuantumTutor({ message, context, history = [] }, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 35000);
  try {
    const response = await fetch(options.endpoint || "/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ message, context, history })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "The AI tutor is temporarily unavailable.");
    }
    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("The AI tutor returned an empty response.");
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The AI request timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
