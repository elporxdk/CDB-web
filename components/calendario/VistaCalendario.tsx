"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CATEGORIAS,
  aFechaLocal,
  eventos,
  indexarPorDia,
  mesInicial,
  nombreMes,
  rangoEvento,
  type CategoriaEvento,
  type Evento,
} from "@/lib/eventos";
import { RejillaMes } from "@/components/calendario/RejillaMes";
import { ModalEvento } from "@/components/calendario/ModalEvento";

type Filtro = CategoriaEvento | "todas";

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: "todas", etiqueta: "Todas" },
  ...(Object.entries(CATEGORIAS) as [CategoriaEvento, { etiqueta: string }][]
  ).map(([id, { etiqueta }]) => ({ id: id as Filtro, etiqueta })),
];

/**
 * Límites del año escolar cargado, para no navegar a meses vacíos sin fin.
 *
 * Con la agenda sin eventos se cae al mes en curso: se calcula al importar el
 * módulo, así que no puede dar por hecho que la lista traiga algo.
 */
const LIMITES = (() => {
  if (eventos.length === 0) {
    const hoy = new Date();
    const actual = hoy.getFullYear() * 12 + hoy.getMonth();
    return { min: actual, max: actual };
  }
  const ordenados = [...eventos].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const primero = aFechaLocal(ordenados[0].inicio);
  const ultimo = aFechaLocal(ordenados[ordenados.length - 1].inicio);
  return {
    min: primero.getFullYear() * 12 + primero.getMonth(),
    max: ultimo.getFullYear() * 12 + ultimo.getMonth(),
  };
})();

export function VistaCalendario() {
  // Enlace profundo: /calendario?evento=id abre la ficha y arranca en su mes.
  // Es lo que permite compartir un evento concreto por chat. Se lee con
  // useSearchParams y no en un efecto para no provocar un segundo render.
  const parametros = useSearchParams();
  const eventoEnlazado = useMemo(() => {
    const id = parametros.get("evento");
    return id ? eventos.find((evento) => evento.id === id) ?? null : null;
  }, [parametros]);

  // El mes se guarda como un solo entero (año*12+mes) para que avanzar y
  // retroceder no tenga que arrastrar el desborde de diciembre a enero.
  const [indiceMes, setIndiceMes] = useState(() => {
    const referencia = eventoEnlazado
      ? aFechaLocal(eventoEnlazado.inicio)
      : null;
    if (referencia) {
      return referencia.getFullYear() * 12 + referencia.getMonth();
    }
    const inicial = mesInicial();
    return inicial.anio * 12 + inicial.mes;
  });
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abierto, setAbierto] = useState<Evento | null>(eventoEnlazado);

  const anio = Math.floor(indiceMes / 12);
  const mes = indiceMes % 12;

  const visibles = useMemo(
    () =>
      filtro === "todas"
        ? eventos
        : eventos.filter((evento) => evento.categoria === filtro),
    [filtro]
  );

  const porDia = useMemo(() => indexarPorDia(visibles), [visibles]);

  /** Eventos del mes en pantalla, para la agenda lateral. */
  const delMes = useMemo(() => {
    const prefijo = `${anio}-${String(mes + 1).padStart(2, "0")}`;
    return visibles
      .filter((evento) => evento.inicio.startsWith(prefijo))
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }, [visibles, anio, mes]);

  const irAHoy = () => {
    const hoy = new Date();
    setIndiceMes(hoy.getFullYear() * 12 + hoy.getMonth());
  };

  const elegirDia = (delDia: Evento[]) => {
    // Con un solo evento se abre directo; con varios gana el primero, que ya
    // viene ordenado por hora desde el índice.
    setAbierto(delDia[0]);
  };

  return (
    <section className="cal-pagina">
      <div className="wrap">
        <div className="cal-pagina-head">
          <p className="tag">
            <span className="dot" />
            Agenda del Consejo
          </p>
          <h1>Calendario Di Astrea</h1>
          <p className="cal-lede">
            Todas las actividades del plan de trabajo, con su fecha, su lugar y
            el proyecto del que salen. Pulsa un día marcado para ver el
            detalle.
          </p>
        </div>

        <div className="cal-barra">
          <div className="cal-nav">
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => setIndiceMes((v) => v - 1)}
              disabled={indiceMes <= LIMITES.min}
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <strong className="cal-mes-actual">{nombreMes(anio, mes)}</strong>
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => setIndiceMes((v) => v + 1)}
              disabled={indiceMes >= LIMITES.max}
              aria-label="Mes siguiente"
            >
              ›
            </button>
            <button type="button" className="chip" onClick={irAHoy}>
              Hoy
            </button>
          </div>

          <div className="cal-filtros" role="group" aria-label="Filtrar por tipo">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${filtro === f.id ? "is-active" : ""}`}
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
              >
                {f.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="cal-cuerpo">
          <RejillaMes
            anio={anio}
            mes={mes}
            porDia={porDia}
            onElegirDia={elegirDia}
          />

          <aside className="cal-agenda">
            <h2>
              {delMes.length > 0
                ? `${delMes.length} ${
                    delMes.length === 1 ? "actividad" : "actividades"
                  } este mes`
                : "Sin actividades este mes"}
            </h2>

            {delMes.length > 0 ? (
              <ul>
                {delMes.map((evento) => {
                  const categoria = CATEGORIAS[evento.categoria];
                  return (
                    <li key={evento.id}>
                      <button
                        type="button"
                        className="cal-agenda-item"
                        onClick={() => setAbierto(evento)}
                        style={
                          { "--cat": categoria.color } as React.CSSProperties
                        }
                      >
                        <span className="cal-agenda-dia">
                          {aFechaLocal(evento.inicio).getDate()}
                        </span>
                        <span>
                          <strong>{evento.titulo}</strong>
                          <small>{rangoEvento(evento)}</small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="cal-vacio">
                Cambia de mes o quita el filtro para ver más actividades.
              </p>
            )}

            <div className="cal-leyenda">
              <h3>Tipos</h3>
              {(
                Object.entries(CATEGORIAS) as [
                  CategoriaEvento,
                  { etiqueta: string; color: string },
                ][]
              ).map(([id, categoria]) => (
                <span
                  key={id}
                  className="cal-etiqueta"
                  style={{ "--cat": categoria.color } as React.CSSProperties}
                >
                  <span className="cal-punto" />
                  {categoria.etiqueta}
                </span>
              ))}
            </div>

            <p className="cal-nota">
              ¿Falta algo que deberíamos agendar?{" "}
              <Link href="/#buzon">Dilo en el buzón</Link>.
            </p>
          </aside>
        </div>
      </div>

      {abierto ? (
        <ModalEvento evento={abierto} onCerrar={() => setAbierto(null)} />
      ) : null}
    </section>
  );
}
