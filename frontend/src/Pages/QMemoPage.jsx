import React from 'react';
import QMemoGrid from '../Components/qmemo/QMemoGrid';
import '../Components/qmemo/qmemo.css';

export default function QMemoPage() {
  return (
    <div className="qmemo-root" style={{ height: '100%' }}>
      <div className="qmemo-hero">
        <h1>Q‑Memo Library</h1>
        <p>Explore visual quantum micro-lessons and concepts.</p>
      </div>
      <QMemoGrid />
    </div>
  );
}