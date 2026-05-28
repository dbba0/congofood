'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: '01',
    icon: '📱',
    title: 'Choisis ton plat',
    desc: 'Browse les meilleurs restaurants de ton quartier à Kinshasa.',
  },
  {
    number: '02',
    icon: '💳',
    title: 'Commande & paye',
    desc: 'Cash à la livraison ou Airtel Money · Orange Money · M-Pesa.',
  },
  {
    number: '03',
    icon: '🛵',
    title: 'Livraison rapide',
    desc: 'Ton livreur arrive en moins de 45 min. Suis ta commande en temps réel.',
  },
]

export default function HowItWorks() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="comment-ca-marche" className="bg-[#111118] py-20 sm:py-24" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div
          className={`text-center mb-14 transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-[#E85D04] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Comment ça marche
          </p>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white">
            Simple comme bonjour
          </h2>
        </div>

        {/* Étapes */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Ligne de connexion desktop */}
          <div className="hidden md:block absolute top-11 left-[calc(16.7%+20px)] right-[calc(16.7%+20px)] h-px bg-gradient-to-r from-[#E85D04] via-[#E85D04]/40 to-[#C8FF57]/60" />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative bg-[#1A1A2E] border border-[#2A2A35] rounded-2xl p-6 hover:border-[#E85D04]/40 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 140}ms` }}
            >
              {/* Point de connexion */}
              <div className="absolute -top-2.5 left-6 w-5 h-5 bg-[#E85D04] rounded-full border-2 border-[#111118] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>

              {/* Numéro */}
              <div className="font-syne font-extrabold text-5xl text-[#E85D04] opacity-25 leading-none mb-4">
                {step.number}
              </div>

              {/* Icône */}
              <div className="text-3xl mb-4">{step.icon}</div>

              {/* Contenu */}
              <h3 className="font-syne font-bold text-lg text-white mb-2">{step.title}</h3>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
