import type { Rol } from "@/lib/foro";

/**
 * Distintivo del autor.
 *
 * Se pinta a partir de lo que devuelve la base de datos, no de nada que decida
 * el cliente. Y para una publicación anónima la vista manda siempre `miembro`,
 * así que ni por descuido se puede filtrar por aquí que quien escribió en
 * anónimo era de moderación.
 */
export function DistintivoAutor({
  rol,
  anonimo,
  nombre,
}: {
  rol: Rol;
  anonimo: boolean;
  nombre: string;
}) {
  if (anonimo) {
    // Si la vista ya enmascaró el nombre, este es literalmente «Anónimo» y
    // repetirlo en una pastilla al lado no añade nada.
    //
    // Pero cuando SÍ llega un nombre real en algo anónimo, quien mira es su
    // autor o alguien de moderación, y ahí el distintivo es lo único que avisa
    // de que el resto del foro no está viendo esa firma.
    if (nombre === "Anónimo") return null;
    return (
      <span className="distintivo distintivo-anon" title="El resto del foro no ve esta firma">
        Sin firma
      </span>
    );
  }
  if (rol === "moderador") {
    return <span className="distintivo distintivo-mod">Moderación</span>;
  }
  return null;
}

/** Marca de que la moderación retiró algo del foro. */
export function DistintivoOculto() {
  return (
    <span className="distintivo distintivo-oculto" title="Retirada por moderación">
      Oculta
    </span>
  );
}
