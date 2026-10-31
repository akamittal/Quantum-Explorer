import test from "node:test";
import assert from "node:assert/strict";
import { basisState, buildQftOperations, createInputState, qftState, stateDiagnostics } from "./quantumFourierTransform.js";

const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test("QFT maps |0> to the uniform positive-amplitude state", () => {
  const output = qftState(basisState(3, 0));
  output.forEach((value) => { close(value.re, 1 / Math.sqrt(8)); close(value.im, 0); });
});

test("QFT maps a computational basis state to a linear phase ramp", () => {
  const output = qftState(basisState(3, 5));
  output.forEach((value, y) => {
    const angle = 2 * Math.PI * 5 * y / 8;
    close(value.re, Math.cos(angle) / Math.sqrt(8));
    close(value.im, Math.sin(angle) / Math.sqrt(8));
    close(value.re ** 2 + value.im ** 2, 1 / 8);
  });
});

test("QFT of the uniform superposition is |0>", () => {
  const output = qftState(createInputState(4, "uniform"));
  close(output[0].re, 1);
  close(output[0].im, 0);
  output.slice(1).forEach((value) => { close(value.re, 0); close(value.im, 0); });
});

test("inverse QFT recovers arbitrary complex input states", () => {
  const input = [
    { re: 0.5, im: 0 }, { re: 0, im: 0.5 },
    { re: -0.5, im: 0 }, { re: 0, im: -0.5 },
  ];
  const recovered = qftState(qftState(input), true);
  recovered.forEach((value, index) => { close(value.re, input[index].re); close(value.im, input[index].im); });
});

test("forward and inverse QFT operation lists are exact reverses with negative controlled phases", () => {
  const forward = buildQftOperations(4);
  const inverse = buildQftOperations(4, true);
  assert.equal(forward.length, 12);
  assert.equal(inverse.length, forward.length);
  forward.slice().reverse().forEach((operation, index) => {
    const actual = inverse[index];
    assert.equal(actual.name, operation.name);
    if (operation.name === "CP") close(actual.theta, -operation.theta);
    else assert.deepEqual(actual, operation);
  });
  assert.equal(forward.filter((operation) => operation.name === "CP").length, 6);
});

test("QFT preserves norm and returns the expected phase and probability diagnostics", () => {
  const diagnostics = stateDiagnostics(qftState(basisState(3, 3)));
  close(diagnostics.reduce((sum, item) => sum + item.probability, 0), 1);
  diagnostics.forEach((item, index) => {
    close(item.probability, 1 / 8);
    const expectedPhase = 2 * Math.PI * 3 * index / 8;
    close(Math.cos(item.phase), Math.cos(expectedPhase), 1e-9);
    close(Math.sin(item.phase), Math.sin(expectedPhase), 1e-9);
  });
});

test("input validation rejects malformed dimensions and non-finite amplitudes", () => {
  assert.throws(() => basisState(0, 0), /1 to 8/);
  assert.throws(() => basisState(2, 4), /outside/);
  assert.throws(() => qftState([{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]), /power-of-two/);
  assert.throws(() => qftState([{ re: 1, im: 0 }, { re: Infinity, im: 0 }]), /finite/);
  assert.throws(() => qftState([{ re: 0, im: 0 }, { re: 0, im: 0 }]), /non-zero/);
});
