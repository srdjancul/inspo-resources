import Header from '@/components/Header';

// Shared shell for the inner pages; the header stays mounted while moving between them.
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
