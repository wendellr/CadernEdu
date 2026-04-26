import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Logos from '@/components/Logos'
import Audiences from '@/components/Audiences'
import Features from '@/components/Features'
import Operations from '@/components/Operations'
import Inclusion from '@/components/Inclusion'
import Robotics from '@/components/Robotics'
import Mascots from '@/components/Mascots'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import CTAFinal from '@/components/CTAFinal'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Logos />
        <Audiences />
        <section className="py-0">
          <Features />
        </section>
        <Operations />
        <Inclusion />
        <Robotics />
        <Mascots />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  )
}
