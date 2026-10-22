import ResourcesBrowser from '@/components/ResourcesBrowser';
import { getResources } from '@/lib/data';

export const metadata = { title: 'Resources — Inspo & Resources' };

export default function ResourcesPage() {
  return (
    <ResourcesBrowser sections={getResources()} />
  );
}
