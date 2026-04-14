import type { Metadata } from 'next';
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
      <body style={{ margin: 0, backgroundColor: '#0f1117', color: '#fff' }}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
