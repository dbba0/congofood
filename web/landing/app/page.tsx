import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import RestaurantsSection from '@/components/RestaurantsSection'
import ForRestaurants from '@/components/ForRestaurants'
import ForDeliverers from '@/components/ForDeliverers'
import WaitlistSection from '@/components/WaitlistSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <RestaurantsSection />
      <ForRestaurants />
      <ForDeliverers />
      <WaitlistSection />
      <Footer />
    </main>
  )
}
