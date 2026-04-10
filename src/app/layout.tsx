import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DontWaste — Donate Food, Clothes & Books',
  description: 'Don\'t let good go to waste. Connect with NGOs and people in need across India — donate food, clothes, books and more for free.',
  keywords: 'food donation, clothes donation, book donation, NGO, volunteers, India, dontwaste',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
