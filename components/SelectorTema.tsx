"use client";

import { useEffect, useSyncExternalStore } from "react";

type Tema = "light" | "dark";

/** Clave de localStorage. La lee también el script de app/layout.tsx. */
const CLAVE = "tema";

function temaActual(): Tema {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Avisa cada vez que cambia data-theme en <html>, lo cambie quien lo cambie. */
function suscribir(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observador.disconnect();
}

function eligioAMano(): boolean {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado === "light" || guardado === "dark";
  } catch {
    return false;
  }
}

/**
 * Botón para alternar entre modo claro y oscuro.
 *
 * El tema vive en el atributo data-theme de <html>, no en estado de React: lo
 * fija el script de <head> antes del primer pintado, y este botón solo lo
 * cambia. Los iconos los decide el CSS a partir de ese atributo, de modo que
 * el botón sale correcto desde el primer pintado.
 *
 * Lo único que React necesita saber es el tema para la etiqueta accesible, y
 * eso no se puede conocer en el servidor. `useSyncExternalStore` lo resuelve
 * sin error de hidratación: durante la hidratación usa la instantánea del
 * servidor (null, etiqueta genérica) y en cuanto termina vuelve a pintar con
 * el tema real.
 */
export function SelectorTema() {
  const tema = useSyncExternalStore(suscribir, temaActual, () => null);

  // Mientras el visitante no haya elegido con el botón, el sitio sigue a su
  // sistema operativo, también si este cambia con la página abierta (p. ej.
  // el modo oscuro automático al anochecer). Una vez elegido, manda la elección.
  useEffect(() => {
    const consulta = matchMedia("(prefers-color-scheme: light)");
    const alCambiar = (e: MediaQueryListEvent) => {
      if (!eligioAMano()) {
        document.documentElement.dataset.theme = e.matches ? "light" : "dark";
      }
    };
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  }, []);

  function alternar() {
    const siguiente: Tema = temaActual() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = siguiente;
    try {
      localStorage.setItem(CLAVE, siguiente);
    } catch {
      // Sin almacenamiento el cambio dura lo que dure la página. Es aceptable.
    }
  }

  const etiqueta =
    tema === null
      ? "Cambiar entre modo claro y oscuro"
      : tema === "light"
        ? "Activar modo oscuro"
        : "Activar modo claro";

  return (
    <button
      type="button"
      className="tema-toggle"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
    >
      <svg
        className="icono-sol"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" />
      </svg>
      <svg
        className="icono-luna"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" />
      </svg>
    </button>
  );
}
