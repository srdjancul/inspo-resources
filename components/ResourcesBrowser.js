'use client';

import { useMemo, useState } from 'react';
import HexArrow from './HexArrow';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function ResourcesBrowser({ sections }) {
  const [q, setQ] = useState('');
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((r) => `${r.title} ${r.description} ${r.domain} ${s.category}`.toLowerCase().includes(needle)),
      }))
      .filter((s) => s.items.length);
  }, [sections, q]);

  return (
    <main className="page">
      <div className="page-head">
        <h1 className="page-title">Resources</h1>
        <input
          type="search"
          className="search search-compact"
          placeholder={`Search ${total} tools`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search resources"
        />
      </div>

      <nav className="chips jump" aria-label="Categories">
        {sections.map((s) => (
          <a key={s.category} className="chip" href={`#${slug(s.category)}`}>
            {s.category}<span className="chip-count">{s.items.length}</span>
          </a>
        ))}
      </nav>

      {visible.length === 0 && (
        <div className="empty">
          <p>No tools match “{q}”.</p>
          <button className="text-link" onClick={() => setQ('')}>Clear search</button>
        </div>
      )}

      {visible.map((s) => (
        <section key={s.category} id={slug(s.category)} className="res-section">
          <h2 className="section-title">
            {s.category} <span className="section-count">{s.items.length}</span>
          </h2>
          <ul className="res-list">
            {s.items.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer" className="res">
                  <img
                    className="res-icon"
                    src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=64`}
                    alt=""
                    width="20"
                    height="20"
                    loading="lazy"
                  />
                  <span className="res-text">
                    <span className="res-title">{r.title}</span>
                    <span className="res-desc">{r.description}</span>
                  </span>
                  <span className="res-domain">{r.domain}</span>
                  <HexArrow size={40} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
