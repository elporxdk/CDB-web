import Link from "next/link";
import { nombreMes, type Evento } from "@/lib/eventos";
import { RejillaMes } from "@/components/calendario/RejillaMes";

/** Índice vacío: la rejilla se pinta sin un solo evento. */
const SIN_EVENTOS = new Map<string, Evento[]>();

/**
 * Calendario mientras la agenda aún no está publicada.
 *
 * Detrás del aviso se deja la cuadrícula del mes en curso, atenuada y sin
 * fechas: enseña la forma de lo que viene sin prometer nada concreto. La
 * rejilla va marcada como decorativa porque no hay nada que pulsar.
 */
export function AgendaBloqueada({
  compacta = false,
}: {
  compacta?: boolean;
}) {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();

  return (
    <div className={`cal-bloqueo ${compacta ? "es-compacta" : ""}`}>
      <div className="cal-bloqueo-fondo" aria-hidden="true">
        {!compacta ? (
          <p className="cal-mes-titulo">{nombreMes(anio, mes)}</p>
        ) : null}
        <RejillaMes
          anio={anio}
          mes={mes}
          porDia={SIN_EVENTOS}
          compacta={compacta}
        />
      </div>

      <div className="cal-bloqueo-aviso">
        <span className="cal-icono-agenda" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4" />
            <path d="M12 12.6v2.6l1.8 1.1" />
          </svg>
        </span>

        <p className="cal-bloqueo-badge">En preparación</p>

        <h3>La agenda oficial se publica muy pronto.</h3>

        <p className="cal-bloqueo-texto">
          El Consejo está cerrando la fecha, la hora y el lugar de cada
          actividad del plan de trabajo: los torneos, los informes
          trimestrales, el festival y la feria técnica.
        </p>

        <p className="cal-bloqueo-texto">
          En cuanto estén confirmadas aparecerán aquí, y este calendario será
          la agenda pública con la que podrás <strong>pedirnos cuentas día
          por día</strong>.
        </p>

        <div className="cal-bloqueo-acciones">
          <Link href="/#enviar-propuesta" className="btn-primary">
            Enviar una propuesta
          </Link>
          <Link href="/#propuestas" className="btn-ghost">
            Ver los proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
