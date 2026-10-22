import Link from 'next/link';
import Header from '@/components/Header';
import HexArrow from '@/components/HexArrow';
import { counts } from '@/lib/data';

export default function Home() {
  const c = counts();
  return (
    <>
      <Header />
      <main className="entry">
        <p className="prompt" aria-hidden="true">0&gt; SELECT.&gt;<span className="caret" /></p>
        <h1 className="entry-title">What do you need today?</h1>
        <div className="choices">
          <Link href="/inspo" className="choice">
            <span className="choice-name">Inspiration</span>
            <span className="choice-meta">{c.inspo} websites and {c.moodboards} Pinterest moodboards, sorted by site type, style and section.</span>
            <HexArrow size={56} />
          </Link>
          <Link href="/resources" className="choice">
            <span className="choice-name">Resources</span>
            <span className="choice-meta">{c.resources} tools we use every day — galleries, AI tools, icons, fonts, mockups.</span>
            <HexArrow size={56} />
          </Link>
        </div>
      </main>
    </>
  );
}
