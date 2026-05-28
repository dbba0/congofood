'use client'

import { useState, useEffect } from 'react'

const links = [
  { label: 'Restaurants', href: '#restaurants' },
  { label: 'Livreurs', href: '#livreurs' },
  { label: 'Contact', href: '#restaurants-pro' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0F]/90 backdrop-blur-lg border-b border-[#2A2A35]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="font-syne font-extrabold text-2xl text-white tracking-tight">
            W<span className="text-[#C8FF57]">a</span>pi
          </a>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[#9CA3AF] hover:text-white transition-colors text-sm font-medium"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA + burger */}
          <div className="flex items-center gap-3">
            <a
              href="#waitlist"
              className="bg-[#C8FF57] text-[#0A0A0F] font-semibold text-sm px-4 py-2 rounded-full hover:bg-[#A8E040] transition-all hover:scale-105 active:scale-95"
            >
              Télécharger l'app
            </a>

            <button
              className="md:hidden flex flex-col justify-center gap-1 w-8 h-8 items-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-200 ${
                  menuOpen ? 'rotate-45 translate-y-[6px]' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-200 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-200 ${
                  menuOpen ? '-rotate-45 -translate-y-[6px]' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-[#2A2A35] py-4 space-y-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="block px-2 py-2.5 text-[#9CA3AF] hover:text-white text-sm transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
