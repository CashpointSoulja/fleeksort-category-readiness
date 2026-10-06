import type { Metadata, Viewport } from 'next';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'FleekSort Category Readiness Eval · independent concept',
  description: 'A grading-agreement evaluation harness and readiness gate for a new category bet. Independent concept by Ayomide Ahmed; not an official Fleek product. Synthetic demo data only.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8c642' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
