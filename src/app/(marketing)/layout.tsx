import { LandingFooter } from "@/features/landing/landing-footer";
import { LandingNav } from "@/features/landing/landing-nav";
import "@/features/landing/landing.css";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      {children}
      <LandingFooter />
    </div>
  );
}
