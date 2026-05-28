'use client'

import { useEffect, useRef, useState } from 'react'

const restaurants = [
  { name: 'Chez Ntemba', category: 'Congolais', rating: 4.8, color: '#E85D04', initial: 'N' },
  { name: 'Pili-Pili Grillades', category: 'Grillades', rating: 4.7, color: '#F59E0B', initial: 'P' },
  { name: 'Maman Lola', category: 'Congolais', rating: 4.6, color: '#3B82F6', initial: 'L' },
  { name: 'Chez Philo', category: 'Congolais', rating: 4.5, color: '#8B5CF6', initial: 'P' },
  { name: 'Chez Bibi Fast Food', category: 'Fast-food', rating: 4.3, color: '#22C55E', initial: 'B' },
  { name: 'Madelia Fast Food', category: 'Fast-food', rating: 4.2, color: '#EC4899', initial: 'M' },
]

export default function RestaurantsSection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="restaurants" className="bg-[#0A0A0F] py-20 sm:py-24" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div
          className={`text-center mb-12 transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-[#E85D04] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Nos partenaires
          </p>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-2">
            Déjà sur Wapi
          </h2>
          <p className="text-[#E85D04] font-dm text-base">
            Les meilleurs de Gombe & Lingwala
          </p>
        </div>

        {/* Grille */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {restaurants.map((r, i) => (
            <div
              key={r.name}
              className={`group bg-[#1A1A2E] rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer border ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                borderColor: `${r.color}25`,
                transitionDelay: `${i * 80}ms`,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = `${r.color}60`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = `${r.color}25`
              }}
            >
              {/* Avatar initiale */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-syne font-extrabold text-2xl flex-shrink-0"
                style={{
                  backgroundColor: `${r.color}15`,
                  border: `2px solid ${r.color}35`,
                  color: r.color,
                }}
              >
                {r.initial}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h3 className="font-syne font-bold text-white text-sm truncate">{r.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-[#9CA3AF]">{r.category}</span>
                  <span className="text-[#2A2A35] text-xs">·</span>
                  <span className="text-xs text-yellow-400">⭐ {r.rating}</span>
                </div>
              </div>

              {/* Badge ouvert */}
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/25 rounded-full px-2 py-0.5 flex-shrink-0">
                OUVERT
              </span>
            </div>
          ))}
        </div>

        {/* CTA bas */}
        <div
          className={`text-center transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 border border-[#E85D04]/50 text-[#E85D04] font-semibold px-6 py-3 rounded-full hover:bg-[#E85D04] hover:text-white transition-all text-sm"
          >
            Voir tous les restaurants →
          </a>
        </div>
      </div>
    </section>
  )
}
