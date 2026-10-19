/**
 * Single Qubit Conceptual Framework, Derivations, and Telemetry Panel
 * Path: /frontend/src/SingleQubitModule.jsx
 */
import React from 'react';

export default function SingleQubitModule({ coordinates, amplitudes, onApplyGate }) {
    return (
        <div style={styles.moduleWrapper}>
            
            {/* SECTION 1: CONCEPTUAL HORIZON */}
            <section style={styles.contentSection}>
                <h3 style={styles.sectionHeader}>// 1.0 CONCEPTUAL FRAMEWORK</h3>
                <p style={styles.paragraphText}>
                    A quantum bit, or <strong>qubit</strong>, represents the foundational mathematical framework of quantum computing. 
                    Unlike a classical bit restricted to a binary discrete choice of 0 or 1, a qubit occupies a continuous 
                    two-dimensional complex vector space known as a <strong>Hilbert Space</strong>.
                </p>
                <div style={styles.useCaseBox}>
                    <span style={styles.boxTitle}>ENTERPRISE IMPLICATIONS</span>
                    <p style={styles.boxContent}>
                        Enables simultaneous multi-state calculation path checking, forming the foundational layer 
                        for exponential algorithms like Shor's and Grover's unstructured data searches.
                    </p>
                </div>
            </section>

            {/* SECTION 2: RIGOROUS MATHEMATICAL DERIVATION */}
            <section style={styles.contentSection}>
                <h3 style={styles.sectionHeader}>// 2.0 FORMAL MATHEMATICAL DERIVATION</h3>
                <p style={styles.paragraphText}>
                    The general state vector |Ψ⟩ is formulated as a linear combination of the orthonormal basis vectors |0⟩ and |1⟩:
                </p>
                <div style={styles.mathBlock}>

                    |Ψ⟩ = α|0⟩ + β|1⟩ &nbsp;&nbsp;&nbsp;&nbsp; where α, β ∈ ℂ
                </div>
                <p style={styles.paragraphText}>
                    Subjected to the absolute system probability preservation rule (Normalization Constraint):
                </p>
                <div style={styles.mathBlock}>

                    |α|² + |β|² = 1
                </div>
                <p style={styles.paragraphText}>
                    Factoring out global phase variance gives the definitive spherical surface coordinate mapping transformation:
                </p>
                <div style={styles.mathBlock}>

                    |Ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
                </div>
            </section>

            {/* SECTION 3: REAL-TIME TELEMETRY SYSTEM SCREEN */}
            <section style={styles.contentSection}>
                <h3 style={styles.sectionHeader}>// 3.0 SYSTEM TELEMETRY READOUTS</h3>
                <div style={styles.telemetryGrid}>
                    <div style={styles.telemetryCard}>
                        <span style={styles.cardLabel}>COMPLEX AMPLITUDE α (|0⟩)</span>
                        <span style={styles.cardValue}>{amplitudes.alpha.re.toFixed(4)} + {amplitudes.alpha.im.toFixed(4)}i</span>
                    </div>
                    <div style={styles.telemetryCard}>
                        <span style={styles.cardLabel}>COMPLEX AMPLITUDE β (|1⟩)</span>
                        <span style={styles.cardValue}>{amplitudes.beta.re.toFixed(4)} + {amplitudes.beta.im.toFixed(4)}i</span>
                    </div>
                    <div style={styles.telemetryCard}>
                        <span style={styles.cardLabel}>CARTESIAN BLOCK COORDINATES</span>
                        <span style={styles.cardValue}>X: {coordinates.x} | Y: {coordinates.y} | Z: {coordinates.z}</span>
                    </div>
                </div>

                {/* GATE OPERATOR INJECTION CONSOLE */}
                <h4 style={styles.subConsoleTitle}>// INJECT UNITARY MATRIX OPERATOR</h4>
                <div style={styles.buttonConsoleRow}>
                    <button onClick={() => onApplyGate('H')} style={styles.gateButton}>HADAMARD (H)</button>
                    <button onClick={() => onApplyGate('X')} style={styles.gateButton}>PAULI-X (NOT)</button>
                    <button onClick={() => onApplyGate('Z')} style={styles.gateButton}>PAULI-Z (PHASE)</button>
                    <button onClick={() => onApplyGate('RESET')} style={styles.resetGateButton}>RESET STATE</button>
                </div>
            </section>

        </div>
    );
}

const styles = {
    moduleWrapper: { display: 'flex', flexDirection: 'column', gap: '2.5rem' },
    contentSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    sectionHeader: { color: '#10b981', fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '0.15em', margin: 0 },
    paragraphText: { color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 },
    useCaseBox: { 
        backgroundColor: 'rgba(6, 182, 212, 0.04)', borderLeft: '3px solid #06b6d4', padding: '1.25rem', marginTop: '0.5rem' 
    },
    boxTitle: { color: '#06b6d4', fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 'bold' },
    boxContent: { color: '#e5e7eb', fontSize: '0.9rem', margin: '0.5rem 0 0 0', lineHeight: '1.5' },
    mathBlock: { 
        backgroundColor: '#0b0f19', padding: '1.25rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)',
        color: '#34d399', fontFamily: 'monospace', fontSize: '1rem', textAlign: 'center' 
    },
    telemetryGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    telemetryCard: { 
        backgroundColor: '#0b0f19', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)',
        display: 'flex', flexDirection: 'column', gap: '0.25rem'
    },
    cardLabel: { color: '#6b7280', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.05em' },
    cardValue: { color: '#f9fafb', fontSize: '0.95rem', fontFamily: 'monospace' },
    subConsoleTitle: { color: '#f9fafb', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: '1.5rem', marginBottom: 0 },
    buttonConsoleRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' },
    gateButton: { 
        background: 'transparent', border: '1px solid #06b6d4', color: '#06b6d4', padding: '0.75rem 1.25rem',
        fontSize: '0.8rem', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s ease'
    },
    resetGateButton: {
        background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem 1.25rem',
        fontSize: '0.8rem', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s ease'
    }
};
