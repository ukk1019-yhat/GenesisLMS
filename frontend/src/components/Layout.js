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
              <span className="text-2xl font-bold">📚 SchoolName</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-school-light transition">Home</Link>
              <Link href="/about" className="hover:text-school-light transition">About</Link>
              <Link href="/admissions" className="hover:text-school-light transition">Admissions</Link>
              <Link href="/contact" className="hover:text-school-light transition">Contact</Link>
              <Link href="/login" className="bg-white text-school-primary px-4 py-2 rounded-lg font-semibold hover:bg-school-light transition">
                Login
              </Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
              ☰
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-school-light" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/about" className="block py-2 hover:text-school-light" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/admissions" className="block py-2 hover:text-school-light" onClick={() => setMenuOpen(false)}>Admissions</Link>
            <Link href="/contact" className="block py-2 hover:text-school-light" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/login" className="block py-2 text-school-light font-semibold" onClick={() => setMenuOpen(false)}>Login</Link>
          </div>
        )}
      </nav>
      <main>{children}</main>
      <footer className="bg-school-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold">SchoolName</p>
          <p className="text-gray-400 mt-2">Empowering Education, Building Futures</p>
          <p className="text-gray-500 text-sm mt-4">&copy; {new Date().getFullYear()} SchoolName. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
