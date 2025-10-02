import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update to the real domain when deployed
const siteUrl = "https://nestfinder.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NestFinder — Find Your Perfect Home",
    template: "%s | NestFinder",
  },
  description:
    "Discover premium properties for sale and rent across India. NestFinder — your trusted real estate portal.",
  applicationName: "NestFinder",
  keywords: [
    "real estate India",
    "property for sale",
    "flats for rent",
    "buy house online",
    "property listings",
    "apartments",
    "villas",
    "real estate portal",
  ],
  authors: [{ name: "NestFinder" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "NestFinder",
    title: "NestFinder — Find Your Perfect Home",
    description:
      "Discover premium properties for sale and rent across India. NestFinder — your trusted real estate portal.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "NestFinder logo" }],
  },
  twitter: {
    card: "summary",
    title: "NestFinder — Find Your Perfect Home",
    description:
      "Discover premium properties for sale and rent across India. NestFinder — your trusted real estate portal.",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1420" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
