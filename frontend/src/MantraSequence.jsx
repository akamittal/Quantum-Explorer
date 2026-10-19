import React from "react";

export default function MantraSequence({ activeLines, styles }) {
  return (
    <div style={styles.sacredGeometryContainer}>
      <div style={styles.fixedLineSlot}>
        {activeLines.line1 && (
          <div className="cinematic-reveal" style={styles.rowBlock}>
            <h1 style={styles.sanskritBigMantra}>ॐ असतो मा सद्गमय ।</h1>
            <p style={styles.transliterationSmallText}>oṃ asato mā sadgamaya</p>
          </div>
        )}
      </div>
      <div style={styles.fixedLineSlot}>
        {activeLines.line2 && (
          <div className="cinematic-reveal" style={styles.rowBlock}>
            <h2 style={styles.sanskritMediumMantra}>तमसो मा ज्योतिर्गमय ।</h2>
            <p style={styles.transliterationMediumText}>
              tamaso mā jyotirgamaya
            </p>
          </div>
        )}
      </div>
      <div style={styles.fixedLineSlot}>
        {activeLines.line3 && (
          <div className="cinematic-reveal" style={styles.rowBlock}>
            <h2 style={styles.sanskritMediumMantra}>मृत्योर्मा अमृतं गमय ।</h2>
            <p style={styles.transliterationMediumText}>
              mṛtyormā amṛtaṃ gamaya
            </p>
          </div>
        )}
      </div>
      <div style={styles.fixedMeaningSlot}>
        {activeLines.meaning && (
          <div
            className="cinematic-reveal"
            style={styles.englishTranslationBlock}
          >
            <p style={styles.translationLine}>
              Lead me from the unreal to the real.
            </p>
            <p style={styles.translationLine}>
              Lead me from darkness to light. From death, lead me to
              immortality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
