import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/** Unified KaTeX wrapper with semantic inline and display rendering. */
export default function MathRenderer({ formula, displayMode = true }) {
  let cleanFormula = formula;
  if (cleanFormula.startsWith("\\(") && cleanFormula.endsWith("\\)")) {
    cleanFormula = cleanFormula.slice(2, -2);
  }
  if (cleanFormula.startsWith("\\[") && cleanFormula.endsWith("\\]")) {
    cleanFormula = cleanFormula.slice(2, -2);
  }

  if (!displayMode) {
    return (
      <span style={{ color: "#34d399", fontFamily: "monospace" }}>
        <InlineMath math={cleanFormula} />
      </span>
    );
  }

  return (
    <div style={{ color: "#34d399", fontFamily: "monospace", width: "100%", overflowX: "auto", margin: "0.5rem 0" }}>
      <BlockMath math={cleanFormula} />
    </div>
  );
}
