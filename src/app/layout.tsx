import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NestJS + Prisma Admin Dashboard | Painel de Controle',
  description: 'Painel administrativo em Next.js conectado à API NestJS com Prisma ORM e PostgreSQL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
