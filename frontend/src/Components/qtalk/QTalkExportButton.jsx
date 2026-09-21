import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download } from 'lucide-react';
import QTalkPrintView from './QTalkPrintView';

export default function QTalkExportButton({ session, className, label = "Export" }) {
  const [printMode, setPrintMode] = useState(false);
  const [rootEl, setRootEl] = useState(null);
  const printedRef = useRef(false);

  useEffect(() => {
    if (!printMode) return;

    const el = document.createElement('div');
    el.id = 'qtalk-print-root';
    document.body.appendChild(el);
    setRootEl(el);

    const cleanup = () => {
      document.body.classList.remove('qtalk-print-mode');
      printedRef.current = false;
      if (el.parentNode) {
        try { el.parentNode.removeChild(el); } catch {}
      }
      setRootEl(null);
    };

    const handleAfterPrint = () => {
      cleanup();
      setPrintMode(false);
    };

    const mql = window.matchMedia('print');
    const mqlListener = (e) => {
      if (!e.matches) {
        cleanup();
        setPrintMode(false);
      }
    };
    if (mql.addEventListener) mql.addEventListener('change', mqlListener);
    else if (mql.addListener) mql.addListener(mqlListener);

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      if (mql.removeEventListener) mql.removeEventListener('change', mqlListener);
      else if (mql.removeListener) mql.removeListener(mqlListener);
      cleanup();
    };
  }, [printMode]);

  const onReady = () => {
    if (printedRef.current) return;
    document.body.classList.add('qtalk-print-mode');
    printedRef.current = true;
    setTimeout(() => {
      try { window.print(); } catch {}
    }, 120);
  };

  return (
    <>
      <button
        className={className || "qtalk-hdr-btn"}
        title="Export conversation as PDF"
        onClick={() => setPrintMode(true)}
        disabled={!session || !session.messages?.length}
        type="button"
      >
        <Download size={13} />
        <span>{label}</span>
      </button>

      {printMode && rootEl && createPortal(
        <QTalkPrintView session={session} onReady={onReady} />,
        rootEl
      )}
    </>
  );
}