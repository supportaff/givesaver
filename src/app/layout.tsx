import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'DontWaste — Doorstep Scrap Collection in Chennai',
  description: 'Schedule a free doorstep scrap pickup and get paid fair market rates for paper, plastic, metal, e-waste and appliances. Serving Chennai.',
  keywords: 'scrap collection Chennai, kabadiwala Chennai, doorstep scrap pickup, sell scrap online Chennai, paper scrap rate Chennai',
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
