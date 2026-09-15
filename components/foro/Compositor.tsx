"use client";

import { useState, type FormEvent } from "react";
import { crearPublicacion, LIMITES, type Categoria } from "@/lib/foro";

/**
 * Formulario de nueva publicación.
 *
 * Los límites de longitud salen de `LIMITES`, que son los MISMOS que los
 * `check` de la migración. Se comprueban aquí para avisar antes de enviar, no
 * para sustituir a la base de datos: si alguien salta esta validación, el
 * `check` de Postgres rechaza la fila igualmente.
 */
export function Compositor({
  categorias,
  autorId,
  categoriaPreseleccionada,
  onPublicado,
}: {
  categorias: Categoria[];
  autorId: string;
  categoriaPreseleccionada?: string;
  onPublicado: (id: string) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [categoriaId, setCategoriaId] = useState(
    categoriaPreseleccionada ?? categorias[0]?.id ?? ""
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tituloValido = titulo.trim().length >= LIMITES.tituloMin;
  const cuerpoValido = cuerpo.trim().length >= LIMITES.cuerpoMin;
  const listo = tituloValido && cuerpoValido && Boolean(categoriaId) && !enviando;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!listo) return;

    setEnviando(true);
    setError(null);
    try {
      const id = await crearPublicacion({ autorId, categoriaId, titulo, cuerpo, anonimo });
      setTitulo("");
      setCuerpo("");
      setAnonimo(false);
      onPublicado(id);
    } catch (e) {
      // El mensaje ya viene traducido de la capa de datos: si RLS rechazó la
      // escritura, aquí llega «Confirma tu correo para poder participar».
      setError(e instanceof Error ? e.message : "No se pudo publicar.");
    } finally {
      setEnviando(false);
    }
  }

  const pista = !tituloValido && titulo.length > 0
    ? `Al título le faltan ${LIMITES.tituloMin - titulo.trim().length} carácter(es).`
    : !cuerpoValido && cuerpo.length > 0
      ? `Al contenido le faltan ${LIMITES.cuerpoMin - cuerpo.trim().length} carácter(es).`
      : cuerpo.length > LIMITES.cuerpoMax - 500
        ? `Quedan ${LIMITES.cuerpoMax - cuerpo.length} caracteres.`
        : "";

  return (
    <form onSubmit={enviar} className="compositor">
      <h3>Nueva publicación</h3>

      <div className="campo-fila">
        <input
          className="campo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={LIMITES.tituloMax}
          placeholder="Título de la publicación"
          aria-label="Título"
        />
        <select
          className="campo"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          aria-label="Categoría"
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="area"
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        maxLength={LIMITES.cuerpoMax}
        rows={5}
        placeholder="Cuenta la idea, la duda o lo que pasó…"
        aria-label="Contenido"
      />

      <label className="casilla" style={{ marginTop: 12 }}>
        <input
          type="checkbox"
          checked={anonimo}
          onChange={(e) => setAnonimo(e.target.checked)}
        />
        Publicar sin firmar
      </label>
      {anonimo && (
        <p className="pista" style={{ marginTop: 6 }}>
          Nadie verá tu nombre, tampoco en la base de datos. La moderación sí
          puede verlo: es lo que permite responder de lo que se publica.
        </p>
      )}

      {error && (
        <p className="aviso-error" style={{ marginTop: 12 }} role="alert">
          {error}
        </p>
      )}

      <div className="compositor-pie">
        <p className="pista">{pista}</p>
        <button type="submit" className="btn btn-oro" disabled={!listo}>
          {enviando ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
