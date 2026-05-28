const navLinks = [
  { label: 'Restaurants', href: '#restaurants' },
  { label: 'Livreurs', href: '#livreurs' },
  { label: 'Contact', href: '#restaurants-pro' },
  { label: "Liste d'attente", href: '#waitlist' },
]

const legalLinks = [
  { label: 'Mentions légales', href: '#' },
  { label: 'Confidentialité', href: '#' },
  { label: 'Contact', href: '#' },
]

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '243000000000'

  return (
    <footer className="bg-[#0A0A0F] border-t border-[#2A2A35]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Marque */}
          <div className="lg:col-span-2">
            <a href="#" className="font-syne font-extrabold text-2xl text-white block mb-3">
              W<span className="text-[#C8FF57]">a</span>pi
            </a>
            <p className="text-[#9CA3AF] text-sm italic mb-2 font-dm">
              "Olingi nini ? Wapi eya."
            </p>
            <p className="text-[#5A5A6B] text-xs font-dm leading-relaxed max-w-xs">
              La livraison de nourriture à Kinshasa, par des locaux pour des locaux.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[#9CA3AF] hover:text-white text-sm transition-colors font-dm"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-4">Légal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[#9CA3AF] hover:text-white text-sm transition-colors font-dm"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-[#2A2A35] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#5A5A6B] text-sm font-dm">
            © 2026 Wapi · Kinshasa, RDC 🇨🇩
          </p>

          {/* Réseaux sociaux */}
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Wapi"
              className="w-9 h-9 bg-[#1A1A2E] border border-[#2A2A35] rounded-full flex items-center justify-center hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all text-base"
            >
              📱
            </a>

            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook Wapi"
              className="w-9 h-9 bg-[#1A1A2E] border border-[#2A2A35] rounded-full flex items-center justify-center hover:border-[#1877F2] hover:bg-[#1877F2]/10 transition-all font-syne font-bold text-sm text-[#9CA3AF]"
            >
              f
            </a>

            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram Wapi"
              className="w-9 h-9 bg-[#1A1A2E] border border-[#2A2A35] rounded-full flex items-center justify-center hover:border-[#E85D04] hover:bg-[#E85D04]/10 transition-all text-[11px] text-[#9CA3AF] font-dm font-semibold"
            >
              IG
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
