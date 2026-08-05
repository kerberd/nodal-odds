import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Nodal Odds — AI-Powered Market Intelligence',
  description:
    'Real-time prediction market prices, AI-generated analysis, and risk-free paper trading in one terminal.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base text-gray-100 font-mono">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
