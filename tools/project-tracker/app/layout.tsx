import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QSR Platform - Project Tracker',
  description: 'Real-time development progress tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
