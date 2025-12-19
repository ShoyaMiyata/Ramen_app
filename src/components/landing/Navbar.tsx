'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Soup } from 'lucide-react';
import { APP_NAME } from '@/lib/landing-constants';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '機能', href: '#features' },
    { name: 'ランク制度', href: '#ranks' },
    { name: '料金', href: '#pricing' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-md backdrop-blur-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/landing" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="bg-ramen-600 p-2 rounded-full text-white">
              <Soup size={24} />
            </div>
            <span className={`font-bold text-xl tracking-tight ${isScrolled ? 'text-gray-900' : 'text-gray-900 lg:text-white'}`}>
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`font-medium transition-colors hover:text-ramen-500 ${isScrolled ? 'text-gray-600' : 'text-white/90 hover:text-white'}`}
              >
                {link.name}
              </a>
            ))}
            <Link
              href="/sign-in"
              className="bg-ramen-600 hover:bg-ramen-700 text-white px-5 py-2 rounded-full font-bold transition-transform transform hover:scale-105 shadow-lg"
            >
              ログイン
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${isScrolled ? 'text-gray-600' : 'text-white'}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-xl absolute w-full border-t border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-4 text-base font-medium text-gray-700 hover:text-ramen-600 hover:bg-ramen-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4">
              <Link
                href="/sign-in"
                className="w-full block text-center bg-ramen-600 text-white px-5 py-3 rounded-lg font-bold shadow-md"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
