import type { Metadata } from "next";
import { LandingAbout } from "@/features/landing/landing-about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tag & Seal by Climb Up Limited—digital livestock identity and farm oversight for Tanzania.",
};

export default function AboutPage() {
  return (
    <main className="pt-16">
      <LandingAbout />
    </main>
  );
}
