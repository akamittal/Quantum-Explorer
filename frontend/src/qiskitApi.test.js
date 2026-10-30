import test from "node:test";
import assert from "node:assert/strict";
import { executeWithQiskit, checkQiskitHealth } from "./qiskitApi.js";

test("posts the selected circuit and returns the Qiskit result", async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ engine: "qiskit-aer", shots: 1000, statevector: [], counts: {} }), { status: 200 });
  };
  const payload = { num_qubits: 1, operations: [{ name: "H", qubit: 0 }], shots: 1000 };
  const result = await executeWithQiskit(payload, { fetchImpl });
  assert.equal(request.url, "/api/qiskit/execute");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(JSON.parse(request.options.body), payload);
  assert.equal(result.engine, "qiskit-aer");
});

test("surfaces backend validation messages", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ message: "unsupported gate" }), { status: 422 });
  await assert.rejects(executeWithQiskit({}, { fetchImpl }), /unsupported gate/);
});

test("explains an unavailable backend", async () => {
  const fetchImpl = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(executeWithQiskit({}, { fetchImpl }), /Could not reach the Quantum Explorer backend/);
});

test("checks Qiskit service health through the Node API", async () => {
  const fetchImpl = async (url) => {
    assert.equal(url, "/api/qiskit/health");
    return new Response(JSON.stringify({ status: "ok", engine: "Qiskit + Aer" }), { status: 200 });
  };
  const result = await checkQiskitHealth({ fetchImpl });
  assert.equal(result.status, "ok");
});
