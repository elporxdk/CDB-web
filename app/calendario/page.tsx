import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AGENDA_BLOQUEADA } from "@/lib/eventos";
import { VistaCalendario } from "@/components/calendario/VistaCalendario";
import { AgendaBloqueada } from "@/components/calendario/AgendaBloqueada";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Calendario — Di Astrea, Consejo Estudiantil Don Bosco",
  description:
    "Agenda pública del Consejo Estudiantil Di Astrea: torneos, informes trimestrales, festivales y actividades de cada proyecto, con fecha, hora y lugar.",
};

/**
 * Página del calendario.
 *
 * Lleva su propia cabecera en vez de reutilizar `Header`: ese componente monta
 * la barra de progreso del scroll y los enlaces con ancla de la portada
 * (#propuestas, #objetivos), que aquí no llevan a ninguna parte.
 */
export default function PaginaCalendario() {
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link className="brand" href="/">
            <Image
              className="brand-logo"
              src="/LOGO2.svg"
              alt=""
              width={34}
              height={34}
            />
            <span>
              DI ASTREA
              <small>Calendario · Don Bosco 2027</small>
            </span>
          </Link>

          <nav className="links">
            <Link href="/">Inicio</Link>
            <Link href="/#propuestas">Propuestas</Link>
            <Link href="/foro">Foro</Link>
            <Link href="/#buzon" className="nav-cta">
              Buzón de ideas
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {AGENDA_BLOQUEADA ? (
          <section className="cal-pagina">
            <div className="wrap">
              <div className="cal-pagina-head">
                <p className="tag">
                  <span className="dot" />
                  Agenda del Consejo
                </p>
                <h1>Calendario Di Astrea</h1>
                <p className="cal-lede">
                  Aquí va a vivir toda la agenda del Consejo: cada torneo, cada
                  informe trimestral y cada festival con su fecha, su hora y su
                  lugar. Hoy está cerrado, y abrirlo no depende de nosotros
                  solos.
                </p>
              </div>

              <AgendaBloqueada />
            </div>
          </section>
        ) : (
          // La vista lee ?evento= con useSearchParams, que obliga a un límite
          // de Suspense para que el resto de la página siga siendo estática.
          <Suspense fallback={<div className="cal-pagina" />}>
            <VistaCalendario />
          </Suspense>
        )}
      </main>

      <Footer />
    </>
  );
}
