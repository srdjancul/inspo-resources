import AddForm from '@/components/AddForm';
import resources from '@/data/resources.json';
import taxonomy from '@/data/taxonomy.json';

export const metadata = { title: 'Add a link — Inspo & Resources' };

export default function AddPage() {
  const categories = [...new Set(resources.map((r) => r.category))];
  // Collection tags (Archive, Elements) are for bookkeeping, not for new additions.
  const groups = Object.entries(taxonomy)
    .filter(([label]) => label !== 'Collection')
    .map(([label, tags]) => ({ label, tags }));
  return <AddForm groups={groups} categories={categories} />;
}
