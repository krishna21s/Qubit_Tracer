import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function QTalkPrintView({ session, onReady }) {
  useEffect(() => {
    const t = setTimeout(() => onReady?.(), 200);
    return () => clearTimeout(t);
  }, [onReady]);

  if (!session) return null;

  return (
    <div id="qtalk-print-root" className="qtalk-print-root">
      <header className="qtalk-print-header">
        <div className="qtalk-print-brand">
          <div className="qtalk-print-title">Qubit‑Tracer</div>
          <div className="qtalk-print-sub">QTalk Conversation</div>
        </div>
        <div className="qtalk-print-meta">
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>Session: {session.title || 'Untitled'}</div>
        </div>
      </header>

      <section className="qtalk-print-section">
        {(session.messages || []).map((m, idx) => (
          <div key={idx} className={`qtalk-print-msg ${m.role}`}>
            <div className="role">{m.role === 'user' ? 'You' : 'QTalk'}</div>
            <div className="content">
              {m.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.text}
                </ReactMarkdown>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{m.text}</pre>
              )}
            </div>
          </div>
        ))}
      </section>

      <footer className="qtalk-print-footer">
        © {new Date().getFullYear()} Qubit‑Tracer — QTalk Export
      </footer>

      <style>{`
        .qtalk-print-root {
          font-family: "Inter", system-ui, sans-serif;
          background: #0f172a;
          color: #e2f4ff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          max-width: 1080px;
          margin: 0 auto;
          padding: 16px 26px 28px;
          font-size: 13px;
        }
        .qtalk-print-header {
          display:flex; justify-content:space-between; gap:24px;
          padding-bottom: 12px; border-bottom:1px solid #22384b; margin-bottom:20px;
        }
        .qtalk-print-title { font-size: 26px; font-weight: 700; letter-spacing: 1px; color: #5cc1ff; }
        .qtalk-print-sub { font-size: 13px; color: #94a3b8; margin-top: 4px; }
        .qtalk-print-meta { text-align:right; font-size:12px; color:#7ba9c7; display:flex; flex-direction:column; gap:4px; justify-content:flex-end; }
        .qtalk-print-section {
          background: linear-gradient(145deg,#142434,#0f1c28);
          border: 1px solid #203446;
          border-radius: 14px;
          padding: 12px 16px;
        }
        .qtalk-print-msg { margin-bottom: 12px; }
        .qtalk-print-msg .role {
          font-weight:700; color:#9fddff; margin-bottom: 4px;
        }
        .qtalk-print-msg.user .role { color:#66d8ff; }
        .qtalk-print-msg .content { background: rgba(12,25,36,0.55); border:1px solid #203446; border-radius:10px; padding:10px 12px; }
        .qtalk-print-footer { text-align:center; font-size:11px; color:#5e859c; border-top:1px solid #203446; padding-top:12px; margin-top:18px; }

        @media print {
          body.qtalk-print-mode > :not(#qtalk-print-root) { display:none !important; visibility:hidden !important; }
          #qtalk-print-root { display:block !important; visibility:visible !important; }
          @page { margin: 10mm; }
        }
      `}</style>
    </div>
  );
}