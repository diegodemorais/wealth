import type { Metadata } from 'next';
import './globals.css';
import '../styles/dashboard.css';
import { LayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: 'Wealth Dashboard',
  description: 'Financial dashboard powered by Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
