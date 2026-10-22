// Captures a preview image for every inspo item that doesn't have one yet.
// Usage: npm run shots            (only missing)
//        npm run shots -- --force (redo all)
//        npm run shots -- <url>   (redo one)
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { slugify, PREVIEW_IMAGE_HOSTS } from '../lib/slug.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/shots');
const WIDTH = 960, HEIGHT = 600;
const CONCURRENCY = Number(process.env.SHOTS_CONCURRENCY || 6);

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => a.startsWith('http'));

const items = JSON.parse(await fs.readFile(path.join(ROOT, 'data/inspo.json'), 'utf8'));
await fs.mkdir(OUT, { recursive: true });

// Remove screenshots of links that were deleted from inspo.json.
const wanted = new Set(items.map((it) => slugify(it.url) + '.webp'));
for (const f of await fs.readdir(OUT)) {
  if (f.endsWith('.webp') && !wanted.has(f)) {
    await fs.unlink(path.join(OUT, f));
    console.log(`removed orphan ${f}`);
  }
}

const exists = (p) => fs.access(p).then(() => true, () => false);
const todo = [];
for (const it of items) {
  if (only.length && !only.includes(it.url)) continue;
  const file = path.join(OUT, slugify(it.url) + '.webp');
  if (!force && !only.length && (await exists(file))) continue;
  todo.push({ ...it, file });
}
console.log(`${todo.length} to capture`);
if (!todo.length) process.exit(0);

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, proxy });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  locale: 'en-US',
  reducedMotion: 'no-preference',
});

const HIDE_OVERLAYS = `
  #onetrust-consent-sdk, #CybotCookiebotDialog, .cky-consent-container, #usercentrics-root,
  [id*="cookie" i]:not(html,body), [class*="cookie-banner" i], [class*="cookieBanner" i],
  [id*="consent" i]:not(html,body), [class*="consent-banner" i], [aria-label*="cookie" i] { display: none !important; }
`;

async function save(buffer, file) {
  await sharp(buffer).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' }).webp({ quality: 72 }).toFile(file);
}

async function previewImage(page, url) {
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (!res) throw new Error('no response');
  if (res.status() >= 400) throw new Error(`dead link (HTTP ${res.status()})`);
  await page.waitForTimeout(3000);
  // og:image when the site exposes one, otherwise the largest image on the page (Dribbble, Behance)
  const src = await page.evaluate(() => {
    const meta = document.querySelector('meta[property="og:image"], meta[name="twitter:image"]')?.content;
    if (meta) return meta;
    const imgs = [...document.images].filter((i) => i.naturalWidth >= 400 && i.naturalHeight >= 250);
    imgs.sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight);
    return imgs[0]?.currentSrc;
  });
  if (!src) throw new Error('no preview image');
  const img = await context.request.get(new URL(src, url).href, { timeout: 30000 });
  if (!img.ok()) throw new Error(`preview image ${img.status()}`);
  return img.body();
}

async function screenshot(page, url) {
  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 35000 });
    if (res && res.status() >= 400 && res.status() !== 403) throw new Error(`dead link (HTTP ${res.status()})`);
  } catch (e) {
    if (!/Timeout/.test(e.message)) throw e; // slow sites: shoot whatever rendered
  }
  await page.addStyleTag({ content: HIDE_OVERLAYS }).catch(() => {});
  await page.waitForTimeout(3500);
  return page.screenshot({ type: 'jpeg', quality: 90 });
}

const failed = [];
let done = 0;
async function worker() {
  while (todo.length) {
    const it = todo.shift();
    const page = await context.newPage();
    try {
      const host = new URL(it.url).hostname;
      const capture = PREVIEW_IMAGE_HOSTS.test(host)
        ? previewImage(page, it.url).catch((e) => {
            if (e.message.startsWith('dead link')) throw e;
            return screenshot(page, it.url);
          })
        : screenshot(page, it.url);
      // Hard cap per site so one hanging page can't stall the whole run.
      const buf = await Promise.race([
        capture,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), 90000)),
      ]);
      await save(buf, it.file);
    } catch (e) {
      failed.push(`${it.url}  (${e.message.split('\n')[0]})`);
    } finally {
      await page.close().catch(() => {});
      done++;
      if (done % 20 === 0) console.log(`${done} done, ${failed.length} failed`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();
console.log(`Finished. ${done - failed.length} saved, ${failed.length} failed.`);
for (const f of failed) console.log('  ✗', f);
