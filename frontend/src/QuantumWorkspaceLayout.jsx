import React from 'react';

/**
 * Core Structural Split Workspace Component for Quantum Concept Processing
 * Path: /frontend/src/QuantumWorkspaceLayout.jsx
 */
export default function QuantumWorkspaceLayout({ LeftContent, RightContent }) {
    return (
        <div style={styles.workspaceViewport}>
            {/* CENTRAL TOP TELEMETRY NAVIGATION HEADER */}
            <header style={styles.telemetryHeader}>
                <div style={styles.headerLeft}>
                    <span style={styles.pulseIndicator} />
                    <span style={styles.systemTitle}>QUANTUM ENGINE // CORE WORKSPACE</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.telemetryTag}>HILBERT ENGINE: ACTIVE</span>
                    <span style={styles.telemetryTag}>PRECISION LIMIT: 1e-9</span>
                </div>
            </header>

            {/* MASTER COUPLING PANEL VIEWPORT */}
            <div style={styles.panelGridContainer}>
                
                {/* LEFT COLUMN PANEL - SCROLLABLE RESEARCH & MATH CORE */}
                <section style={styles.leftScrollPanel}>
                    <div style={styles.panelContentWrapper}>
                        {LeftContent}
                    </div>
                </section>

                {/* RIGHT COLUMN PANEL - FIXED VIEWPORT FOR 3D ENGINE */}
                <section style={styles.rightFixedPanel}>
                    <div style={styles.fixedContainerShield}>
                        {RightContent}
                    </div>
                </section>

            </div>
        </div>
    );
}

// Industry-Standard Cyber-Minimalist Architectural Style Mapping Matrix
const styles = {
    workspaceViewport: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#030712', // Strict dark obsidian base
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        margin: 0, padding: 0, boxSizing: 'border-box'
    },
    telemetryHeader: {
        height: '3.5rem',
        backgroundColor: '#0b0f19',
        borderBottom: '1px solid rgba(6, 182, 212, 0.15)', // Thin electric cyan boundary border
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        padding: '0 2rem',
        zIndex: 50,
        boxSizing: 'border-box',
        justifyContent: 'space-between'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    pulseIndicator: {
        width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%',
        boxShadow: '0 0 10px #10b981'
    },
    systemTitle: {
        color: '#f9fafb', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.15em', fontFamily: 'monospace'
    },
    headerRight: { display: 'flex', gap: '1.5rem' },
    telemetryTag: {
        color: '#06b6d4', fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '0.05em'
    },
    
    // Master Workspace Panels Container
    panelGridContainer: {
        flex: 1, display: 'flex', width: '100vw', height: 'calc(100vh - 3.5rem)', overflow: 'hidden'
    },
    
    // Left Scroll Panel: Allocated exactly 45% width with isolated vertical scrolling properties
    leftScrollPanel: {
        width: '45%', height: '100%', overflowY: 'auto', overflowX: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: '#070b14',
        boxSizing: 'border-box'
    },
    panelContentWrapper: {
        padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem'
    },
    
    // Right Fixed Panel: Allocated exactly 55% width, perfectly static to host Three.js layers without disruptions
    rightFixedPanel: {
        width: '55%', height: '100%', backgroundColor: '#030712', position: 'relative',
        boxSizing: 'border-box'
    },
    fixedContainerShield: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden'
    }
};
