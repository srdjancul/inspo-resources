import InspoBrowser from '@/components/InspoBrowser';
import { getInspo, getMoodboards, getTaxonomy } from '@/lib/data';

export const metadata = { title: 'Inspiration — Inspo & Resources' };

export default function InspoPage() {
  const items = getInspo();
  return (
    <InspoBrowser items={items} groups={getTaxonomy(items)} boards={getMoodboards()} />
  );
}
