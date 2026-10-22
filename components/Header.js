'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const active = usePathname().split('/')[1];
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">Inspo &amp; Resources</Link>
      <nav className="site-nav" aria-label="Main">
        <Link href="/inspo" aria-current={active === 'inspo' ? 'page' : undefined}>Inspiration</Link>
        <Link href="/resources" aria-current={active === 'resources' ? 'page' : undefined}>Resources</Link>
      </nav>
      <Link className="btn-outline" href="/add" aria-current={active === 'add' ? 'page' : undefined}>
        Add a link
      </Link>
    </header>
  );
}
