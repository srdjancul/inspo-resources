'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import HexArrow from './HexArrow';

// Filters live in the URL (?view=boards&tags=Hero,Grid&q=bank) so a filtered view can be shared.
function readParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    view: p.get('view') === 'boards' ? 'boards' : 'sites',
    tags: p.get('tags') ? p.get('tags').split(',') : [],
    q: p.get('q') || '',
  };
}

function writeParams({ view, tags, q }) {
  const p = new URLSearchParams();
  if (view === 'boards') p.set('view', 'boards');
  if (tags.length) p.set('tags', tags.join(','));
  if (q) p.set('q', q);
  const qs = p.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

// Screenshots fade in once loaded instead of popping in while scrolling.
function Shot({ src }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      ref={(el) => { if (el?.complete) setLoaded(true); }}
      onLoad={() => setLoaded(true)}
      className={loaded ? 'is-loaded' : undefined}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      width="960"
      height="600"
    />
  );
}

export default function InspoBrowser({ items, groups, boards }) {
  const [view, setView] = useState('sites');
  const [tags, setTags] = useState([]);
  const [q, setQ] = useState('');
  const [ready, setReady] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile: all filter groups
  const [moreOpen, setMoreOpen] = useState(false); // desktop: rarely used groups
  const primary = groups.slice(0, 3);
  const secondary = groups.slice(3);
  const segRef = useRef(null);
  const [pill, setPill] = useState(null);

  // Measure the active tab so the pill can slide to it.
  useLayoutEffect(() => {
    const measure = () => {
      const el = segRef.current?.querySelector('[aria-selected="true"]');
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [view]);

  useEffect(() => {
    const s = readParams();
    setView(s.view);
    setTags(s.tags);
    setQ(s.q);
    if (secondary.some((g) => g.tags.some((t) => s.tags.includes(t)))) setMoreOpen(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeParams({ view, tags, q });
  }, [view, tags, q, ready]);

  const tagCounts = useMemo(() => {
    const c = {};
    for (const it of items) for (const t of it.tags) c[t] = (c[t] || 0) + 1;
    return c;
  }, [items]);

  // OR inside a group (Agency or Branding), AND across groups (Agency and Hero).
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const active = groups
      .map((g) => g.tags.filter((t) => tags.includes(t)))
      .filter((sel) => sel.length);
    return items.filter((it) => {
      if (needle && !`${it.title} ${it.domain} ${it.tags.join(' ')}`.toLowerCase().includes(needle)) return false;
      return active.every((sel) => sel.some((t) => it.tags.includes(t)));
    });
  }, [items, groups, tags, q]);

  const toggle = (t) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const renderGroup = (g) => (
    <div className="tag-group" key={g.label}>
      <span className="tag-group-label">{g.label}</span>
      <div className="chips">
        {g.tags.filter((t) => tagCounts[t]).map((t) => (
          <button key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => toggle(t)}>
            {t}<span className="chip-count">{tagCounts[t]}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="page">
      <div className="page-head">
        <h1 className="page-title">Inspiration</h1>
        <div ref={segRef} className={`segmented${pill ? ' is-ready' : ''}`} role="tablist" aria-label="View">
          {pill && (
            <span className="segmented-pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} aria-hidden="true" />
          )}
          <button role="tab" aria-selected={view === 'sites'} onClick={() => setView('sites')}>
            Websites <span className="count">{items.length}</span>
          </button>
          <button role="tab" aria-selected={view === 'boards'} onClick={() => setView('boards')}>
            Moodboards <span className="count">{boards.length}</span>
          </button>
        </div>
      </div>

      {view === 'sites' ? (
        <div key="sites" className="fade-in">
          <section className="filters" aria-label="Filters">
            <div className="search-row">
              <input
                type="search"
                className="search"
                placeholder="Search by name, domain or tag"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search websites"
              />
              <span className="result-count" aria-live="polite">
                {filtered.length} of {items.length}
              </span>
              {(tags.length > 0 || q) && (
                <button className="text-link" onClick={() => { setTags([]); setQ(''); }}>
                  Clear filters
                </button>
              )}
              <button
                className="filters-toggle"
                aria-expanded={filtersOpen}
                aria-controls="filter-groups"
                onClick={() => setFiltersOpen((o) => !o)}
              >
                Filters{tags.length > 0 && <span className="count">{tags.length}</span>}
              </button>
            </div>
            <div id="filter-groups" className={`collapse collapse-mobile${filtersOpen ? ' is-open' : ''}`}>
              <div className="filter-groups">
                {primary.map(renderGroup)}
                {secondary.length > 0 && (
                  <>
                    <div id="more-filters" className={`collapse${moreOpen ? ' is-open' : ''}`}>
                      <div className="filter-groups">{secondary.map(renderGroup)}</div>
                    </div>
                    <button
                      className="text-link more-toggle"
                      aria-expanded={moreOpen}
                      aria-controls="more-filters"
                      onClick={() => setMoreOpen((o) => !o)}
                    >
                      {moreOpen ? 'Fewer filters' : `More filters: ${secondary.map((g) => g.label).join(', ')}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {filtered.length ? (
            <ul key={tags.join('|')} className="grid fade-in">
              {filtered.map((it) => (
                <li key={it.url} className="card">
                  <a href={it.url} target="_blank" rel="noreferrer" className="card-link">
                    <div className="card-media">
                      {it.image ? (
                        <Shot src={it.image} />
                      ) : (
                        <span className="card-placeholder">{it.domain}</span>
                      )}
                      <span className="card-go"><HexArrow size={44} /></span>
                    </div>
                    <div className="card-body">
                      <span className="card-title">{it.title}</span>
                      <span className="card-domain">{it.domain}</span>
                    </div>
                  </a>
                  {it.tags.length > 0 && (
                    <div className="card-tags">
                      {it.tags.map((t) => (
                        <button key={t} className="card-tag" aria-pressed={tags.includes(t)} onClick={() => toggle(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p>{q.trim() ? `Nothing matches “${q.trim()}”.` : 'Nothing matches these filters.'}</p>
              <button className="text-link" onClick={() => { setTags([]); setQ(''); }}>Clear filters</button>
            </div>
          )}
        </div>
      ) : (
        <section key="boards" className="fade-in" aria-label="Pinterest moodboards">
          <p className="lede">Each board opens on Pinterest — save new pins there and they show up for everyone.</p>
          <ul className="boards">
            {boards.map((b) => (
              <li key={b.url}>
                <a href={b.url} target="_blank" rel="noreferrer" className="board">
                  <span className="board-name">{b.title}</span>
                  <HexArrow size={44} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
