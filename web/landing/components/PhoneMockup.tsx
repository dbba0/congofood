'use client'

const restaurants = [
  { name: 'Chez Ntemba', cat: 'Congolais', rating: '4.8', color: '#E85D04', emoji: '🍖' },
  { name: 'Pili-Pili Grillades', cat: 'Grillades', rating: '4.7', color: '#F59E0B', emoji: '🔥' },
  { name: 'Maman Lola', cat: 'Congolais', rating: '4.6', color: '#3B82F6', emoji: '🍲' },
]

export default function PhoneMockup() {
  return (
    <div className="relative w-[270px] h-[540px] mx-auto animate-float">
      {/* Halo orange derrière le téléphone */}
      <div className="absolute -inset-8 bg-[#E85D04] opacity-[0.08] blur-[60px] rounded-full -z-10" />

      {/* Châssis du téléphone */}
      <div className="absolute inset-0 bg-[#1A1A2E] rounded-[40px] border-2 border-[#2A2A35] shadow-2xl shadow-black/60">
        {/* Encoche */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0A0A0F] rounded-full z-10" />

        {/* Écran */}
        <div className="absolute top-8 bottom-6 left-[6px] right-[6px] bg-[#111118] rounded-[34px] overflow-hidden">
          {/* Barre de statut */}
          <div className="flex justify-between items-center px-4 pt-3 pb-1 text-[9px] text-[#5A5A6B]">
            <span className="font-bold">9:41</span>
            <div className="flex items-center gap-1">
              <span>▲▲▲</span>
              <span>🔋</span>
            </div>
          </div>

          {/* En-tête */}
          <div className="px-3 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] text-[#5A5A6B]">Livraison à</p>
                <p className="text-[11px] font-bold text-white flex items-center gap-1">
                  Gombe, Kinshasa
                  <span className="text-[#E85D04]">▾</span>
                </p>
              </div>
              <div className="w-7 h-7 bg-[#E85D04] rounded-full flex items-center justify-center text-[11px]">
                👤
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mx-3 mb-2 bg-[#1A1A2E] rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-[10px] text-[#5A5A6B]">🔍</span>
            <span className="text-[9px] text-[#5A5A6B]">Rechercher un plat...</span>
          </div>

          {/* Bannière promo */}
          <div className="mx-3 mb-2 bg-gradient-to-r from-[#E85D04] to-[#C44E00] rounded-xl px-3 py-2">
            <p className="text-white text-[9px] font-bold">🎉 OUVERTURE SPÉCIALE</p>
            <p className="text-white/75 text-[8px]">Livraison gratuite · Code WAPI</p>
          </div>

          {/* Section restaurants */}
          <div className="px-3 mb-2">
            <p className="text-white text-[9px] font-bold">Restaurants populaires</p>
          </div>

          {restaurants.map((r) => (
            <div
              key={r.name}
              className="mx-3 mb-1.5 bg-[#1A1A2E] rounded-xl p-2 flex items-center gap-2"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] flex-shrink-0"
                style={{
                  backgroundColor: `${r.color}20`,
                  border: `1px solid ${r.color}40`,
                }}
              >
                {r.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[9px] font-bold truncate">{r.name}</p>
                <p className="text-[#5A5A6B] text-[8px]">
                  {r.cat} · ⭐ {r.rating}
                </p>
              </div>
              <span className="text-[7px] text-green-400 font-bold flex-shrink-0">OUVERT</span>
            </div>
          ))}

          {/* Barre de navigation bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-[#2A2A35] flex justify-around items-center py-2">
            {(['🏠', '🔍', '🛒', '👤'] as const).map((icon, i) => (
              <span
                key={i}
                className={`text-sm ${i === 0 ? 'text-[#E85D04]' : 'text-[#5A5A6B]'}`}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
