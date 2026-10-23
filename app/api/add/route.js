import { createHash, timingSafeEqual } from 'node:crypto';
import taxonomy from '@/data/taxonomy.json';
import { slugify, domainOf } from '@/lib/slug.mjs';
import { isConfigured, updateJson } from '@/lib/github';

export const dynamic = 'force-dynamic';

const FILES = { site: 'data/inspo.json', resource: 'data/resources.json', moodboard: 'data/moodboards.json' };
const KNOWN_TAGS = new Set(Object.values(taxonomy).flat());

class UserError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

// Forgiving on purpose: stray spaces from copy-paste, phone auto-capitalisation and "smart" dashes/quotes
// shouldn't lock a teammate out of a shared password.
const normalisePassword = (v) =>
  String(v || '')
    .normalize('NFKC')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim()
    .toLowerCase();
const digest = (v) => createHash('sha256').update(normalisePassword(v)).digest();

function passwordOk(given) {
  if (!normalisePassword(given)) return false;
  return timingSafeEqual(digest(given), digest(process.env.ADD_PASSWORD));
}

function normaliseUrl(raw) {
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new UserError('That doesn’t look like a link. Paste the full address, e.g. https://example.com.');
  }
  if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) {
    throw new UserError('That doesn’t look like a link. Paste the full address, e.g. https://example.com.');
  }
  for (const k of [...u.searchParams.keys()]) if (/^(utm_.*|ref|fbclid|gclid)$/i.test(k)) u.searchParams.delete(k);
  u.hash = '';
  return u.toString().replace(/\/$/, '');
}

// Page title when the person leaves the name empty; falls back to the domain.
async function fetchTitle(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36' },
      signal: AbortSignal.timeout(6000),
      redirect: 'follow',
    });
    const html = (await res.text()).slice(0, 200000);
    const raw =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
    if (!raw) return null;
    const text = raw.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
    const first = text.split(/\s+[|–—·•-]\s+|:\s+/)[0].trim();
    return first && first.length <= 40 ? first : null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    if (!isConfigured()) {
      throw new UserError('Adding isn’t switched on yet. GITHUB_TOKEN and ADD_PASSWORD have to be set in the Vercel project.', 503);
    }
    const body = await request.json().catch(() => ({}));
    if (!passwordOk(body.password)) throw new UserError('Wrong team password.', 401, { field: 'password' });

    const kind = body.kind;
    if (!FILES[kind]) throw new UserError('Choose what you’re adding.');
    const url = normaliseUrl(clean(body.url, 500));
    const by = clean(body.addedBy, 40);
    let title = clean(body.title, 80) || (await fetchTitle(url)) || domainOf(url);

    let item;
    if (kind === 'site') {
      const tags = Array.isArray(body.tags) ? [...new Set(body.tags.filter((t) => KNOWN_TAGS.has(t)))] : [];
      item = { title, url, tags };
    } else if (kind === 'resource') {
      const category = clean(body.category, 40);
      const description = clean(body.description, 200);
      if (!category) throw new UserError('Pick a category.', 400, { field: 'category' });
      if (!description) throw new UserError('Add a one-line description so others know what it’s for.', 400, { field: 'description' });
      item = { title, url, category, description };
    } else {
      if (!/(^|\.)pinterest\.[a-z.]+$/.test(new URL(url).hostname) && !/^pin\.it$/.test(new URL(url).hostname)) {
        throw new UserError('Moodboards are Pinterest boards. Paste the board’s link.', 400, { field: 'url' });
      }
      title = clean(body.title, 80);
      if (!title) throw new UserError('Give the moodboard a name.', 400, { field: 'title' });
      item = { title, url };
    }

    const id = slugify(url);
    const label = { site: 'inspiration', resource: 'resources', moodboard: 'moodboards' }[kind];
    const message = `Add "${title}" to ${label}\n\nAdded through the site${by ? ` by ${by}` : ''}.`;

    const commitUrl = await updateJson(
      FILES[kind],
      (list) => {
        const dupe = list.find((x) => slugify(x.url) === id);
        if (dupe) throw new UserError(`Already there as “${dupe.title}”.`, 409, { field: 'url' });
        if (kind === 'resource') {
          // keep resources grouped by category
          const last = list.map((x) => x.category).lastIndexOf(item.category);
          if (last >= 0) return [...list.slice(0, last + 1), item, ...list.slice(last + 1)];
        }
        return [...list, item];
      },
      message,
    );

    return Response.json({ ok: true, item, commitUrl });
  } catch (e) {
    if (e instanceof UserError) return Response.json({ ok: false, error: e.message, ...e.extra }, { status: e.status });
    console.error(e);
    return Response.json({ ok: false, error: 'Saving to GitHub failed. Try again in a minute.' }, { status: 502 });
  }
}
