import type { Metadata } from "next";
import { HomeEcosystem } from "@/features/landing/home-ecosystem";
import { HomeFinalCta } from "@/features/landing/home-final-cta";
import { HomeHowItWorks } from "@/features/landing/home-how-it-works";
import { HomeMissionBand } from "@/features/landing/home-mission-band";
import { HomePlatforms } from "@/features/landing/home-platforms";
import { LandingHero } from "@/features/landing/landing-hero";
import { LandingTrust } from "@/features/landing/landing-trust";

export const metadata: Metadata = {
  title: "Tag & Seal",
  description:
    "Livestock identity, farm operations, and trusted records for agricultural teams.",
};

export default function HomePage() {
  return (
    <main>
      <LandingHero />
      <LandingTrust />
      <HomeEcosystem />
      <HomeHowItWorks />
      <HomePlatforms />
      <HomeMissionBand />
      <HomeFinalCta />
    </main>
  );
}
