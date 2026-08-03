import { HeroSection } from "@/components/marketing/hero-section"
import { PublicHeader } from "@/components/marketing/public-header"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <main>
        <HeroSection />
      </main>
    </div>
  )
}