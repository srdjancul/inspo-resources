import Header from '@/components/Header';
import ResourcesBrowser from '@/components/ResourcesBrowser';
import { getResources } from '@/lib/data';

export const metadata = { title: 'Resources — Inspo & Resources' };

export default function ResourcesPage() {
  return (
    <>
      <Header active="resources" />
      <ResourcesBrowser sections={getResources()} />
    </>
  );
}
