export async function askQuantumTutor({ message, context, history = [], image }, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 105000);
  try {
    const response = await fetch(options.endpoint || "/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ message, context, history, image })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "The AI tutor is temporarily unavailable.");
    if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("The AI tutor returned an empty response.");
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The AI request took too long. Please try again, or use a smaller screenshot.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
