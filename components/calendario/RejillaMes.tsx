"use client";

import {
  CATEGORIAS,
  aClave,
  construirMes,
  type Evento,
} from "@/lib/eventos";

const DIAS = ["D", "L", "M", "M", "J", "V", "S"];

/**
 * Cuadrícula de un mes.
 *
 * La comparte la vista previa de la portada y la página completa; `compacta`
 * es lo único que cambia entre ambas. Los días sin eventos se renderizan como
 * `div` y no como `button` a propósito: si no hay nada que abrir, no debe
 * aparecer en el recorrido del tabulador.
 */
export function RejillaMes({
  anio,
  mes,
  porDia,
  onElegirDia,
  compacta = false,
}: {
  anio: number;
  mes: number;
  porDia: Map<string, Evento[]>;
  onElegirDia?: (eventos: Evento[]) => void;
  compacta?: boolean;
}) {
  const casillas = construirMes(anio, mes);
  const hoy = aClave(new Date());

  return (
    <div className={`cal-rejilla ${compacta ? "es-compacta" : ""}`}>
      <div className="cal-cabecera-dias" aria-hidden="true">
        {DIAS.map((dia, i) => (
          <span key={`${dia}-${i}`}>{dia}</span>
        ))}
      </div>

      <div className="cal-dias">
        {casillas.map((casilla) => {
          const delDia = porDia.get(casilla.clave) ?? [];
          const clases = [
            "cal-dia",
            casilla.delMes ? "" : "es-vecino",
            casilla.clave === hoy ? "es-hoy" : "",
            delDia.length > 0 ? "tiene-eventos" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const numero = casilla.fecha.getDate();

          if (delDia.length === 0) {
            return (
              <div key={casilla.clave} className={clases}>
                <span className="cal-numero">{numero}</span>
              </div>
            );
          }

          return (
            <button
              type="button"
              key={casilla.clave}
              className={clases}
              onClick={() => onElegirDia?.(delDia)}
              aria-label={`${numero}: ${delDia
                .map((e) => e.titulo)
                .join(", ")}`}
            >
              <span className="cal-numero">{numero}</span>

              {compacta ? (
                <span className="cal-puntos">
                  {delDia.slice(0, 3).map((evento) => (
                    <span
                      key={evento.id}
                      className="cal-punto"
                      style={
                        {
                          "--cat": CATEGORIAS[evento.categoria].color,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </span>
              ) : (
                <span className="cal-pildoras">
                  {delDia.slice(0, 2).map((evento) => (
                    <span
                      key={evento.id}
                      className="cal-pildora"
                      style={
                        {
                          "--cat": CATEGORIAS[evento.categoria].color,
                        } as React.CSSProperties
                      }
                    >
                      {evento.titulo}
                    </span>
                  ))}
                  {delDia.length > 2 ? (
                    <span className="cal-mas">+{delDia.length - 2}</span>
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
