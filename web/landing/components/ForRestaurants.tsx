'use client'

import { useEffect, useRef, useState } from 'react'

const benefits = [
  {
    icon: '🚀',
    title: '0% de commission les 2 premiers mois',
    desc: "Teste gratuitement. On prend 10-15% seulement quand tu es convaincu.",
  },
  {
    icon: '📱',
    title: 'Dashboard simple sur tablette',
    desc: 'Reçois et gère tes commandes depuis une interface intuitive.',
  },
  {
    icon: '📈',
    title: 'Plus de clients, zéro effort',
    desc: "On s'occupe de la livraison. Tu cuisines, on livre.",
  },
]

const quartiers = ['Gombe', 'Lingwala', 'Barumbu', 'Kintambo', 'Ngaliema']

export default function ForRestaurants() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({ name: '', phone: '', quartier: '' })
  const [error, setError] = useState('')

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '243000000000'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.quartier) {
      setError('Merci de remplir tous les champs.')
      return
    }
    setError('')
    const text = encodeURIComponent(
      `Bonjour, je suis ${form.name} situé à ${form.quartier}. Je veux rejoindre Wapi. Mon numéro : ${form.phone}`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="restaurants-pro" className="py-20 sm:py-24 bg-gradient-to-b from-[#111118] to-[#0A0A0F]" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div
          className={`text-center mb-12 transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-[#E85D04] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Restaurateurs
          </p>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-3">
            Tu as un restaurant à Kinshasa ?
          </h2>
          <p className="text-[#9CA3AF] max-w-lg mx-auto font-dm">
            Rejoins Wapi et touche des milliers de clients sans investissement.
          </p>
        </div>

        {/* Cards avantages */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`bg-[#1A1A2E] border border-[#2A2A35] rounded-2xl p-6 hover:border-[#E85D04]/35 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 130}ms` }}
            >
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="font-syne font-bold text-base text-white mb-2">{b.title}</h3>
              <p className="text-[#9CA3AF] text-sm leading-relaxed font-dm">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Formulaire WhatsApp */}
        <div
          className={`max-w-lg mx-auto bg-[#1A1A2E] border border-[#2A2A35] rounded-2xl p-6 sm:p-8 transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '390ms' }}
        >
          <h3 className="font-syne font-bold text-xl text-white mb-1 text-center">
            Rejoindre Wapi
          </h3>
          <p className="text-[#9CA3AF] text-xs text-center mb-6 font-dm">
            On vous rappelle dans les 24h
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1.5 font-dm">
                Nom du restaurant *
              </label>
              <input
                type="text"
                placeholder="Ex: Chez Mama Béatrice"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0A0A0F] border border-[#2A2A35] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5A5A6B] focus:border-[#E85D04] transition-colors font-dm"
              />
            </div>

            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1.5 font-dm">
                Numéro WhatsApp *
              </label>
              <input
                type="tel"
                placeholder="+243 XX XXX XXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#0A0A0F] border border-[#2A2A35] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5A5A6B] focus:border-[#E85D04] transition-colors font-dm"
              />
            </div>

            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1.5 font-dm">Quartier *</label>
              <div className="relative">
                <select
                  value={form.quartier}
                  onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                  className="w-full bg-[#0A0A0F] border border-[#2A2A35] rounded-xl px-4 py-3 text-white text-sm focus:border-[#E85D04] transition-colors appearance-none font-dm pr-10"
                >
                  <option value="" disabled>
                    Sélectionner ton quartier
                  </option>
                  {quartiers.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A5A6B] pointer-events-none text-xs">
                  ▾
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-dm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#C8FF57] text-[#0A0A0F] font-bold py-3 rounded-xl hover:bg-[#A8E040] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-dm"
            >
              📲 Nous contacter sur WhatsApp →
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
