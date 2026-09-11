import type { Metadata, Viewport } from "next";
import "./globals.css";
import FloatingHearts from "@/components/FloatingHearts";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sorteo-amor-amistad.vercel.app"),
  title: "❤️ Sorteo de Amor y Amistad 🎁",
  description: "Descubre a quién te toca en el sorteo de Amor y Amistad. ¡Rápido, seguro y divertido!",
  openGraph: {
    title: "❤️ Sorteo de Amor y Amistad",
    description: "Descubre a quién te toca en el sorteo 🎁",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sorteo de Amor y Amistad",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "❤️ Sorteo de Amor y Amistad",
    description: "Descubre a quién te toca en el sorteo 🎁",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F080C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="ambient-bg" />
        <FloatingHearts />
        <main className="app-container">{children}</main>
      </body>
    </html>
  );
}
