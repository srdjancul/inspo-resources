// Minimal GitHub Contents API client used by the "Add" form to commit data changes.
const API = process.env.GITHUB_API_URL || 'https://api.github.com';

function config() {
  return {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO || 'srdjancul/inspo-resources',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

export const isConfigured = () => Boolean(process.env.GITHUB_TOKEN && process.env.ADD_PASSWORD);

async function gh(path, init = {}) {
  const { token } = config();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
  });
  return res;
}

export async function readJson(file) {
  const { repo, branch } = config();
  const res = await gh(`/repos/${repo}/contents/${file}?ref=${encodeURIComponent(branch)}`);
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const body = await res.json();
  return { data: JSON.parse(Buffer.from(body.content, 'base64').toString('utf8')), sha: body.sha };
}

// Read-modify-write with a retry when someone else committed in between (409/422 on a stale sha).
export async function updateJson(file, mutate, message) {
  const { repo, branch } = config();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, sha } = await readJson(file);
    const next = mutate(data);
    const res = await gh(`/repos/${repo}/contents/${file}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        branch,
        sha,
        content: Buffer.from(JSON.stringify(next, null, 2) + '\n', 'utf8').toString('base64'),
      }),
    });
    if (res.ok) return (await res.json()).commit?.html_url;
    if (res.status !== 409 && res.status !== 422) throw new Error(`GitHub write failed (${res.status})`);
  }
  throw new Error('GitHub write kept conflicting');
}
