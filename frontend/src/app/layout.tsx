import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/providers";

export const metadata: Metadata = { title: "HireHub: AI-Powered Recruitment & Placement", description: "Connect talent with opportunities using AI." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
