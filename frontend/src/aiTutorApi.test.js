import test from "node:test";
import assert from "node:assert/strict";
import { askQuantumTutor } from "./aiTutorApi.js";

test("sends the question, lesson context, and conversation history", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/ai/chat");
    const body = JSON.parse(options.body);
    assert.equal(body.message, "Explain H");
    assert.equal(body.context.module, "Single Qubit");
    assert.equal(body.history[0].role, "user");
    return new Response(JSON.stringify({ reply: "Hadamard creates an equal superposition.", model: "gemini-test" }), { status: 200 });
  };
  try {
    const result = await askQuantumTutor({
      message: "Explain H",
      context: { module: "Single Qubit" },
      history: [{ role: "user", text: "What is a gate?" }]
    });
    assert.match(result.reply, /superposition/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("surfaces backend error messages", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "AI is not configured" }), { status: 503 });
  try {
    await assert.rejects(askQuantumTutor({ message: "Help" }), /AI is not configured/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
