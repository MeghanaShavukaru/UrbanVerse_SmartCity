import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrbanVerse AI — Urban Decision Intelligence Platform",
  description:
    "AI-powered platform for city planners to evaluate infrastructure proposals using scenario simulation, interactive maps, and AI-generated insights.",
  keywords: [
    "urban planning",
    "AI",
    "smart cities",
    "GIS",
    "simulation",
    "sustainability",
    "UrbanVerse",
  ],
  authors: [{ name: "UrbanVerse AI Team" }],
  openGraph: {
    title: "UrbanVerse AI",
    description: "Ask your city before you change it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, plusJakarta.variable, "font-sans", geist.variable)}>
      <body className="font-inter antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
