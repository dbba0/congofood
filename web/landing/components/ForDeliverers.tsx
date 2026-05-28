'use client'

import { useEffect, useRef, useState } from 'react'

const benefits = [
  {
    icon: '💰',
    title: 'Paiement quotidien',
    desc: 'Reçois tes gains chaque jour sur Airtel Money ou Orange Money.',
  },
  {
    icon: '🗺️',
    title: 'Tu choisis tes horaires',
    desc: 'Travaille quand tu veux. Active/désactive ta dispo en 1 clic.',
  },
  {
    icon: '🛡️',
    title: 'Support 7j/7',
    desc: "Une équipe WhatsApp disponible pour t'aider sur le terrain.",
  },
]

const statCards = [
  { icon: '🛵', value: '0', label: 'Livreurs actifs', note: 'à Kinshasa' },
  { icon: '💵', value: '$30+', label: 'Revenus moy.', note: 'par jour' },
  { icon: '⏱️', value: '45 min', label: 'Délai moyen', note: 'par commande' },
  { icon: '🗺️', value: '5+', label: 'Zones couvertes', note: 'communes' },
]

export default function ForDeliverers() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '243000000000'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="livreurs" className="bg-[#0A0A0F] py-20 sm:py-24" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Colonne texte */}
          <div
            className={`transition-all duration-500 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-[#C8FF57] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Pour les livreurs
            </p>
            <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-3">
              Deviens livreur Wapi
            </h2>
            <p className="text-[#9CA3AF] font-dm mb-8 leading-relaxed">
              Gagne de l'argent à ton rythme avec ta moto.
            </p>

            <div className="space-y-5 mb-8">
              {benefits.map((b, i) => (
                <div
                  key={b.title}
                  className={`flex items-start gap-4 transition-all duration-500 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${(i + 1) * 120}ms` }}
                >
                  <div className="w-10 h-10 bg-[#C8FF57]/10 border border-[#C8FF57]/25 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-white text-sm mb-1">{b.title}</h3>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed font-dm">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                'Bonjour, je veux devenir livreur Wapi.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C8FF57] text-[#0A0A0F] font-bold px-6 py-3 rounded-full hover:bg-[#A8E040] transition-all hover:scale-105 active:scale-95 text-sm font-dm"
            >
              🛵 Devenir livreur →
            </a>
          </div>

          {/* Colonne visuelle */}
          <div
            className={`transition-all duration-500 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="bg-[#1A1A2E] border border-[#C8FF57]/15 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              {/* Décoration fond */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C8FF57] opacity-[0.04] rounded-full" />

              <div className="grid grid-cols-2 gap-3 relative mb-4">
                {statCards.map((s) => (
                  <div key={s.label} className="bg-[#111118] rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="font-syne font-extrabold text-xl text-[#C8FF57]">{s.value}</div>
                    <div className="text-white text-[11px] font-bold mt-0.5">{s.label}</div>
                    <div className="text-[#5A5A6B] text-[10px] font-dm">{s.note}</div>
                  </div>
                ))}
              </div>

              {/* Badge inscription */}
              <div className="bg-[#C8FF57]/10 border border-[#C8FF57]/25 rounded-2xl p-4 text-center">
                <p className="text-[#C8FF57] font-syne font-bold text-sm">
                  🚀 Inscriptions ouvertes
                </p>
                <p className="text-[#9CA3AF] text-xs mt-1 font-dm">
                  Rejoins la première vague de livreurs Wapi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
