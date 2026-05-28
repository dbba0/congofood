import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Wapi — Livraison de nourriture à Kinshasa',
  description:
    'Commande tes plats préférés à Kinshasa. Livraison en 45 minutes par des livreurs locaux.',
  keywords: [
    'livraison',
    'Kinshasa',
    'nourriture',
    'food delivery',
    'RDC',
    'Congo',
    'Wapi',
    'restaurant',
    'Gombe',
  ],
  openGraph: {
    title: 'Wapi — Livraison de nourriture à Kinshasa',
    description:
      'Commande tes plats préférés à Kinshasa. Livraison en 45 minutes par des livreurs locaux.',
    url: 'https://wapi.cd',
    siteName: 'Wapi',
    locale: 'fr_CD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wapi — Livraison de nourriture à Kinshasa',
    description:
      'Commande tes plats préférés à Kinshasa. Livraison en 45 minutes par des livreurs locaux.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-[#0A0A0F] text-white font-dm antialiased">
        {children}
      </body>
    </html>
  )
}
