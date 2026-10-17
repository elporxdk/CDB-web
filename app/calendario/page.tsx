import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AGENDA_BLOQUEADA } from "@/lib/eventos";
import { VistaCalendario } from "@/components/calendario/VistaCalendario";
import { AgendaBloqueada } from "@/components/calendario/AgendaBloqueada";
import Footer from "@/components/Footer";
import Marca from "@/components/Marca";
import { SelectorTema } from "@/components/SelectorTema";

export const metadata: Metadata = {
  // La plantilla de app/layout.tsx completa el título con el nombre del sitio.
  title: "Calendario",
  description:
    "Agenda oficial del Consejo Estudiantil Di Astrea: torneos, informes trimestrales, festivales y actividades de cada proyecto, con fecha, hora y lugar.",
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
          <Marca href="/" detalle="Calendario" />

          <nav className="links" aria-label="Principal">
            <Link href="/">Inicio</Link>
            <Link href="/#propuestas">Propuestas</Link>
            <Link href="/#enviar-propuesta" className="nav-cta">
              Enviar propuesta
            </Link>
          </nav>

          <div className="nav-acciones">
            <SelectorTema />
          </div>
        </div>
      </header>

      <main>
        {AGENDA_BLOQUEADA ? (
          <section className="cal-pagina">
            <div className="wrap">
              <div className="cal-pagina-head">
                <p className="tag">
                  <span className="dot" />
                  Agenda oficial
                </p>
                <h1>Calendario del Consejo</h1>
                <p className="cal-lede">
                  Aquí va a vivir toda la agenda del Consejo: cada torneo, cada
                  informe trimestral y cada festival con su fecha, su hora y su
                  lugar. La estamos preparando.
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
