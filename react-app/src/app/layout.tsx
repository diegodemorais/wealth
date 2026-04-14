import type { Metadata } from 'next';
import '../styles/dashboard.css';
import '../chartSetup';

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
        <main>{children}</main>
      </body>
    </html>
  );
}
