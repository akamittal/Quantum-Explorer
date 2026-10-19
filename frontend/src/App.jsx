import React, { useState, useEffect, useRef } from 'react';
import QuantumParticleBackground from './QuantumParticleBackground';

export default function App() {
    const [narrativePhase, setNarrativePhase] = useState(0);
    const [activeLines, setActiveLines] = useState({ line1: false, line2: false, line3: false, meaning: false });
    const [typedNarrative, setTypedNarrative] = useState('');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const audioNodeRef = useRef(null);

    const chronologicalScript = [
        "Not all could be answered within the bounds of physical laws.",
        "You can ignore what you can't explain, but their existence cannot be ignored.",
        "Beyond logic, there is a far bigger world of truth, appearing as an illusion.",
        "Welcome to the world of Quantum Computing."
    ];

    const beginQuantumObservation = () => {
        setNarrativePhase(1);
        
        setTimeout(() => setActiveLines(p => ({ ...p, line1: true })), 200);
        setTimeout(() => setActiveLines(p => ({ ...p, line2: true })), 2800);
        setTimeout(() => setActiveLines(p => ({ ...p, line3: true })), 5400);
        setTimeout(() => setActiveLines(p => ({ ...p, meaning: true })), 8200);
        
        setTimeout(() => setNarrativePhase(2), 14000);

        if (isAudioEnabled && audioNodeRef.current) {
            audioNodeRef.current.volume = 0.5;
            audioNodeRef.current.play().catch(err => console.warn("Audio context held:", err));
        }
    };

    // Robust Typewriter Stream Controller - Zero-index truncation fixed
    useEffect(() => {
        if (narrativePhase !== 2) return;
        
        const fullManifesto = chronologicalScript.join('\n\n');
        let streamIndex = 0;
        setTypedNarrative(''); // Direct reset baseline string assignment
        
        const typingEngine = setInterval(() => {
            if (streamIndex < fullManifesto.length) {
                // Select exactly the active character at the current stream pointer position
                const nextChar = fullManifesto.charAt(streamIndex);
                setTypedNarrative((prev) => prev + nextChar);
                streamIndex++;
            } else {
                clearInterval(typingEngine);
                setNarrativePhase(3);
            }
        }, 30); // 30ms character rhythm for a fluid digital presentation feel
        
        return () => clearInterval(typingEngine);
    }, [narrativePhase]);

    useEffect(() => {
        if (narrativePhase !== 3 || !audioNodeRef.current) return;
        const volumeFadeController = setInterval(() => {
            if (audioNodeRef.current.volume > 0.04) {
                audioNodeRef.current.volume -= 0.04;
            } else {
                audioNodeRef.current.pause();
                clearInterval(volumeFadeController);
            }
        }, 200);
        return () => clearInterval(volumeFadeController);
    }, [narrativePhase]);

    return (
        <div style={styles.deepSpaceCanvas}>
            <style>{`
                @keyframes cinematicSlideIn {
                    0% { opacity: 0; transform: translate3d(-25px, 0, 0); filter: blur(6px); }
                    100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0px); }
                }
                @keyframes masterButtonFade {
                    0% { opacity: 0; transform: translate3d(0, 15px, 0); }
                    100% { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                .cinematic-reveal {
                    animation: cinematicSlideIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .action-button-reveal {
                    animation: masterButtonFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <QuantumParticleBackground />

            <audio 
                ref={audioNodeRef} 
                src="/assets/audio/quantum_ambient_drone.webm" 
                preload="auto"
            />

            {narrativePhase === 0 && (
                <div style={styles.cyberHUD}>
                    <p style={styles.systemTelemetry}>COHERENCE STATE: UNOBSERVED (MULTIPLE CONFIGURATIONS ACTIVE)</p>
                    <button onClick={beginQuantumObservation} style={styles.quantumTriggerButton}>
                        COLLAPSE SYSTEM STATE
                    </button>
                    <div style={styles.toggleContainer}>
                        <label style={styles.switchWrapper}>
                            <input 
                                type="checkbox" 
                                checked={isAudioEnabled}
                                onChange={(e) => setIsAudioEnabled(e.target.checked)}
                                style={styles.hiddenCheckbox}
                            />
                            <div style={{
                                ...styles.customSlider,
                                backgroundColor: isAudioEnabled ? '#10b981' : 'rgba(255,255,255,0.1)'
                            }}>
                                <div style={{
                                    ...styles.sliderKnob,
                                    transform: isAudioEnabled ? 'translateX(16px)' : 'translateX(0px)'
                                }} />
                            </div>
                        </label>
                        <span style={styles.toggleLabelText}>
                            {isAudioEnabled ? "⚡ AUDIO NODE STREAM ACTIVE" : "🔇 SYSTEM MUTED FOR CONTEXT SAFETY"}
                        </span>
                    </div>
                </div>
            )}

            {narrativePhase === 1 && (
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
                                <p style={styles.transliterationMediumText}>tamaso mā jyotirgamaya</p>
                            </div>
                        )}
                    </div>

                    <div style={styles.fixedLineSlot}>
                        {activeLines.line3 && (
                            <div className="cinematic-reveal" style={styles.rowBlock}>
                                <h2 style={styles.sanskritMediumMantra}>मृत्योर्मा अमृतं गमय ।</h2>
                                <p style={styles.transliterationMediumText}>mṛtyormā amṛtaṃ gamaya</p>
                            </div>
                        )}
                    </div>

                    <div style={styles.fixedMeaningSlot}>
                        {activeLines.meaning && (
                            <div className="cinematic-reveal" style={styles.englishTranslationBlock}>
                                <p style={styles.translationLine}>Lead me from the unreal to the real.</p>
                                <p style={styles.translationLine}>Lead me from darkness to light. From death, lead me to immortality.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(narrativePhase === 2 || narrativePhase === 3) && (
                <div style={styles.narrativeLayoutGrid}>
                    <p style={styles.narrativeConsoleOutput}>{typedNarrative}</p>
                    
                    {/* Fixed button placement block container */}
                    <div style={styles.fixedButtonZone}>
                        {narrativePhase === 3 && (
                            <button 
                                onClick={() => alert("Workspace Core Connecting...")} 
                                className="action-button-reveal"
                                style={styles.applicationWorkspaceEntranceButton}
                            >
                                ACCESS HILBERT OPERATOR MATRIX →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    deepSpaceCanvas: {
        position: 'relative', backgroundColor: '#030712', width: '100vw', height: '100vh',
        overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', margin: 0, padding: 0, boxSizing: 'border-box'
    },
    cyberHUD: {
        zIndex: 10, textAlign: 'center', padding: '3.5rem 3rem', borderRadius: '6px',
        backgroundColor: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    systemTelemetry: { color: '#10b981', fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '0.3em', marginBottom: '2.5rem' },
    quantumTriggerButton: {
        background: 'transparent', border: '1px solid #10b981', color: '#10b981',
        padding: '1.25rem 3.5rem', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.25em',
        cursor: 'pointer', borderRadius: '2px', marginBottom: '2.5rem', transition: 'all 0.3s ease'
    },
    toggleContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' },
    switchWrapper: { position: 'relative', display: 'inline-block', width: '36px', height: '20px', cursor: 'pointer' },
    hiddenCheckbox: { opacity: 0, width: 0, height: 0 },
    customSlider: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '20px', padding: '2px', transition: 'background-color 0.2s ease' },
    sliderKnob: { width: '16px', height: '16px', backgroundColor: '#030712', borderRadius: '50%', transition: 'transform 0.2s ease' },
    toggleLabelText: { color: '#9ca3af', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.05em' },
    sacredGeometryContainer: {
        zIndex: 10, textAlign: 'left', width: '100%', maxWidth: '48rem', padding: '0 2rem',
        display: 'flex', flexDirection: 'column', height: '38rem', justifyContent: 'flex-start'
    },
    fixedLineSlot: { height: '6.5rem', display: 'flex', alignItems: 'flex-start', margin: 0, padding: 0 },
    fixedMeaningSlot: { height: '8rem', marginTop: '1.5rem', display: 'flex', alignItems: 'flex-start' },
    rowBlock: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    sanskritBigMantra: { fontSize: '2.85rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.02em', margin: '0 0 0.3rem 0', padding: 0 },
    transliterationSmallText: { fontSize: '1.1rem', fontFamily: 'monospace', color: '#06b6d4', letterSpacing: '0.04em', margin: 0, padding: 0 },
    sanskritMediumMantra: { fontSize: '1.85rem', fontWeight: '600', color: '#a7f3d0', letterSpacing: '0.01em', margin: '0 0 0.2rem 0', padding: 0 },
    transliterationMediumText: { fontSize: '0.95rem', fontFamily: 'monospace', color: '#22d3ee', letterSpacing: '0.02em', margin: 0, padding: 0 },
    englishTranslationBlock: { borderTop: '1px solid rgba(6, 182, 212, 0.15)', paddingTop: '2rem', width: '100%' },
    translationLine: { fontSize: '1.05rem', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 0.5rem 0', fontStyle: 'italic' },
    // Premium Cyber Console Layout Alignment Configuration
    narrativeLayoutGrid: {
        zIndex: 10, maxWidth: '46rem', width: '100%', padding: '0 2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left'
    },
    narrativeConsoleOutput: {
        fontSize: '1.15rem', lineHeight: '1.9', color: '#e5e7eb',
        whiteSpace: 'pre-line', minHeight: '17rem', fontWeight: '300', letterSpacing: '0.01em'
    },
    fixedButtonZone: {
        height: '4rem', width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1.5rem'
    },
    applicationWorkspaceEntranceButton: {
    backgroundColor: '#10b981', color: '#030712', border: 'none', padding: '1.25rem 4rem',
    fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.08em', cursor: 'pointer',
    borderRadius: '4px', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)'}
};
