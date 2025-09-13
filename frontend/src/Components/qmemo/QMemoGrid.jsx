import React, { useEffect, useMemo, useState } from 'react';
import QMemoCard from './QMemoCard';
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
            placeholder="Search videos (press / to focus)…"
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

      <div className="qmemo-grid">
        {filtered.map(item => (
          <QMemoCard key={item.id} item={item} onOpen={() => setActive(item)} />
        ))}
        {!filtered.length && (
          <div className="qmemo-empty">
            No results. Try another search or change the filter.
          </div>
        )}
      </div>

      <QMemoPlayerModal
        open={!!active}
        item={active}
        onClose={() => setActive(null)}
      />
    </>
  );
}