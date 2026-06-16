import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link'; // <--- ADD THIS IMPORT

export const metadata: Metadata = {
  title: 'My E-Store',
  description: 'The boldest marketplace on the internet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white text-black">

        {/* Main Content (All your pages render here) */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Global Footer (Inverted) */}
        <footer className="bg-black text-white pt-16 pb-8 px-8 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-4xl font-black uppercase tracking-widest mb-4">E-Store</h2>
              <p className="font-mono text-sm text-gray-400 max-w-sm leading-relaxed">
                The boldest marketplace on the internet. Shop raw, authentic products directly from independent sellers. Built with speed, security, and style.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-6 border-b-2 border-white inline-block pb-2">Navigation</h3>
              <ul className="space-y-4 font-mono text-sm font-bold">
                <li>
                  <Link href="/" className="hover:underline decoration-2 underline-offset-4 hover:text-gray-300 transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/shops" className="hover:underline decoration-2 underline-offset-4 hover:text-gray-300 transition-colors">All Stores</Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:underline decoration-2 underline-offset-4 hover:text-gray-300 transition-colors">Shopping Cart</Link>
                </li>
              </ul>
            </div>

            {/* Legal / Social */}
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-6 border-b-2 border-white inline-block pb-2">Connect</h3>
              <ul className="space-y-4 font-mono text-sm font-bold">
                <li>
                  <a href="#" className="hover:underline decoration-2 underline-offset-4 hover:text-gray-300 transition-colors">Twitter / X</a>
                </li>
                <li>
                  <a href="#" className="hover:underline decoration-2 underline-offset-4 hover:text-gray-300 transition-colors">Instagram</a>
                </li>
                <li>
                  <a href="#" className="hover:underline decoration-2 underline-offset-4 hover:text-gray-300 transition-colors">Seller Support</a>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright Bar */}
          <div className="max-w-7xl mx-auto border-t-4 border-white pt-8 flex flex-col md:flex-row justify-between items-center font-mono text-xs font-bold uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} E-Store. All rights reserved.</p>
            {/* Notice this badge is inverted to white bg, black text! */}
          </div>
        </footer>

      </body>
    </html>
  );
}