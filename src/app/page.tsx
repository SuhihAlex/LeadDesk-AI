import { CtaSection } from "@/components/marketing/cta-section"
import { HeroSection } from "@/components/marketing/hero-section"
import { HowItWorksSection } from "@/components/marketing/how-it-works-section"
import { ProductSection } from "@/components/marketing/product-section"
import { PublicFooter } from "@/components/marketing/public-footer"
import { PublicHeader } from "@/components/marketing/public-header"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <HeroSection />
        <ProductSection />
        <HowItWorksSection />
        <CtaSection />
      </main>

      <PublicFooter />
    </div>
  )
}