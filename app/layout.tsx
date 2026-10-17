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

const NOMBRE_SITIO = "Sitio Oficial del Consejo Estudiantil - Di Astrea";
const DESCRIPCION =
  "Sitio oficial del Consejo Estudiantil Di Astrea, Colegio Don Bosco: los proyectos del Consejo y su estado, la agenda de actividades y el envío de propuestas del estudiantado.";

export const metadata: Metadata = {
  // La plantilla añade el nombre del sitio a cada página que defina su propio
  // título («Calendario · Sitio Oficial…»). La portada usa `default`.
  title: {
    default: NOMBRE_SITIO,
    template: `%s · ${NOMBRE_SITIO}`,
  },
  description: DESCRIPCION,
  applicationName: NOMBRE_SITIO,
  openGraph: {
    type: "website",
    locale: "es_SV",
    siteName: NOMBRE_SITIO,
    title: NOMBRE_SITIO,
    description: DESCRIPCION,
  },
};

/**
 * Tema antes del primer pintado.
 *
 * El servidor no sabe qué tema prefiere cada visitante: está en localStorage y
 * en el sistema operativo. Si se resolviera desde React, la página se pintaría
 * primero en oscuro y saltaría a claro tras hidratar. Este script va en <head>
 * y el navegador lo ejecuta de forma síncrona mientras lee el HTML, así que el
 * primer pintado ya sale con el tema correcto.
 *
 * Orden de preferencia: lo que el visitante eligió con el botón y, si nunca lo
 * tocó, lo que pide su sistema. El try/catch cubre los navegadores que bloquean
 * localStorage (modo privado estricto): ahí se queda el oscuro del servidor.
 *
 * Patrón de la guía de Next «Preventing flash before hydration».
 */
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("tema");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // data-scroll-behavior evita que el scroll suave del CSS se aplique al
    // cambiar de ruta: sin esto, ir a /calendario animaba el salto al inicio.
    //
    // suppressHydrationWarning: el script de arriba cambia data-theme antes de
    // que React hidrate, y sin esto React lo tomaría por un error y repintaría.
    // Solo afecta a los atributos de <html>, no a su contenido.
    <html
      lang="es"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${unbounded.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <div className="stars-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
