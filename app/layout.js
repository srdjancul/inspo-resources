import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const sans = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
const serif = Instrument_Serif({ subsets: ['latin', 'latin-ext'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });

export const metadata = {
  title: 'Inspo & Resources',
  description: 'Shared library of design inspiration and everyday design tools.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
