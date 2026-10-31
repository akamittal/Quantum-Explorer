import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { askQuantumTutor } from "./aiTutorApi";

function MessageContent({ text }) {
  const parts = useMemo(() => {
    const pattern = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$)/g;
    return String(text).split(pattern).filter(Boolean).map((part) => {
      if (part.startsWith("\\[")) return { math: part.slice(2, -2), display: true };
      if (part.startsWith("\\(")) return { math: part.slice(2, -2), display: false };
      if (part.startsWith("$$")) return { math: part.slice(2, -2), display: true };
      return { text: part };
    });
  }, [text]);

  return <div style={styles.messageText}>{parts.map((part, index) => part.math !== undefined
    ? <MathRenderer key={index} formula={part.math} displayMode={part.display} />
    : <span key={index} style={{ whiteSpace: "pre-wrap" }}>{part.text}</span>)}</div>;
}

export default function AIAssistant({ moduleTitle, lessonContext = "", simulatorContext = {} }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const context = useMemo(() => ({
    product: "Quantum Explorer",
    module: moduleTitle,
    lesson: lessonContext,
    simulator: simulatorContext
  }), [moduleTitle, lessonContext, simulatorContext]);

  const send = async (event) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;
    const previous = messages.map(({ role, text }) => ({ role, text }));
    setMessages((items) => [...items, { role: "user", text: message }]);
    setDraft("");
    setError("");
    setLoading(true);
    try {
      const result = await askQuantumTutor({ message, context, history: previous });
      setMessages((items) => [...items, { role: "model", text: result.reply }]);
    } catch (requestError) {
      setError(requestError.message || "The AI tutor could not answer this question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" aria-label="Open AI Quantum Tutor" onClick={() => setOpen((value) => !value)} style={styles.launcher}>
        <span style={styles.launcherDot} /> {open ? "CLOSE TUTOR" : "ASK AI TUTOR"}
      </button>
      {open && <aside aria-label="AI Quantum Tutor" style={styles.panel}>
        <header style={styles.header}>
          <div><strong style={styles.title}>AI QUANTUM TUTOR</strong><div style={styles.subtitle}>Context-aware learning assistant · {moduleTitle}</div></div>
          <button type="button" aria-label="Close AI tutor" onClick={() => setOpen(false)} style={styles.close}>×</button>
        </header>
        <div style={styles.notice}>Ask about this lesson, an equation, a gate or the current simulator state. The tutor receives the learning context shown here.</div>
        <div style={styles.messages} aria-live="polite">
          {!messages.length && <div style={styles.welcome}>
            <strong>What would you like to understand?</strong>
            <p>Ask for a beginner explanation, a step-by-step derivation, or how the current circuit works.</p>
            <div style={styles.suggestions}>
              {["Explain this lesson from first principles", "Walk me through the key equation", "How does the current circuit work?"].map((item) =>
                <button type="button" key={item} style={styles.suggestion} onClick={() => setDraft(item)}>{item}</button>
              )}
            </div>
          </div>}
          {messages.map((item, index) => <div key={index} style={{ ...styles.message, ...(item.role === "user" ? styles.userMessage : styles.assistantMessage) }}>
            <span style={styles.role}>{item.role === "user" ? "YOU" : "QUANTUM TUTOR"}</span>
            <MessageContent text={item.text} />
          </div>)}
          {loading && <div style={styles.thinking}>Thinking through the quantum details…</div>}
          {error && <div role="alert" style={styles.error}>{error}</div>}
        </div>
        <form onSubmit={send} style={styles.form}>
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={4000}
            placeholder="Ask your quantum question…" style={styles.input} disabled={loading} />
          <div style={styles.formFooter}>
            <span style={styles.counter}>{draft.length}/4000</span>
            <button type="submit" disabled={!draft.trim() || loading} style={styles.send}>{loading ? "THINKING…" : "SEND QUESTION ↗"}</button>
          </div>
        </form>
        <footer style={styles.footer}><button type="button" onClick={() => { setMessages([]); setError(""); }} style={styles.clear}>Clear conversation</button><span>AI can make mistakes. Verify important results with the simulator.</span></footer>
      </aside>}
    </>
  );
}

const styles = {
  launcher: { position: "fixed", right: "1.25rem", bottom: "1.25rem", zIndex: 120, display: "flex", alignItems: "center", gap: ".55rem", padding: ".75rem 1rem", background: "#0b1720", border: "1px solid rgba(16,185,129,.65)", color: "#d1fae5", fontFamily: "monospace", fontSize: ".72rem", letterSpacing: ".04em", cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,.35)" },
  launcherDot: { width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 9px #34d399" },
  panel: { position: "fixed", zIndex: 121, right: "1.25rem", bottom: "4.5rem", width: "min(440px, calc(100vw - 2rem))", height: "min(680px, calc(100vh - 6rem))", display: "flex", flexDirection: "column", background: "#080e18", border: "1px solid rgba(16,185,129,.32)", boxShadow: "0 18px 60px rgba(0,0,0,.6)", color: "#e5e7eb", fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".75rem", padding: "1rem", borderBottom: "1px solid rgba(6,182,212,.15)", background: "#0b111d" },
  title: { color: "#6ee7b7", fontFamily: "monospace", fontSize: ".78rem", letterSpacing: ".08em" },
  subtitle: { marginTop: ".35rem", color: "#64748b", fontSize: ".72rem" },
  close: { background: "transparent", border: 0, color: "#94a3b8", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 },
  notice: { padding: ".65rem 1rem", color: "#94a3b8", fontSize: ".72rem", lineHeight: 1.5, borderBottom: "1px solid rgba(148,163,184,.1)" },
  messages: { flex: 1, minHeight: 0, overflowY: "auto", padding: ".85rem", display: "flex", flexDirection: "column", gap: ".75rem" },
  welcome: { margin: "auto 0", padding: ".6rem", color: "#cbd5e1", fontSize: ".85rem", lineHeight: 1.6 },
  suggestions: { display: "flex", flexDirection: "column", alignItems: "stretch", gap: ".4rem", marginTop: ".75rem" },
  suggestion: { textAlign: "left", background: "#0d1824", border: "1px solid #263648", color: "#a7f3d0", padding: ".55rem .65rem", fontSize: ".72rem", cursor: "pointer" },
  message: { padding: ".7rem .75rem", border: "1px solid rgba(148,163,184,.12)", fontSize: ".82rem", lineHeight: 1.6, overflowWrap: "anywhere" },
  userMessage: { background: "#0d1d2a", borderColor: "rgba(6,182,212,.2)" },
  assistantMessage: { background: "#0b151b", borderColor: "rgba(16,185,129,.18)" },
  role: { display: "block", color: "#6ee7b7", fontFamily: "monospace", fontSize: ".62rem", letterSpacing: ".08em", marginBottom: ".45rem" },
  messageText: { color: "#d1d5db", whiteSpace: "pre-wrap" },
  thinking: { color: "#67e8f9", fontSize: ".75rem", padding: ".5rem" },
  error: { color: "#fecaca", background: "rgba(127,29,29,.2)", padding: ".6rem", fontSize: ".75rem" },
  form: { padding: ".75rem", borderTop: "1px solid rgba(148,163,184,.14)", background: "#0b111d" },
  input: { boxSizing: "border-box", width: "100%", resize: "vertical", minHeight: "70px", maxHeight: "150px", padding: ".65rem", background: "#050911", border: "1px solid #334155", color: "#e5e7eb", font: "inherit", fontSize: ".8rem", outlineColor: "#10b981" },
  formFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" },
  counter: { color: "#64748b", fontSize: ".65rem", fontFamily: "monospace" },
  send: { padding: ".55rem .75rem", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.55)", color: "#d1fae5", fontFamily: "monospace", fontSize: ".67rem", cursor: "pointer" },
  footer: { display: "flex", justifyContent: "space-between", gap: ".5rem", alignItems: "center", padding: ".55rem .75rem", color: "#64748b", fontSize: ".62rem", borderTop: "1px solid rgba(148,163,184,.08)" },
  clear: { border: 0, background: "transparent", color: "#67e8f9", fontSize: ".65rem", cursor: "pointer", padding: 0 }
};
