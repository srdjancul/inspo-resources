// Validates the data files. Runs in CI on every push / pull request.
import fs from 'node:fs';
import { slugify } from '../lib/slug.mjs';

const read = (f) => {
  try {
    return JSON.parse(fs.readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
  } catch (e) {
    console.error(`✗ data/${f} is not valid JSON: ${e.message}`);
    process.exit(1);
  }
};

const errors = [];
const warnings = [];
const isUrl = (u) => { try { return /^https?:$/.test(new URL(u).protocol); } catch { return false; } };

const taxonomy = read('taxonomy.json');
const knownTags = new Set(Object.values(taxonomy).flat());

function checkList(file, required, extra) {
  const seen = new Map();
  read(file).forEach((it, i) => {
    const where = `data/${file} item ${i + 1} (${it.title || it.url || '?'})`;
    for (const k of required) if (typeof it[k] !== 'string' || !it[k].trim()) errors.push(`${where}: missing "${k}"`);
    if (it.url && !isUrl(it.url)) errors.push(`${where}: "${it.url}" is not a full http(s) link`);
    if (it.url && isUrl(it.url)) {
      const id = slugify(it.url);
      if (seen.has(id)) errors.push(`${where}: duplicate of item ${seen.get(id)}`);
      else seen.set(id, i + 1);
    }
    extra?.(it, where);
  });
}

checkList('inspo.json', ['title', 'url'], (it, where) => {
  if (it.tags !== undefined && !(Array.isArray(it.tags) && it.tags.every((t) => typeof t === 'string')))
    errors.push(`${where}: "tags" must be a list like ["Agency", "Hero"]`);
  if (it.screenshot !== undefined && typeof it.screenshot !== 'boolean')
    errors.push(`${where}: "screenshot" must be true or false`);
  for (const t of it.tags || []) if (!knownTags.has(t)) warnings.push(`${where}: tag "${t}" is not in taxonomy.json (it will show under "Other")`);
});
checkList('resources.json', ['title', 'url', 'category', 'description']);
checkList('moodboards.json', ['title', 'url']);

for (const w of warnings) console.warn('! ' + w);
for (const e of errors) console.error('✗ ' + e);
if (errors.length) process.exit(1);
console.log('✓ data looks good');
