import React from "react";

export default function IntroHUD({
  onObserve,
  onBypass,
  isAudio,
  onToggleAudio,
  styles,
}) {
  return (
    <div style={styles.cyberHUD}>
      <p style={styles.systemTelemetry}>
        COHERENCE STATE: UNOBSERVED (MULTIPLE CONFIGURATIONS ACTIVE)
      </p>
      <button onClick={onObserve} style={styles.quantumTriggerButton}>
        COLLAPSE SYSTEM STATE
      </button>
      <button onClick={onBypass} style={styles.quantumBypassButton}>
        BYPASS INTRODUCTION →
      </button>
      <div style={styles.toggleContainer}>
        <label style={styles.switchWrapper}>
          <input
            type="checkbox"
            checked={isAudio}
            onChange={(e) => onToggleAudio(e.target.checked)}
            style={styles.hiddenCheckbox}
          />
          <div
            style={{
              ...styles.customSlider,
              backgroundColor: isAudio ? "#10b981" : "rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                ...styles.sliderKnob,
                transform: isAudio ? "translateX(16px)" : "translateX(0px)",
              }}
            />
          </div>
        </label>
        <span style={styles.toggleLabelText}>
          {isAudio ? "⚡ AUDIO NODE STREAM ACTIVE" : "🔇 SYSTEM MUTED"}
        </span>
      </div>
    </div>
  );
}
