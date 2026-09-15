"use client";

import Link from "next/link";
import { useState } from "react";
import { haceCuanto } from "@/lib/fechas";
import {
  alternarGuardado,
  alternarReaccion,
  borrarPublicacion,
  ocultarPublicacion,
  type Categoria,
  type Publicacion,
} from "@/lib/foro";
import { DistintivoAutor, DistintivoOculto } from "@/components/foro/Distintivos";
import { useVerificado } from "@/hooks/useVerificado";

/**
 * Tarjeta de una publicación en la lista.
 *
 * Los contadores se actualizan en local al pulsar (sin volver a pedir la lista)
 * porque la alternativa es que el número tarde medio segundo en moverse y
 * parezca que el botón no hizo nada. Si la escritura falla, se deshace y se
 * enseña el error: el estado optimista nunca se queda mintiendo.
 */
export function TarjetaPublicacion({
  publicacion,
  categoria,
  reaccionada,
  guardada,
  esModerador,
  onCambio,
}: {
  publicacion: Publicacion;
  categoria?: Categoria;
  reaccionada: boolean;
  guardada: boolean;
  esModerador: boolean;
  /** Avisa a la lista de que hay que recargar (tras borrar u ocultar). */
  onCambio: () => void;
}) {
  const { verificado, usuarioId } = useVerificado();
  const [reacciones, setReacciones] = useState(publicacion.reacciones);
  const [reaccionadaLocal, setReaccionadaLocal] = useState(reaccionada);
  const [guardadaLocal, setGuardadaLocal] = useState(guardada);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `autor_id` llega nulo cuando la publicación es anónima y quien mira no es
  // su autor. Así que esta comparación ya da falso en ese caso, sin que haga
  // falta comprobar `anonimo` por separado.
  const esMia = Boolean(usuarioId && publicacion.autor_id === usuarioId);

  async function conError(accion: () => Promise<void>, deshacer: () => void) {
    setOcupado(true);
    setError(null);
    try {
      await accion();
    } catch (e) {
      deshacer();
      setError(e instanceof Error ? e.message : "No se pudo completar la acción.");
    } finally {
      setOcupado(false);
    }
  }

  async function pulsarReaccion() {
    if (!usuarioId) return;
    const antes = reaccionadaLocal;
    setReaccionadaLocal(!antes);
    setReacciones((n) => n + (antes ? -1 : 1));
    await conError(
      () => alternarReaccion(publicacion.id, usuarioId, antes),
      () => {
        setReaccionadaLocal(antes);
        setReacciones((n) => n + (antes ? 1 : -1));
      }
    );
  }

  async function pulsarGuardar() {
    if (!usuarioId) return;
    const antes = guardadaLocal;
    setGuardadaLocal(!antes);
    await conError(
      () => alternarGuardado(publicacion.id, usuarioId, antes),
      () => setGuardadaLocal(antes)
    );
  }

  return (
    <article className="pub">
      <div className="pub-meta">
        <span className="pub-autor">{publicacion.autor_nombre}</span>
        <DistintivoAutor
          rol={publicacion.autor_rol}
          anonimo={publicacion.anonimo}
          nombre={publicacion.autor_nombre}
        />
        {publicacion.estado === "oculto" && <DistintivoOculto />}
        <span aria-hidden="true">·</span>
        <time dateTime={publicacion.creado_en}>{haceCuanto(publicacion.creado_en)}</time>
        {categoria && <span className="pub-cat">{categoria.nombre}</span>}
      </div>

      <h2>
        <Link href={`/foro/${publicacion.id}`}>{publicacion.titulo}</Link>
      </h2>
      <p className="pub-extracto">{publicacion.cuerpo}</p>

      {error && (
        <p className="aviso-error" style={{ marginTop: 12 }} role="alert">
          {error}
        </p>
      )}

      <div className="pub-pie">
        <button
          type="button"
          className={`pub-accion ${reaccionadaLocal ? "is-on" : ""}`}
          onClick={pulsarReaccion}
          disabled={!verificado || ocupado}
          aria-pressed={reaccionadaLocal}
          title={verificado ? "Me gusta" : "Confirma tu correo para reaccionar"}
        >
          <IconoEstrella llena={reaccionadaLocal} />
          {reacciones}
        </button>

        <Link href={`/foro/${publicacion.id}`} className="pub-accion">
          <IconoComentario />
          {publicacion.comentarios}
        </Link>

        <button
          type="button"
          className={`pub-accion ${guardadaLocal ? "is-on" : ""}`}
          onClick={pulsarGuardar}
          disabled={!verificado || ocupado}
          aria-pressed={guardadaLocal}
          title={verificado ? "Guardar" : "Confirma tu correo para guardar"}
        >
          <IconoMarcador llena={guardadaLocal} />
          {guardadaLocal ? "Guardada" : "Guardar"}
        </button>

        {esMia && (
          <button
            type="button"
            className="pub-accion"
            disabled={ocupado}
            onClick={async () => {
              if (!confirm("¿Borrar esta publicación? No se puede deshacer.")) return;
              await conError(async () => {
                await borrarPublicacion(publicacion.id);
                onCambio();
              }, () => {});
            }}
          >
            Borrar
          </button>
        )}

        {esModerador && (
          <button
            type="button"
            className="pub-accion"
            disabled={ocupado}
            onClick={async () => {
              const ocultar = publicacion.estado === "publicado";
              await conError(async () => {
                await ocultarPublicacion(publicacion.id, ocultar);
                onCambio();
              }, () => {});
            }}
          >
            {publicacion.estado === "publicado" ? "Ocultar" : "Devolver al foro"}
          </button>
        )}
      </div>
    </article>
  );
}

/* Iconos en línea: el sitio no carga ninguna librería de iconos y no merece la
   pena añadir una por tres formas. */

function IconoEstrella({ llena }: { llena: boolean }) {
  return (
    <svg className="icono" viewBox="0 0 24 24" fill={llena ? "currentColor" : "none"}
         stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9L12 3z" />
    </svg>
  );
}

function IconoComentario() {
  return (
    <svg className="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
    </svg>
  );
}

function IconoMarcador({ llena }: { llena: boolean }) {
  return (
    <svg className="icono" viewBox="0 0 24 24" fill={llena ? "currentColor" : "none"}
         stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12v18l-6-4.5L6 21V3z" />
    </svg>
  );
}
