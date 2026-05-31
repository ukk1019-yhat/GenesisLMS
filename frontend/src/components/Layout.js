import Link from 'next/link';
import { useState } from 'react';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-school-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Genesis Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold tracking-wide">Genesis International</span>
            </Link>
            <div className="hidden md:flex space-x-6 items-center">
              <Link href="/" className="hover:text-school-accent transition font-medium">Home</Link>
              <Link href="/about" className="hover:text-school-accent transition font-medium">About</Link>
              <Link href="/admissions" className="hover:text-school-accent transition font-medium">Admissions</Link>
              <Link href="/contact" className="hover:text-school-accent transition font-medium">Contact</Link>
              <Link href="/login" className="bg-school-accent text-school-dark px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition">
                Staff Login
              </Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 border-t border-blue-900">
            <Link href="/" className="block py-2 hover:text-school-accent" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/about" className="block py-2 hover:text-school-accent" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/admissions" className="block py-2 hover:text-school-accent" onClick={() => setMenuOpen(false)}>Admissions</Link>
            <Link href="/contact" className="block py-2 hover:text-school-accent" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/login" className="block py-2 text-school-accent font-semibold" onClick={() => setMenuOpen(false)}>Staff Login</Link>
          </div>
        )}
      </nav>
      <main>{children}</main>
      <footer className="bg-school-dark text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img src="/logo.png" alt="Genesis Logo" className="h-8 w-auto" />
            <p className="text-xl font-bold tracking-wide">Genesis International School</p>
          </div>
          <p className="text-school-accent font-medium mt-1 italic">Learn · Lead · Achieve</p>
          <div className="flex justify-center space-x-6 mt-4 text-gray-400 text-sm">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/admissions" className="hover:text-white transition">Admissions</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-gray-500 text-sm mt-6">&copy; {new Date().getFullYear()} Genesis International School. All rights reserved.</p>
          <p className="text-gray-600 text-xs mt-1">Designed by Edu Alt Tech</p>
        </div>
      </footer>
    </div>
  );
}
