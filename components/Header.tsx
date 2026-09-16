"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "#propuestas", label: "Propuestas" },
  { href: "#nombre", label: "El nombre" },
  { href: "#objetivos", label: "Objetivos" },
  { href: "#foro", label: "Foro" },
];

// Van aparte de LINKS porque no son anclas de esta página, sino otras rutas:
// con <Link> Next las precarga y no recarga el sitio entero al entrar.
const RUTAS = [
  { href: "/calendario", label: "Calendario" },
  { href: "/foro", label: "RED ASTRA" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#top">
          <Image
            className="brand-logo"
            src="/LOGO2.svg"
            alt=""
            width={34}
            height={34}
          />
          <span>
            DI ASTREA
            <small>Consejo Estudiantil · Don Bosco 2027</small>
          </span>
        </a>

        <nav className="links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          {RUTAS.map((ruta) => (
            <Link key={ruta.href} href={ruta.href}>
              {ruta.label}
            </Link>
          ))}
          <a href="#buzon" className="nav-cta">
            Buzón de ideas
          </a>
        </nav>

        <button
          className="burger"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu ${open ? "is-open" : ""}`}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        {RUTAS.map((ruta) => (
          <Link
            key={ruta.href}
            href={ruta.href}
            onClick={() => setOpen(false)}
          >
            {ruta.label}
          </Link>
        ))}
        <a href="#buzon" onClick={() => setOpen(false)}>
          Buzón de ideas
        </a>
      </div>

      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress-bar" />
      </div>
    </header>
  );
}
