import fs from 'node:fs';
import path from 'node:path';
import inspo from '@/data/inspo.json';
import moodboards from '@/data/moodboards.json';
import resources from '@/data/resources.json';
import taxonomy from '@/data/taxonomy.json';
import { slugify, domainOf } from './slug.mjs';

const SHOTS_DIR = path.join(process.cwd(), 'public/shots');

// Card tags read in filter order: site type, theme, style, section, collection.
const TAG_ORDER = new Map(Object.values(taxonomy).flat().map((t, i) => [t, i]));
const byTaxonomy = (a, b) => (TAG_ORDER.get(a) ?? 999) - (TAG_ORDER.get(b) ?? 999);

export function getInspo() {
  const shots = new Set(fs.existsSync(SHOTS_DIR) ? fs.readdirSync(SHOTS_DIR) : []);
  // Newest additions (bottom of the file) first; sites without a screenshot and the archive go last.
  const items = [...inspo].reverse().map((it) => {
    const slug = slugify(it.url);
    return {
      title: it.title,
      url: it.url,
      domain: domainOf(it.url),
      tags: [...(it.tags || [])].sort(byTaxonomy),
      image: shots.has(`${slug}.webp`) ? `/shots/${slug}.webp` : null,
    };
  });
  const rank = (i) => (i.tags.includes('Archive') ? 2 : 0) + (i.image ? 0 : 1);
  return items.map((it, n) => [it, n]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([it]) => it);
}

export function getTaxonomy(items) {
  // Tags used in data but missing from taxonomy.json still show up, under "Other".
  const known = new Set(Object.values(taxonomy).flat());
  const extra = [...new Set(items.flatMap((i) => i.tags))].filter((t) => !known.has(t)).sort();
  const groups = Object.entries(taxonomy).map(([label, tags]) => ({ label, tags }));
  if (extra.length) groups.push({ label: 'Other', tags: extra });
  return groups;
}

export const getMoodboards = () => moodboards;

export function getResources() {
  const order = [];
  for (const r of resources) if (!order.includes(r.category)) order.push(r.category);
  return order.map((category) => ({
    category,
    items: resources.filter((r) => r.category === category).map((r) => ({ ...r, domain: domainOf(r.url) })),
  }));
}

export const counts = () => ({ inspo: inspo.length, moodboards: moodboards.length, resources: resources.length });
