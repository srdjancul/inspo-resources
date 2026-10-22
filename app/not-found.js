import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="entry">
        <h1 className="entry-title">This page doesn’t exist.</h1>
        <p className="muted"><Link href="/" className="text-link">Go back to the start</Link></p>
      </main>
    </>
  );
}
