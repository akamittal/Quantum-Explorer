import test from "node:test";
import assert from "node:assert/strict";
import { getBlochCoordinates, getMeasurementProbabilities } from "./quantumMath.js";

const closeTo = (actual, expected, epsilon = 1e-10) => {
  assert.ok(Math.abs(actual - expected) < epsilon, `expected ${actual} to be close to ${expected}`);
};

test("Born probabilities include real and imaginary amplitude components", () => {
  const rootHalf = 1 / Math.sqrt(2);
  const probabilities = getMeasurementProbabilities(
    { re: rootHalf, im: 0 },
    { re: 0, im: rootHalf },
  );
  closeTo(probabilities.zero, 0.5);
  closeTo(probabilities.one, 0.5);
  closeTo(probabilities.zero + probabilities.one, 1);
});

test("Born probabilities work for a general complex amplitude", () => {
  const probabilities = getMeasurementProbabilities(
    { re: 0.3, im: 0.4 },
    { re: Math.sqrt(0.75), im: 0 },
  );
  closeTo(probabilities.zero, 0.25);
  closeTo(probabilities.one, 0.75);
});

test("the basis states map to the Bloch sphere poles", () => {
  const north = getBlochCoordinates({ re: 1, im: 0 }, { re: 0, im: 0 });
  const south = getBlochCoordinates({ re: 0, im: 0 }, { re: 1, im: 0 });
  closeTo(north.x, 0); closeTo(north.y, 0); closeTo(north.z, 1);
  closeTo(south.x, 0); closeTo(south.y, 0); closeTo(south.z, -1);
});

test("relative phase is reflected in the Bloch y coordinate", () => {
  const rootHalf = 1 / Math.sqrt(2);
  const coordinates = getBlochCoordinates(
    { re: rootHalf, im: 0 },
    { re: 0, im: rootHalf },
  );
  closeTo(coordinates.x, 0);
  closeTo(coordinates.y, 1);
  closeTo(coordinates.z, 0);
});
