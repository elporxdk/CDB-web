import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Di Astrea — Consejo Estudiantil, Colegio Don Bosco 2027",
  description:
    "Plataforma de transparencia del Consejo Estudiantil Di Astrea, Colegio Don Bosco 2027: propuestas, estado de cada proyecto y buzón de ideas.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" className={`${unbounded.variable} ${manrope.variable}`}>
      <body>
        <div className="stars-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
