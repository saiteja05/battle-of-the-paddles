import type { Metadata, Viewport } from "next";
import { Archivo_Black, Archivo_Narrow, Bangers } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
});

const archivoNarrow = Archivo_Narrow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
});

export const metadata: Metadata = {
  title: "Battle of the Paddles",
  description: "OpenAI × MongoDB table tennis tournament — SPIN San Francisco",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#e10600",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${archivoBlack.variable} ${archivoNarrow.variable} antialiased`}>
        <div className="app-root min-h-screen">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
