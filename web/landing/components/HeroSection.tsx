'use client'

import { useEffect, useState } from 'react'
import PhoneMockup from './PhoneMockup'

const stats = [
  { icon: '🏪', label: '7 restaurants partenaires' },
  { icon: '🛵', label: 'Livraison en 45 min' },
  { icon: '💳', label: 'Cash & Mobile Money' },
]

export default function HeroSection() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Déclenche l'animation d'entrée après montage
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <section className="relative min-h-screen bg-[#0A0A0F] overflow-hidden flex items-center pt-16">
      {/* Halos de fond */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#E85D04] opacity-[0.07] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[360px] h-[360px] bg-[#C8FF57] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Colonne texte */}
          <div
            className={`transition-all duration-700 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#1A1A2E] border border-[#2A2A35] rounded-full px-4 py-2 mb-7">
              <span>🇨🇩</span>
              <span className="text-sm text-[#9CA3AF]">Kinshasa</span>
              <span className="text-[#2A2A35] text-sm">·</span>
              <span className="text-sm text-[#E85D04] font-semibold">Bientôt disponible</span>
            </div>

            {/* Titre principal */}
            <h1 className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-5 text-white">
              La nourriture de
              <br />
              <span className="text-[#E85D04]">Kinshasa,</span> livrée
              <br />
              chez toi.
            </h1>

            {/* Sous-titre */}
            <p className="font-dm text-[#9CA3AF] text-base sm:text-lg mb-5 leading-relaxed max-w-md">
              Commande tes plats préférés en quelques clics. Livrés en moins de 45 minutes par
              des livreurs locaux.
            </p>

            {/* Phrase Lingala */}
            <div className="mb-8">
              <p className="font-dm italic text-[#E85D04] text-lg">
                "Olingi nini ? Wapi eya."
              </p>
              <p className="text-[#5A5A6B] text-sm mt-1">
                — "Tu veux quoi ? Wapi arrive."
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 bg-[#C8FF57] text-[#0A0A0F] font-bold px-6 py-3 rounded-full hover:bg-[#A8E040] transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                Rejoindre la liste d'attente →
              </a>
              <a
                href="#restaurants-pro"
                className="inline-flex items-center gap-2 border border-[#2A2A35] text-white font-semibold px-6 py-3 rounded-full hover:border-[#E85D04] hover:text-[#E85D04] transition-all text-sm sm:text-base"
              >
                Je suis un restaurant
              </a>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="inline-flex items-center gap-2 bg-[#111118] border border-[#2A2A35] rounded-full px-3 py-1.5"
                >
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-xs text-[#9CA3AF] font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne mockup téléphone */}
          <div
            className={`flex justify-center lg:justify-end transition-all duration-700 delay-300 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Dégradé de fondu vers la section suivante */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111118] to-transparent pointer-events-none" />
    </section>
  )
}
