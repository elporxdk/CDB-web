"use client";

import { useState, type FormEvent } from "react";
import { haceCuanto } from "@/lib/fechas";
import {
  borrarComentario,
  crearComentario,
  LIMITES,
  type Comentario,
} from "@/lib/foro";
import { DistintivoAutor } from "@/components/foro/Distintivos";
import { SoloVerificados } from "@/components/foro/SoloVerificados";
import { useVerificado } from "@/hooks/useVerificado";

/**
 * Hilo de comentarios de una publicación.
 *
 * Solo se anida un nivel. Anidar sin límite acaba en hilos que en un móvil se
 * leen en una columna de cuatro palabras, así que una respuesta a una respuesta
 * se cuelga del mismo comentario raíz.
 */
export function HiloComentarios({
  publicacionId,
  comentarios,
  esModerador,
  onCambio,
}: {
  publicacionId: string;
  comentarios: Comentario[];
  esModerador: boolean;
  onCambio: () => void;
}) {
  const { usuarioId } = useVerificado();
  const [respondiendoA, setRespondiendoA] = useState<string | null>(null);

  const raiz = comentarios.filter((c) => !c.padre_id);
  const respuestasDe = (id: string) => comentarios.filter((c) => c.padre_id === id);

  return (
    <section className="hilo">
      <h2>
        {comentarios.length === 0
          ? "Sin respuestas todavía"
          : `${comentarios.length} respuesta${comentarios.length === 1 ? "" : "s"}`}
      </h2>

      <SoloVerificados accion="responder">
        {usuarioId && (
          <CajaRespuesta
            publicacionId={publicacionId}
            autorId={usuarioId}
            onEnviado={onCambio}
          />
        )}
      </SoloVerificados>

      <div style={{ marginTop: 22 }}>
        {raiz.map((c) => (
          <div key={c.id}>
            <Comentario
              comentario={c}
              usuarioId={usuarioId}
              esModerador={esModerador}
              onResponder={() => setRespondiendoA(respondiendoA === c.id ? null : c.id)}
              onCambio={onCambio}
            />

            {respondiendoA === c.id && usuarioId && (
              <div style={{ marginLeft: 22, marginBottom: 16 }}>
                <CajaRespuesta
                  publicacionId={publicacionId}
                  autorId={usuarioId}
                  padreId={c.id}
                  compacta
                  onEnviado={() => {
                    setRespondiendoA(null);
                    onCambio();
                  }}
                />
              </div>
            )}

            {respuestasDe(c.id).map((r) => (
              <Comentario
                key={r.id}
                comentario={r}
                usuarioId={usuarioId}
                esModerador={esModerador}
                esRespuesta
                onCambio={onCambio}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Comentario({
  comentario,
  usuarioId,
  esModerador,
  esRespuesta = false,
  onResponder,
  onCambio,
}: {
  comentario: Comentario;
  usuarioId: string | null;
  esModerador: boolean;
  esRespuesta?: boolean;
  onResponder?: () => void;
  onCambio: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  // `autor_id` ya viene nulo si el comentario es anónimo y no es nuestro.
  const esMio = Boolean(usuarioId && comentario.autor_id === usuarioId);

  return (
    <article className={`comentario ${esRespuesta ? "es-respuesta" : ""}`}>
      <div className="pub-meta" style={{ marginBottom: 6 }}>
        <span className="pub-autor">{comentario.autor_nombre}</span>
        <DistintivoAutor
          rol={comentario.autor_rol}
          anonimo={comentario.anonimo}
          nombre={comentario.autor_nombre}
        />
        <span aria-hidden="true">·</span>
        <time dateTime={comentario.creado_en}>{haceCuanto(comentario.creado_en)}</time>
      </div>

      <p className="comentario-cuerpo">{comentario.cuerpo}</p>

      {error && (
        <p className="aviso-error" style={{ marginTop: 8 }} role="alert">
          {error}
        </p>
      )}

      <div className="comentario-acciones">
        {onResponder && usuarioId && (
          <button type="button" className="pub-accion" onClick={onResponder}>
            Responder
          </button>
        )}
        {(esMio || esModerador) && (
          <button
            type="button"
            className="pub-accion"
            disabled={ocupado}
            onClick={async () => {
              if (!confirm("¿Borrar esta respuesta?")) return;
              setOcupado(true);
              setError(null);
              try {
                await borrarComentario(comentario.id);
                onCambio();
              } catch (e) {
                setError(e instanceof Error ? e.message : "No se pudo borrar.");
              } finally {
                setOcupado(false);
              }
            }}
          >
            Borrar
          </button>
        )}
      </div>
    </article>
  );
}

function CajaRespuesta({
  publicacionId,
  autorId,
  padreId,
  compacta = false,
  onEnviado,
}: {
  publicacionId: string;
  autorId: string;
  padreId?: string;
  compacta?: boolean;
  onEnviado: () => void;
}) {
  const [cuerpo, setCuerpo] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listo = cuerpo.trim().length >= LIMITES.comentarioMin && !enviando;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!listo) return;

    setEnviando(true);
    setError(null);
    try {
      await crearComentario({ publicacionId, autorId, cuerpo, padreId, anonimo });
      setCuerpo("");
      setAnonimo(false);
      onEnviado();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo responder.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      <textarea
        className="area"
        style={compacta ? { minHeight: 80 } : undefined}
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        maxLength={LIMITES.comentarioMax}
        rows={compacta ? 2 : 3}
        placeholder={padreId ? "Responde a este comentario…" : "Escribe una respuesta…"}
        aria-label="Respuesta"
      />

      {error && (
        <p className="aviso-error" style={{ marginTop: 8 }} role="alert">
          {error}
        </p>
      )}

      <div className="compositor-pie">
        <label className="casilla">
          <input
            type="checkbox"
            checked={anonimo}
            onChange={(e) => setAnonimo(e.target.checked)}
          />
          Responder sin firmar
        </label>
        <button type="submit" className="btn btn-oro" disabled={!listo}>
          {enviando ? "Enviando…" : "Responder"}
        </button>
      </div>
    </form>
  );
}
