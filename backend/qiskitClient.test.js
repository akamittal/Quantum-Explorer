import test from "node:test";
import assert from "node:assert/strict";
import { executeWithQiskit } from "./qiskitClient.js";

test("forwards a circuit to the configured Qiskit service", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://qiskit.test/execute");
    assert.equal(JSON.parse(options.body).operations[0].name, "H");
    return new Response(JSON.stringify({ engine: "qiskit-aer" }), { status: 200 });
  };
  try {
    const result = await executeWithQiskit({ num_qubits: 1, operations: [{ name: "H", qubit: 0 }] }, { baseUrl: "http://qiskit.test" });
    assert.equal(result.engine, "qiskit-aer");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("preserves service validation errors", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: "unsupported gate" }), { status: 422 });
  try {
    await assert.rejects(
      executeWithQiskit({ num_qubits: 1 }, { baseUrl: "http://qiskit.test" }),
      (error) => error.status === 422 && error.message === "unsupported gate",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
