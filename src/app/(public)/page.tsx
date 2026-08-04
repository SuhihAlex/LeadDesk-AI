import { CtaSection } from "@/components/marketing/cta-section"
import { HeroSection } from "@/components/marketing/hero-section"
import { HowItWorksSection } from "@/components/marketing/how-it-works-section"
import { ProductSection } from "@/components/marketing/product-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  )
}