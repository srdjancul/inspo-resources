'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const KINDS = [
  { id: 'site', label: 'Website', noun: 'website' },
  { id: 'resource', label: 'Resource', noun: 'resource' },
  { id: 'moodboard', label: 'Moodboard', noun: 'moodboard' },
];
const NEW_CATEGORY = '__new__';

// Per-viewer conveniences only; the form works without storage.
const store = {
  get: (k) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

export default function AddForm({ groups, categories }) {
  const [kind, setKind] = useState('site');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState(categories[0] || '');
  const [newCategory, setNewCategory] = useState('');
  const [description, setDescription] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ state: 'idle' });
  const urlRef = useRef(null);

  useEffect(() => {
    setAddedBy(store.get('inspo:addedBy'));
    setPassword(store.get('inspo:password'));
  }, []);

  const noun = KINDS.find((k) => k.id === kind).noun;
  const busy = status.state === 'saving';
  const errorFor = (field) => (status.state === 'error' && status.field === field ? status.error : null);

  const toggleTag = (t) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: 'saving' });
    try {
      const res = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          url,
          title,
          tags,
          category: category === NEW_CATEGORY ? newCategory : category,
          description,
          addedBy,
          password,
        }),
      });
      const data = await res.json().catch(() => ({ ok: false, error: 'The server sent back something unexpected. Try again.' }));
      if (!data.ok) {
        setStatus({ state: 'error', error: data.error, field: data.field });
        return;
      }
      store.set('inspo:addedBy', addedBy);
      store.set('inspo:password', password);
      setStatus({ state: 'done', item: data.item, commitUrl: data.commitUrl, kind });
    } catch {
      setStatus({ state: 'error', error: 'Couldn’t reach the server. Check your connection and try again.' });
    }
  }

  function addAnother() {
    setUrl('');
    setTitle('');
    setTags([]);
    setDescription('');
    setNewCategory('');
    setStatus({ state: 'idle' });
    requestAnimationFrame(() => urlRef.current?.focus());
  }

  if (status.state === 'done') {
    const where = { site: '/inspo', resource: '/resources', moodboard: '/inspo?view=boards' }[status.kind];
    return (
      <main className="page add-page">
        <div className="add-done fade-in" role="status">
          <h1 className="page-title">Added.</h1>
          <p className="lede">
            “{status.item.title}” is saved. It shows up on the site in about {status.kind === 'site' ? 'five' : 'two'} minutes,
            {status.kind === 'site' ? ' once its screenshot is taken and' : ''} the site redeploys.
          </p>
          <div className="add-actions">
            <button className="btn-solid" onClick={addAnother}>Add another</button>
            <Link className="text-link" href={where}>Back to the library</Link>
            {status.commitUrl && (
              <a className="text-link" href={status.commitUrl} target="_blank" rel="noreferrer">See the change on GitHub</a>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page add-page">
      <div className="page-head">
        <h1 className="page-title">Add a link</h1>
      </div>

      <form className="add-form" onSubmit={submit} noValidate>
        <fieldset className="field">
          <legend className="label">What are you adding?</legend>
          <div className="choice-row">
            {KINDS.map((k) => (
              <label key={k.id} className="chip chip-radio">
                <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} />
                {k.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label className="label" htmlFor="add-url">{kind === 'moodboard' ? 'Pinterest board link' : 'Link'}</label>
          <input
            ref={urlRef}
            id="add-url"
            className="input"
            type="url"
            inputMode="url"
            autoComplete="off"
            required
            placeholder={kind === 'moodboard' ? 'https://www.pinterest.com/…' : 'https://'}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={Boolean(errorFor('url'))}
            aria-describedby={errorFor('url') ? 'add-url-error' : undefined}
          />
          {errorFor('url') && <p className="field-error" id="add-url-error">{errorFor('url')}</p>}
        </div>

        <div className="field">
          <label className="label" htmlFor="add-title">{kind === 'moodboard' ? 'Name' : 'Name (optional)'}</label>
          <input
            id="add-title"
            className="input"
            type="text"
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={Boolean(errorFor('title'))}
            aria-describedby={kind === 'moodboard' ? undefined : 'add-title-hint'}
          />
          {kind !== 'moodboard' && <p className="hint" id="add-title-hint">Leave empty to use the page’s own title.</p>}
          {errorFor('title') && <p className="field-error">{errorFor('title')}</p>}
        </div>

        {kind === 'site' && (
          <fieldset className="field">
            <legend className="label">Tags</legend>
            <p className="hint">Pick what fits: a type, Dark or Light, and a style or two.</p>
            <div className="add-tags">
              {groups.map((g) => (
                <div className="tag-group" key={g.label}>
                  <span className="tag-group-label">{g.label}</span>
                  <div className="chips">
                    {g.tags.map((t) => (
                      <button type="button" key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {kind === 'resource' && (
          <>
            <div className="field">
              <label className="label" htmlFor="add-category">Category</label>
              <select id="add-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value={NEW_CATEGORY}>New category…</option>
              </select>
              {category === NEW_CATEGORY && (
                <input
                  className="input"
                  type="text"
                  aria-label="New category name"
                  placeholder="Category name"
                  maxLength={40}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              )}
              {errorFor('category') && <p className="field-error">{errorFor('category')}</p>}
            </div>
            <div className="field">
              <label className="label" htmlFor="add-desc">What is it for?</label>
              <input
                id="add-desc"
                className="input"
                type="text"
                maxLength={200}
                placeholder="One line, e.g. “Free icon set with 1,000 line icons.”"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={Boolean(errorFor('description'))}
              />
              {errorFor('description') && <p className="field-error">{errorFor('description')}</p>}
            </div>
          </>
        )}

        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="add-by">Your name (optional)</label>
            <input id="add-by" className="input" type="text" maxLength={40} autoComplete="given-name" value={addedBy} onChange={(e) => setAddedBy(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="add-password">Team password</label>
            <input
              id="add-password"
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errorFor('password'))}
            />
            {errorFor('password') && <p className="field-error">{errorFor('password')}</p>}
          </div>
        </div>

        {status.state === 'error' && !status.field && <p className="form-error" role="alert">{status.error}</p>}

        <div className="add-actions">
          <button className="btn-solid" type="submit" disabled={busy || !url.trim() || !password}>
            {busy ? 'Adding…' : `Add ${noun}`}
          </button>
          <span className="hint">Saved straight to the shared library on GitHub.</span>
        </div>
      </form>
    </main>
  );
}
