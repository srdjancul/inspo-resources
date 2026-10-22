import fs from 'node:fs';
import path from 'node:path';
import inspo from '@/data/inspo.json';
import moodboards from '@/data/moodboards.json';
import resources from '@/data/resources.json';
import taxonomy from '@/data/taxonomy.json';
import { slugify, domainOf } from './slug.mjs';

const SHOTS_DIR = path.join(process.cwd(), 'public/shots');

export function getInspo() {
  const shots = new Set(fs.existsSync(SHOTS_DIR) ? fs.readdirSync(SHOTS_DIR) : []);
  // Newest additions (bottom of the file) first, archive last.
  const items = [...inspo].reverse().map((it) => {
    const slug = slugify(it.url);
    return {
      title: it.title,
      url: it.url,
      domain: domainOf(it.url),
      tags: it.tags || [],
      image: shots.has(`${slug}.webp`) ? `/shots/${slug}.webp` : null,
    };
  });
  return [...items.filter((i) => !i.tags.includes('Archive')), ...items.filter((i) => i.tags.includes('Archive'))];
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
