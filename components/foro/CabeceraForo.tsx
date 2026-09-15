"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/foro/AuthProvider";
import { useVerificado } from "@/hooks/useVerificado";

/** Cabecera de RED ASTRA: misma barra que el resto del sitio, con la sesión. */
export function CabeceraForo() {
  const { salir } = useAuth();
  const { autenticado, cargando, correo } = useVerificado();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/LOGO2.svg" alt="" width={34} height={34} />
          <span>
            RED ASTRA
            <small>Foro estudiantil · Di Astrea</small>
          </span>
        </Link>

        <nav className="links">
          <Link href="/">Inicio</Link>
          <Link href="/foro">Foro</Link>
          {cargando ? null : autenticado ? (
            <span className="foro-sesion">
              <span title={correo ?? undefined}>{correo}</span>
              <button type="button" className="chip" onClick={() => salir()}>
                Salir
              </button>
            </span>
          ) : (
            <Link href="/auth" className="nav-cta">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
