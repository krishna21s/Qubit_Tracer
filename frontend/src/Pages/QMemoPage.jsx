import React from 'react';
import QMemoGrid from '../Components/qmemo/QMemoGrid';
import '../Components/qmemo/qmemo.css';

export default function QMemoPage() {
  return (
    <div className="qmemo-root">
      <div className="qmemo-hero">
        <h1>Q‑Memo Learning Hub</h1>
        <p>Interactive quantum computing micro-lessons, algorithms, and visual concept demonstrations.</p>
      </div>
      <QMemoGrid />
    </div>
  );
}