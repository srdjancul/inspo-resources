'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const REPO_URL = 'https://github.com/srdjancul/inspo-resources';

export default function Header() {
  const active = usePathname().split('/')[1];
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">Inspo &amp; Resources</Link>
      <nav className="site-nav" aria-label="Main">
        <Link href="/inspo" aria-current={active === 'inspo' ? 'page' : undefined}>Inspiration</Link>
        <Link href="/resources" aria-current={active === 'resources' ? 'page' : undefined}>Resources</Link>
      </nav>
      <a className="btn-outline" href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
        Add a link
        <svg className="ext" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" /></svg>
        <span className="visually-hidden"> (opens the guide on GitHub)</span>
      </a>
    </header>
  );
}
