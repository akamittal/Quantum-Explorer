import React, { useState, useEffect } from "react";

/**
 * Isolated Typographical Narrative Console Component
 * Path: /frontend/src/NarrativeConsole.jsx
 */
export default function NarrativeConsole({ onSequenceComplete, styles }) {
  const [consoleOutput, setConsoleOutput] = useState("");
  const [releaseEntranceButton, setReleaseEntranceButton] = useState(false);

  const chronologicalScript = [
    "Not all could be answered within the bounds of physical laws.",
    "You can ignore what you can't explain, but their existence cannot be ignored.",
    "Beyond logic, there is a far bigger world of truth, appearing as an illusion.",
    "Welcome to the world of Quantum Computing.",
  ];

  useEffect(() => {
    const fullManifesto = chronologicalScript.join("\n\n");
    let characterPointer = 0;
    setConsoleOutput(""); // Secure zero-state configuration initialization

    const typingEngine = setInterval(() => {
      if (characterPointer < fullManifesto.length) {
        // Select precisely using direct array indices to bypass string slicing drift anomalies
        const safeCharacter = fullManifesto[characterPointer];
        setConsoleOutput((prev) => prev + safeCharacter);
        characterPointer++;
      } else {
        clearInterval(typingEngine);
        setReleaseEntranceButton(true);
      }
    }, 25);

    return () => clearInterval(typingEngine);
  }, []);

  return (
    <div style={styles.narrativeLayoutGrid}>
      <p style={styles.narrativeConsoleOutput}>{consoleOutput}</p>
      <div style={styles.fixedButtonZone}>
        {releaseEntranceButton && (
          <button
            onClick={onSequenceComplete}
            className="action-button-reveal"
            style={styles.applicationWorkspaceEntranceButton}
          >
            ACCESS HILBERT OPERATOR MATRIX →
          </button>
        )}
      </div>
    </div>
  );
}
