/**
 * Global Cyber-Minimalist Theme & Workspace Design Tokens
 * Path: /frontend/src/workspaceStyles.js
 */
export const styles = {
  deepSpaceCanvas: {
    position: 'relative',
    backgroundColor: '#030712',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'system-ui, sans-serif',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box'
  },
  cyberHUD: {
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3.5rem 3rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(11, 15, 25, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  systemTelemetry: {
    color: '#10b981',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    letterSpacing: '0.3em',
    marginBottom: '2.5rem'
  },
  quantumTriggerButton: {
    background: 'transparent',
    border: '1px solid #10b981',
    color: '#10b981',
    padding: '1.25rem 3.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.25em',
    cursor: 'pointer',
    borderRadius: '2px',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  quantumBypassButton: {
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    letterSpacing: '0.15em',
    cursor: 'pointer',
    marginBottom: '2rem',
    outline: 'none'
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem',
    justifyContent: 'center'
  },
  switchWrapper: {
    position: 'relative',
    display: 'inline-block',
    width: '36px',
    height: '20px',
    cursor: 'pointer'
  },
  hiddenCheckbox: {
    opacity: 0,
    width: 0,
    height: 0
  },
  customSlider: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '20px',
    padding: '2px',
    transition: 'background-color 0.2s ease'
  },
  sliderKnob: {
    width: '16px',
    height: '16px',
    backgroundColor: '#030712',
    borderRadius: '50%',
    transition: 'transform 0.2s ease'
  },
  toggleLabelText: {
    color: '#9ca3af',
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    letterSpacing: '0.05em'
  },
  sacredGeometryContainer: {
    zIndex: 10,
    textAlign: 'left',
    width: '100%',
    maxWidth: '48rem',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    height: '38rem',
    justifyContent: 'flex-start'
  },
  fixedLineSlot: {
    height: '6.5rem',
    display: 'flex',
    alignItems: 'flex-start'
  },
  fixedMeaningSlot: {
    height: '8rem',
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'flex-start'
  },
  rowBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  sanskritBigMantra: {
    fontSize: '2.85rem',
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: '0.02em',
    margin: '0 0 0.3rem 0'
  },
  transliterationSmallText: {
    fontSize: '1.1rem',
    fontFamily: 'monospace',
    color: '#06b6d4',
    letterSpacing: '0.04em',
    margin: 0
  },
  sanskritMediumMantra: {
    fontSize: '1.85rem',
    fontWeight: '600',
    color: '#a7f3d0',
    letterSpacing: '0.01em',
    margin: '0 0 0.2rem 0'
  },
  transliterationMediumText: {
    fontSize: '0.95rem',
    fontFamily: 'monospace',
    color: '#22d3ee',
    letterSpacing: '0.02em',
    margin: 0
  },
  englishTranslationBlock: {
    borderTop: '1px solid rgba(6, 182, 212, 0.15)',
    paddingTop: '2rem',
    width: '100%'
  },
  translationLine: {
    fontSize: '1.05rem',
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 0.5rem 0',
    fontStyle: 'italic'
  },
  narrativeLayoutGrid: {
    zIndex: 10,
    maxWidth: '46rem',
    width: '100%',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left'
  },
  narrativeConsoleOutput: {
    fontSize: '1.15rem',
    lineHeight: '1.9',
    color: '#e5e7eb',
    whiteSpace: 'pre-line',
    minHeight: '17rem',
    fontWeight: '300'
  },
  fixedButtonZone: {
    height: '4rem',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem'
  },
  applicationWorkspaceEntranceButton: {
    backgroundColor: '#10b981',
    color: '#030712',
    border: 'none',
    padding: '1.25rem 4rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    borderRadius: '4px',
    boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)'
  }
};
