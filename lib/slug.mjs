// Turns a URL into a stable file-safe id. Screenshots live at public/shots/<slug>.webp.
export function slugify(url) {
  const u = new URL(url);
  const raw = (u.hostname.replace(/^www\./, '') + u.pathname + u.search).toLowerCase();
  return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

export function domainOf(url) {
  return new URL(url).hostname.replace(/^www\./, '');
}

// Sites that block screenshots behind logins/walls: use their preview image instead.
export const PREVIEW_IMAGE_HOSTS = /(^|\.)(dribbble\.com|behance\.net|pinterest\.[a-z.]+|x\.com|twitter\.com|savee\.it|freepik\.com)$/;
