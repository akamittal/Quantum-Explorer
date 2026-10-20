import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * High-Performance Native React-KaTeX Unified Wrapper Component
 * Path: /frontend/src/MathRenderer.jsx
 */
export default function MathRenderer({ formula, displayMode = true }) {
  // Clean out any accidental wrapping string boundaries to ensure clean formatting
  let cleanFormula = formula;
  if (cleanFormula.startsWith("\\(") && cleanFormula.endsWith("\\)")) {
    cleanFormula = cleanFormula.slice(2, -2);
  }
  if (cleanFormula.startsWith("\\[") && cleanFormula.endsWith("\\]")) {
    cleanFormula = cleanFormula.slice(2, -2);
  }

  return (
    <div
      style={{
        color: "#34d399",
        fontFamily: "monospace",
        width: "100%",
        overflowX: "auto",
        margin: displayMode ? "0.5rem 0" : "0",
      }}
    >
      {displayMode ? (
        <BlockMath math={cleanFormula} />
      ) : (
        <InlineMath math={cleanFormula} />
      )}
    </div>
  );
}
