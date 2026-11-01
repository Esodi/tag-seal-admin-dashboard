import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Tag & Seal Admin", template: "%s · Tag & Seal" },
  description: "Animal management, field operations, blueprints and reporting.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><AppProviders>{children}</AppProviders></body></html>;
}
