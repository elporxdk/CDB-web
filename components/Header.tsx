"use client";

import Link from "next/link";
import { useState } from "react";
import Marca from "@/components/Marca";
import { SelectorTema } from "@/components/SelectorTema";

/**
 * Menú corto a propósito: lo que se visita, no todo lo que hay. «El nombre» y
 * el adelanto del foro siguen en la portada y en el pie.
 */
const ENLACES: { href: string; label: string; ruta?: boolean }[] = [
  { href: "#propuestas", label: "Propuestas" },
  { href: "#objetivos", label: "Objetivos" },
  // Otra ruta y no un ancla: con <Link> Next la precarga.
  { href: "/calendario", label: "Calendario", ruta: true },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const cerrar = () => setOpen(false);

  const enlace = (e: (typeof ENLACES)[number], alPulsar?: () => void) =>
    e.ruta ? (
      <Link key={e.href} href={e.href} onClick={alPulsar}>
        {e.label}
      </Link>
    ) : (
      <a key={e.href} href={e.href} onClick={alPulsar}>
        {e.label}
      </a>
    );

  return (
    <header className="nav">
      <div className="nav-inner">
        <Marca href="#top" />

        <nav className="links" aria-label="Principal">
          {ENLACES.map((e) => enlace(e))}
          <a href="#enviar-propuesta" className="nav-cta">
            Enviar propuesta
          </a>
        </nav>

        <div className="nav-acciones">
          <SelectorTema />
          <button
            className="burger"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="menu-movil" className={`mobile-menu ${open ? "is-open" : ""}`}>
        {ENLACES.map((e) => enlace(e, cerrar))}
        <a href="#enviar-propuesta" onClick={cerrar}>
          Enviar propuesta
        </a>
      </div>

      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress-bar" />
      </div>
    </header>
  );
}
