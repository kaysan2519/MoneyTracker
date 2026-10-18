import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Money Tracker — Kelola Keuangan Pribadi',
  description: 'Aplikasi web modern untuk mencatat dan memantau pemasukan serta pengeluaran finansial pribadi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
