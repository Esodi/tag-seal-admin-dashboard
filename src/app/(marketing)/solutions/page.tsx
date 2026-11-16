import type { Metadata } from "next";
import { LandingSolutions } from "@/features/landing/landing-solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Livestock identity, farm operations, offline sync, veterinary dispatch, marketplace, auctions, and milk cooperatives.",
};

export default function SolutionsPage() {
  return (
    <main className="pt-16">
      <LandingSolutions />
    </main>
  );
}
