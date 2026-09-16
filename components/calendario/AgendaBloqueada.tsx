import Link from "next/link";
import { nombreMes, type Evento } from "@/lib/eventos";
import { RejillaMes } from "@/components/calendario/RejillaMes";

/** Índice vacío: la rejilla se pinta sin un solo evento. */
const SIN_EVENTOS = new Map<string, Evento[]>();

/**
 * Estado bloqueado del calendario.
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
        <span className="cal-candado" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
          </svg>
        </span>

        <p className="cal-bloqueo-badge">En construcción</p>

        <h3>Este calendario se llena con tu voto.</h3>

        <p className="cal-bloqueo-texto">
          Cada actividad del plan de trabajo ya está pensada: los torneos, los
          informes trimestrales, el festival, la feria técnica. Lo único que
          falta para ponerles fecha, hora y lugar es que el proyecto siga en
          pie.
        </p>

        <p className="cal-bloqueo-texto">
          <strong>Vota por el Amarillo</strong> y este espacio deja de estar
          vacío: se convierte en la agenda pública que podrás exigirnos día por
          día.
        </p>

        <div className="cal-bloqueo-acciones">
          <Link href="/#buzon" className="btn-primary">
            Quiero apoyar el proyecto
          </Link>
          <Link href="/#propuestas" className="btn-ghost">
            Ver las propuestas
          </Link>
        </div>
      </div>
    </div>
  );
}
