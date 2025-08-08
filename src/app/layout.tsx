import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fit360',
  description: 'Your Full Circle of Fitness',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-50">{children}</body>
    </html>
  );
}
