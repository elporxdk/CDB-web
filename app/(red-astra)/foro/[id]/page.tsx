"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { HiloComentarios } from "@/components/foro/HiloComentarios";
import { DistintivoAutor, DistintivoOculto } from "@/components/foro/Distintivos";
import { useVerificado } from "@/hooks/useVerificado";
import { formatearFecha } from "@/lib/fechas";
import {
  obtenerComentarios,
  obtenerPerfil,
  obtenerPublicacion,
  type Comentario,
  type Publicacion,
} from "@/lib/foro";
import { foroConfigurado } from "@/lib/supabase";

/**
 * Detalle de una publicación.
 *
 * En Next 16 `params` llega como promesa, también en los componentes de
 * cliente; se desenvuelve con `use()`.
 */
export default function PaginaPublicacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { usuarioId, cargando: cargandoSesion } = useVerificado();

  /**
   * Publicación, comentarios, carga y error en un solo estado.
   *
   * Agrupados para que `cargar` pueda escribirlos de una vez al terminar la
   * petición, y así no tocar el estado antes de su primer `await`: hacerlo
   * convertiría la llamada desde el efecto en un setState síncrono, que encadena
   * un render de más.
   */
  const [datos, setDatos] = useState<{
    publicacion: Publicacion | null;
    comentarios: Comentario[];
    cargando: boolean;
    error: string | null;
  }>({ publicacion: null, comentarios: [], cargando: foroConfigurado, error: null });

  const { publicacion, comentarios, cargando, error } = datos;

  // Igual que en la lista: se guarda de quién sabemos que es moderador y el
  // booleano se deriva, para no tener que ponerlo a false desde un efecto.
  const [idModerador, setIdModerador] = useState<string | null>(null);
  const esModerador = Boolean(usuarioId && idModerador === usuarioId);

  const cargar = useCallback(async () => {
    if (!foroConfigurado) return;
    try {
      const [pub, coms] = await Promise.all([obtenerPublicacion(id), obtenerComentarios(id)]);
      setDatos({ publicacion: pub, comentarios: coms, cargando: false, error: null });
    } catch (e) {
      setDatos((d) => ({
        ...d,
        cargando: false,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }, [id]);

  useEffect(() => {
    if (cargandoSesion) return;
    cargar();
  }, [cargar, cargandoSesion]);

  useEffect(() => {
    if (!usuarioId) return;
    let vivo = true;
    obtenerPerfil(usuarioId)
      .then((p) => {
        if (vivo && p?.rol === "moderador") setIdModerador(usuarioId);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [usuarioId]);

  if (!foroConfigurado) {
    return (
      <section className="foro">
        <div className="wrap">
          <div className="aviso aviso-oro">
            <h3>El foro todavía no está conectado</h3>
            <p>
              Faltan las variables de Supabase. Los pasos están en{" "}
              <code>supabase/README.md</code>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="foro">
      <div className="wrap">
        <p style={{ marginBottom: 18 }}>
          <Link href="/foro" className="pub-accion">
            ← Volver al foro
          </Link>
        </p>

        {error && (
          <p className="aviso-error" role="alert">
            {error}
          </p>
        )}

        {cargando ? (
          <div className="esqueleto" style={{ height: 220 }} aria-busy="true" />
        ) : !publicacion ? (
          <div className="vacio">
            <strong>Esta publicación ya no está</strong>
            Puede que la borrara su autor o que la moderación la retirara del foro.
          </div>
        ) : (
          <>
            <article className="pub-detalle">
              <div className="pub-meta">
                <span className="pub-autor">{publicacion.autor_nombre}</span>
                <DistintivoAutor
                  rol={publicacion.autor_rol}
                  anonimo={publicacion.anonimo}
                  nombre={publicacion.autor_nombre}
                />
                {publicacion.estado === "oculto" && <DistintivoOculto />}
                <span aria-hidden="true">·</span>
                <time dateTime={publicacion.creado_en}>
                  {formatearFecha(publicacion.creado_en)}
                </time>
                {publicacion.editado_en && <span>· editada</span>}
              </div>

              <h1>{publicacion.titulo}</h1>
              <p className="pub-cuerpo">{publicacion.cuerpo}</p>

              <div className="pub-pie">
                <span className="pub-accion" aria-label="Estrellas">
                  ★ {publicacion.reacciones}
                </span>
                <span className="pub-accion" aria-label="Respuestas">
                  {publicacion.comentarios} respuesta
                  {publicacion.comentarios === 1 ? "" : "s"}
                </span>
              </div>
            </article>

            <HiloComentarios
              publicacionId={publicacion.id}
              comentarios={comentarios}
              esModerador={esModerador}
              onCambio={cargar}
            />
          </>
        )}
      </div>
    </section>
  );
}
