import type { Metadata, Viewport } from "next";
import "./globals.css";
import AmbientParticles from "@/components/AmbientParticles";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sorteo-amigo-secreto.vercel.app"),
  title: "Sorteo de Amigo Secreto",
  description: "Descubre a quién te corresponde en el sorteo de Amigo Secreto y sus sugerencias de regalo.",
  openGraph: {
    title: "Sorteo de Amigo Secreto",
    description: "Descubre a quién te corresponde en el sorteo y sus sugerencias de regalo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sorteo de Amigo Secreto",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sorteo de Amigo Secreto",
    description: "Descubre a quién te corresponde en el sorteo y sus sugerencias de regalo.",
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
  themeColor: "#090D14",
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
        <AmbientParticles />
        <main className="app-container">{children}</main>
      </body>
    </html>
  );
}
