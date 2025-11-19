import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Order Online | QSR Platform',
  description: 'Order your favorite food online for pickup or delivery',
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
