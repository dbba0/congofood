'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const BASE_COUNT = 127

export default function WaitlistSection() {
  const [visible, setVisible] = useState(false)
  const [phone, setPhone] = useState('')
  const [count, setCount] = useState(BASE_COUNT)
  const [displayCount, setDisplayCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: true })
  const ref = useRef<HTMLDivElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Chargement du compteur depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('wapi_waitlist_count')
    if (stored) setCount(parseInt(stored, 10))
  }, [])

  // Animation du compteur au scroll
  useEffect(() => {
    if (!visible || animatedRef.current) return
    animatedRef.current = true

    const target = count
    const duration = 1800
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [visible, count])

  const showToast = useCallback((message: string, success = true) => {
    setToast({ show: true, message, success })
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    const waitlist: string[] = JSON.parse(localStorage.getItem('wapi_waitlist') ?? '[]')

    if (waitlist.includes(phone.trim())) {
      showToast('Tu es déjà sur la liste ! On te contacte bientôt. 🎉')
      return
    }

    waitlist.push(phone.trim())
    localStorage.setItem('wapi_waitlist', JSON.stringify(waitlist))

    const newCount = count + 1
    setCount(newCount)
    setDisplayCount(newCount)
    localStorage.setItem('wapi_waitlist_count', String(newCount))

    setSubmitted(true)
    setPhone('')
    showToast("Tu es sur la liste ! 🎉 On t'envoie un SMS le jour du lancement.")
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section id="waitlist" className="py-20 sm:py-28 relative overflow-hidden" ref={ref}>
      {/* Fond dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A0800] via-[#0A0A0F] to-[#06001A]" />

      {/* Halos */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-[#E85D04] opacity-[0.10] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#C8FF57] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

      {/* Toast */}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
          toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="bg-[#22C55E] text-white font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm whitespace-nowrap font-dm">
          ✓ {toast.message}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <div
          className={`text-center transition-all duration-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge live */}
          <div className="inline-flex items-center gap-2 bg-[#E85D04]/15 border border-[#E85D04]/35 rounded-full px-4 py-1.5 mb-7">
            <span className="w-2 h-2 bg-[#E85D04] rounded-full animate-pulse-dot" />
            <span className="text-[#E85D04] text-sm font-semibold font-dm">Bientôt disponible</span>
          </div>

          {/* Titre */}
          <h2 className="font-syne font-extrabold text-3xl sm:text-5xl text-white mb-4 leading-tight">
            Wapi arrive bientôt
            <br />
            <span className="text-[#E85D04]">à Kinshasa</span>
          </h2>
          <p className="text-[#9CA3AF] text-base sm:text-lg mb-10 font-dm">
            Sois parmi les premiers à commander.
          </p>

          {/* Compteur */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex -space-x-2">
              {['#E85D04', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${color}30`, borderColor: color }}
                >
                  <span style={{ color }}>
                    {['K', 'A', 'M', 'B', 'L'][i]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[#9CA3AF] text-sm font-dm">
              <span className="font-syne font-extrabold text-2xl text-[#C8FF57] tabular-nums">
                {displayCount}
              </span>
              {' '}personnes attendent déjà
            </p>
          </div>

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
          >
            <input
              type="tel"
              placeholder="+243 XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-[#1A1A2E] border border-[#2A2A35] rounded-full px-5 py-3.5 text-white text-sm placeholder-[#5A5A6B] focus:border-[#E85D04] transition-colors font-dm"
              required
            />
            <button
              type="submit"
              disabled={submitted}
              className="bg-[#C8FF57] text-[#0A0A0F] font-bold px-6 py-3.5 rounded-full hover:bg-[#A8E040] transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap text-sm font-dm"
            >
              {submitted ? '✓ Inscrit !' : 'Je veux être notifié →'}
            </button>
          </form>

          <p className="text-[#5A5A6B] text-xs font-dm">
            Pas de spam. On t'envoie juste un SMS le jour du lancement.
          </p>
        </div>
      </div>
    </section>
  )
}
