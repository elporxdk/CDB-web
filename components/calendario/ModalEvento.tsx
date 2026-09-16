"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  CATEGORIAS,
  enlaceGoogleCalendar,
  rangoEvento,
  type Evento,
} from "@/lib/eventos";

/**
 * Ventana emergente con el detalle de un evento.
 *
 * No usa `<dialog>` nativo: en Safari el `::backdrop` con blur y el bloqueo de
 * scroll del body siguen dando problemas, y aquí hace falta que el fondo del
 * sitio se vea difuminado. Se implementa a mano con las mismas garantías:
 * Escape cierra, el foco entra al abrir y vuelve al disparador al cerrar, y el
 * tabulador no se escapa del diálogo.
 */
export function ModalEvento({
  evento,
  onCerrar,
}: {
  evento: Evento;
  onCerrar: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const disparador = useRef<Element | null>(null);

  useEffect(() => {
    disparador.current = document.activeElement;
    panel.current?.focus();

    // El scroll del fondo se congela para que la rueda no mueva la página
    // detrás del diálogo.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCerrar();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;

      const focuseables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focuseables.length === 0) return;

      const primero = focuseables[0];
      const ultimo = focuseables[focuseables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
      (disparador.current as HTMLElement | null)?.focus?.();
    };
  }, [onCerrar]);

  const categoria = CATEGORIAS[evento.categoria];

  return (
    <div
      className="cal-modal-fondo"
      // Solo cierra si el clic empieza y termina en el fondo, no cuando se
      // arrastra el texto del diálogo y se suelta fuera.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="cal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-modal-titulo"
        tabIndex={-1}
        ref={panel}
      >
        <div className="cal-modal-top">
          <span
            className="cal-etiqueta"
            style={{ "--cat": categoria.color } as React.CSSProperties}
          >
            <span className="cal-punto" />
            {categoria.etiqueta}
          </span>
          <button
            type="button"
            className="cal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <h3 id="cal-modal-titulo">{evento.titulo}</h3>

        <dl className="cal-datos">
          <div>
            <dt>Cuándo</dt>
            <dd>{rangoEvento(evento)}</dd>
          </div>
          {evento.lugar ? (
            <div>
              <dt>Dónde</dt>
              <dd>{evento.lugar}</dd>
            </div>
          ) : null}
          {evento.proyecto ? (
            <div>
              <dt>Proyecto</dt>
              <dd>{evento.proyecto}</dd>
            </div>
          ) : null}
        </dl>

        <p className="cal-modal-desc">{evento.descripcion}</p>

        <div className="cal-modal-acciones">
          <a
            className="btn-primary"
            href={enlaceGoogleCalendar(evento)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Añadir a mi calendario
          </a>
          {evento.proyecto ? (
            <Link className="btn-ghost" href="/#propuestas">
              Ver la propuesta
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
