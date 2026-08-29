import React, { useEffect, useMemo, useState } from 'react';
import QMemoPlayerModal from './QMemoPlayerModal';
import data from './qmemoData.sample.json';
import './qmemo.css';

const DEFAULT_CATEGORIES = [
  'All',
  'About',
  'Fundamentals',
  'Gates',
  'Circuits',
  'Topic Examples'
];

export default function QMemoGrid({ items }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [active, setActive] = useState(null);

  const list = items && Array.isArray(items) ? items : data;

  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    list.forEach(i => set.add(i.category || 'Topic Examples'));
    return Array.from(set);
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(item => {
      const catOK = category === 'All' || (item.category || 'Topic Examples') === category;
      if (!catOK) return false;
      if (!q) return true;
      const text = `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  }, [list, query, category]);

  // Basic keyboard shortcuts: focus search with '/'
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.target.closest('input,textarea')) {
        e.preventDefault();
        const inp = document.getElementById('qmemo-search');
        inp?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="qmemo-toolbar">
        <div className="qmemo-search-wrap">
          <input
            id="qmemo-search"
            className="qmemo-search"
            placeholder="Search lessons (press / to focus)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="qmemo-filter-wrap">
          <label className="sr-only" htmlFor="qmemo-filter">Filter by concept</label>
          <select
            id="qmemo-filter"
            className="qmemo-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="qmemo-table-container">
        <table className="qmemo-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th style={{ width: '150px' }}>Category</th>
              <th style={{ width: '100px' }}>Duration</th>
              <th>Tags</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="qmemo-title">{item.title}</div>
                    <div className="qmemo-desc">{item.description}</div>
                  </td>
                  <td>
                    <span className="qmemo-category">{item.category || 'Topic Examples'}</span>
                  </td>
                  <td>
                    <span className="qmemo-duration">{item.duration || '--:--'}</span>
                  </td>
                  <td>
                    <div className="qmemo-tags">
                      {(item.tags || []).slice(0, 3).map((t, i) => (
                        <span key={i} className="qmemo-tag">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="qmemo-action-btn"
                      onClick={() => setActive(item)}
                      aria-label={`Play ${item.title}`}
                    >
                      ▶ Play
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="qmemo-empty">
                  No resources found matching your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <QMemoPlayerModal
        open={!!active}
        item={active}
        onClose={() => setActive(null)}
      />
    </>
  );
}