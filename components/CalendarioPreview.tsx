import Link from "next/link";
import {
  AGENDA_BLOQUEADA,
  CATEGORIAS,
  aFechaLocal,
  eventos,
  indexarPorDia,
  mesInicial,
  nombreMes,
  proximosEventos,
  rangoEvento,
} from "@/lib/eventos";
import { RejillaMes } from "@/components/calendario/RejillaMes";
import { AgendaBloqueada } from "@/components/calendario/AgendaBloqueada";

/**
 * Adelanto del calendario en la portada.
 *
 * Es un componente de servidor y la rejilla no recibe `onElegirDia`: aquí el
 * mes se muestra solo como referencia visual y quien quiera el detalle pasa a
 * /calendario. Así la portada no arrastra estado ni diálogos.
 */
export default function CalendarioPreview() {
  const { anio, mes } = mesInicial();
  const porDia = indexarPorDia(eventos);
  const proximos = proximosEventos(4);

  return (
    <section className="cal-preview" id="calendario">
      <div className="wrap">
        <div className="sec-head">
          <p className="tag">
            <span className="dot" />
            Agenda
          </p>
          {AGENDA_BLOQUEADA ? (
            <>
              <h2>La agenda del Consejo, en camino.</h2>
              <p>
                Aquí va a quedar cada actividad con su fecha. Todavía no está
                abierta, y depende de algo muy concreto.
              </p>
            </>
          ) : (
            <>
              <h2>Lo que viene, con fecha y hora.</h2>
              <p>
                Cada actividad del plan de trabajo queda agendada aquí. Nada de
                «pronto»: si tiene fecha, se puede exigir.
              </p>
            </>
          )}
        </div>

        {AGENDA_BLOQUEADA ? (
          <AgendaBloqueada compacta />
        ) : (
          <div className="cal-preview-grid">
            <div className="cal-preview-mes">
              <p className="cal-mes-titulo">{nombreMes(anio, mes)}</p>
              <RejillaMes anio={anio} mes={mes} porDia={porDia} compacta />
            </div>

            <div className="cal-preview-lista">
              <h3>Próximas fechas</h3>
              <ul>
                {proximos.map((evento) => {
                  const fecha = aFechaLocal(evento.inicio);
                  const categoria = CATEGORIAS[evento.categoria];
                  return (
                    <li key={evento.id}>
                      <span className="cal-fecha-caja" aria-hidden="true">
                        <b>{fecha.getDate()}</b>
                        <small>
                          {nombreMes(fecha.getFullYear(), fecha.getMonth())
                            .slice(0, 3)
                            .toUpperCase()}
                        </small>
                      </span>
                      <span className="cal-item-cuerpo">
                        <span
                          className="cal-etiqueta"
                          style={
                            { "--cat": categoria.color } as React.CSSProperties
                          }
                        >
                          <span className="cal-punto" />
                          {categoria.etiqueta}
                        </span>
                        <strong>{evento.titulo}</strong>
                        <small>{rangoEvento(evento)}</small>
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link href="/calendario" className="btn-primary">
                Ver el calendario completo
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
