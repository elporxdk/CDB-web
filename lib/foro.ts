import { obtenerSupabase } from "@/lib/supabase";

/**
 * Capa de acceso a los datos de RED ASTRA.
 *
 * Todo el hablar con Supabase del foro pasa por aquí. Las páginas y los
 * componentes no construyen consultas: si mañana cambia el orden por
 * popularidad o hay que añadir un índice, se toca un solo fichero.
 *
 * NO ES UNA CAPA DE SEGURIDAD. Estas funciones son las que el navegador puede
 * llamar, y el navegador está en manos del visitante: la `anon key` viaja en el
 * bundle, así que cualquiera puede saltarse este fichero y llamar a la API de
 * Supabase directamente. Quien decide lo que se puede hacer son las políticas
 * RLS de `supabase/migraciones/0001_red_astra.sql`. Lo de aquí es comodidad y
 * mensajes de error legibles.
 */

export type Rol = "miembro" | "moderador";

export type Perfil = {
  id: string;
  nombre: string;
  avatar_url: string | null;
  biografia: string | null;
  rol: Rol;
  creado_en: string;
};

export type Categoria = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
};

export type Publicacion = {
  id: string;
  /**
   * Nulo cuando la publicación es anónima y quien mira no es su autor ni la
   * moderación. No es que la interfaz lo oculte: la vista de Postgres no lo
   * manda. Sirve además para saber si algo es propio y se puede editar.
   */
  autor_id: string | null;
  categoria_id: string;
  titulo: string;
  cuerpo: string;
  anonimo: boolean;
  estado: "publicado" | "oculto";
  creado_en: string;
  editado_en: string | null;
  autor_nombre: string;
  autor_avatar: string | null;
  autor_rol: Rol;
  reacciones: number;
  comentarios: number;
  interacciones: number;
};

export type Comentario = {
  id: string;
  publicacion_id: string;
  autor_id: string | null;
  padre_id: string | null;
  cuerpo: string;
  anonimo: boolean;
  estado: "publicado" | "oculto";
  creado_en: string;
  editado_en: string | null;
  autor_nombre: string;
  autor_avatar: string | null;
  autor_rol: Rol;
};

export type Notificacion = {
  id: string;
  texto: string;
  leida: boolean;
  creado_en: string;
  publicacion_id: string | null;
};

export type Orden = "recientes" | "populares" | "interaccion";

/** Cuántas publicaciones trae cada página. */
export const POR_PAGINA = 10;

/**
 * Límites de longitud. Son los MISMOS que los `check` de la migración, y esa
 * coincidencia importa: si aquí se admitiera más, el usuario escribiría un
 * texto que Postgres rechaza después, con un error que no entiende.
 */
export const LIMITES = {
  tituloMin: 5,
  tituloMax: 160,
  cuerpoMin: 10,
  cuerpoMax: 20000,
  comentarioMin: 2,
  comentarioMax: 5000,
} as const;

/**
 * Traduce los errores de Postgres a algo que se pueda enseñar.
 *
 * El caso importante es `42501`, que es lo que devuelve RLS cuando rechaza una
 * escritura. Sin traducir, el usuario lee «new row violates row-level security
 * policy for table publicaciones», que no le dice nada. Con traducir, entiende
 * que le falta confirmar el correo.
 */
function traducir(codigo: string | undefined, mensaje: string): string {
  if (codigo === "42501") {
    return "No tienes permiso para esto. Confirma tu correo para poder participar.";
  }
  if (codigo === "23505") {
    return "Eso ya estaba hecho.";
  }
  if (codigo === "23514") {
    return "El contenido no cumple el formato mínimo. Revisa la longitud del texto.";
  }
  // 23503 es una violación de clave ajena, y puede venir de tres sitios: la
  // categoría, la publicación o el PERFIL del autor. El del perfil es el único
  // que el usuario no puede provocar por su cuenta, y suele ser el de las
  // cuentas creadas antes de aplicar la migración. El mensaje nombra los tres
  // para no mandar a nadie a mirar donde no es.
  if (codigo === "23503") {
    return "Falta un dato al que esto hace referencia: la categoría, la publicación o tu perfil. Vuelve a entrar; si sigue, hay que ejecutar la migración del foro.";
  }
  // La tabla base no es legible a propósito (es lo que sostiene el anonimato).
  // Si sale esto, alguien está consultando `publicaciones` en vez de la vista.
  if (codigo === "42P01" || mensaje.includes("permission denied")) {
    return "Esa consulta no está permitida. El foro solo lee a través de las vistas.";
  }
  return mensaje;
}

export class ErrorForo extends Error {
  constructor(codigo: string | undefined, mensaje: string) {
    super(traducir(codigo, mensaje));
    this.name = "ErrorForo";
  }
}

// ---------------------------------------------------------------------------
//  Lectura
// ---------------------------------------------------------------------------

export async function obtenerCategorias(): Promise<Categoria[]> {
  const { data, error } = await obtenerSupabase()
    .from("categorias")
    .select("id, slug, nombre, descripcion, orden")
    .order("orden");

  if (error) throw new ErrorForo(error.code, error.message);
  return data ?? [];
}

/**
 * Lista de publicaciones, con filtro, búsqueda, orden y paginación.
 *
 * Se consulta la vista `publicaciones_con_metricas`, que ya trae el autor (o su
 * máscara, si es anónima) y los contadores agregados: pedir las publicaciones y
 * luego un recuento por cada una serían N+1 peticiones.
 */
export async function obtenerPublicaciones(opciones: {
  categoriaId?: string;
  busqueda?: string;
  orden?: Orden;
  pagina?: number;
  /** Solo estas publicaciones. Lo usa la pestaña de guardadas. */
  ids?: string[];
  /** Solo de este autor. Lo usa «mis publicaciones». */
  autorId?: string;
}): Promise<{ publicaciones: Publicacion[]; total: number }> {
  const { categoriaId, busqueda, orden = "recientes", pagina = 0, ids, autorId } = opciones;

  // Un filtro por lista vacía significa «no hay nada que enseñar», no «enseña
  // todo». Sin este atajo, `in.()` sin elementos devolvería la tabla entera y
  // la pestaña de guardadas mostraría el foro completo a quien no ha guardado
  // nada.
  if (ids && ids.length === 0) return { publicaciones: [], total: 0 };

  let consulta = obtenerSupabase()
    .from("publicaciones_con_metricas")
    .select("*", { count: "exact" })
    .eq("estado", "publicado");

  if (categoriaId) consulta = consulta.eq("categoria_id", categoriaId);
  if (ids) consulta = consulta.in("id", ids);
  if (autorId) consulta = consulta.eq("autor_id", autorId);

  // `textSearch` va contra el índice GIN en español de la migración, así que la
  // búsqueda no recorre la tabla y «tutorías» encuentra «tutoría».
  if (busqueda?.trim()) {
    consulta = consulta.textSearch("titulo", busqueda.trim(), {
      type: "websearch",
      config: "spanish",
    });
  }

  const columnaOrden =
    orden === "populares" ? "reacciones" : orden === "interaccion" ? "interacciones" : "creado_en";

  consulta = consulta
    .order(columnaOrden, { ascending: false })
    // Segundo criterio para que el orden sea estable: sin él, dos publicaciones
    // con las mismas reacciones podrían intercambiarse entre páginas y aparecer
    // repetidas o desaparecer.
    .order("creado_en", { ascending: false })
    .range(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA - 1);

  const { data, error, count } = await consulta;
  if (error) throw new ErrorForo(error.code, error.message);
  return { publicaciones: (data as Publicacion[]) ?? [], total: count ?? 0 };
}

export async function obtenerPublicacion(id: string): Promise<Publicacion | null> {
  const { data, error } = await obtenerSupabase()
    .from("publicaciones_con_metricas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ErrorForo(error.code, error.message);
  return (data as Publicacion) ?? null;
}

export async function obtenerComentarios(publicacionId: string): Promise<Comentario[]> {
  // De la vista, no de la tabla: es la que enmascara a quien comentó en anónimo.
  const { data, error } = await obtenerSupabase()
    .from("comentarios_con_autor")
    .select("*")
    .eq("publicacion_id", publicacionId)
    .eq("estado", "publicado")
    .order("creado_en", { ascending: true });

  if (error) throw new ErrorForo(error.code, error.message);
  return (data as Comentario[]) ?? [];
}

// ---------------------------------------------------------------------------
//  Escritura. Todas pueden ser rechazadas por RLS, y eso es lo correcto.
// ---------------------------------------------------------------------------

export async function crearPublicacion(datos: {
  autorId: string;
  categoriaId: string;
  titulo: string;
  cuerpo: string;
  anonimo: boolean;
}): Promise<string> {
  const { data, error } = await obtenerSupabase()
    .from("publicaciones")
    .insert({
      autor_id: datos.autorId,
      categoria_id: datos.categoriaId,
      titulo: datos.titulo.trim(),
      cuerpo: datos.cuerpo.trim(),
      anonimo: datos.anonimo,
    })
    .select("id")
    .single();

  if (error) throw new ErrorForo(error.code, error.message);
  return data.id as string;
}

export async function editarPublicacion(
  id: string,
  cambios: { titulo?: string; cuerpo?: string }
): Promise<void> {
  const { error } = await obtenerSupabase()
    .from("publicaciones")
    .update({ ...cambios, editado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new ErrorForo(error.code, error.message);
}

export async function borrarPublicacion(id: string): Promise<void> {
  const { error } = await obtenerSupabase().from("publicaciones").delete().eq("id", id);
  if (error) throw new ErrorForo(error.code, error.message);
}

/**
 * Moderación: oculta en vez de borrar, para no perder el hilo.
 *
 * Solo funciona con una cuenta moderadora. El trigger `congelar_pub` rechaza el
 * cambio de estado a cualquier otra, incluido el propio autor: si no, a quien
 * le ocultaran una publicación le bastaría con volver a publicarla.
 */
export async function ocultarPublicacion(id: string, oculta: boolean): Promise<void> {
  const { error } = await obtenerSupabase()
    .from("publicaciones")
    .update({ estado: oculta ? "oculto" : "publicado" })
    .eq("id", id);

  if (error) throw new ErrorForo(error.code, error.message);
}

export async function crearComentario(datos: {
  publicacionId: string;
  autorId: string;
  cuerpo: string;
  padreId?: string | null;
  anonimo: boolean;
}): Promise<void> {
  const { error } = await obtenerSupabase().from("comentarios").insert({
    publicacion_id: datos.publicacionId,
    autor_id: datos.autorId,
    cuerpo: datos.cuerpo.trim(),
    padre_id: datos.padreId ?? null,
    anonimo: datos.anonimo,
  });

  if (error) throw new ErrorForo(error.code, error.message);
}

export async function borrarComentario(id: string): Promise<void> {
  const { error } = await obtenerSupabase().from("comentarios").delete().eq("id", id);
  if (error) throw new ErrorForo(error.code, error.message);
}

/**
 * Alterna la reacción. La clave primaria compuesta de la tabla garantiza que no
 * haya duplicados aunque se llame dos veces seguidas.
 */
export async function alternarReaccion(
  publicacionId: string,
  usuarioId: string,
  yaReacciono: boolean
): Promise<void> {
  const sb = obtenerSupabase();
  const { error } = yaReacciono
    ? await sb
        .from("reacciones")
        .delete()
        .eq("publicacion_id", publicacionId)
        .eq("usuario_id", usuarioId)
    : await sb.from("reacciones").insert({ publicacion_id: publicacionId, usuario_id: usuarioId });

  if (error) throw new ErrorForo(error.code, error.message);
}

/**
 * Las publicaciones a las que ya reaccionó quien mira.
 *
 * La política de lectura de `reacciones` solo deja ver las propias, así que
 * esto devuelve únicamente las de quien llama por mucho que no se filtre por
 * usuario. Es deliberado: si la tabla fuera legible entera, se podría saber
 * quién reaccionó a cada hilo, y en un foro con publicaciones anónimas eso es
 * justo lo que no puede pasar.
 */
export async function obtenerMisReacciones(publicacionIds: string[]): Promise<Set<string>> {
  if (publicacionIds.length === 0) return new Set();

  const { data, error } = await obtenerSupabase()
    .from("reacciones")
    .select("publicacion_id")
    .in("publicacion_id", publicacionIds);

  if (error) throw new ErrorForo(error.code, error.message);
  return new Set((data ?? []).map((r) => r.publicacion_id as string));
}

export async function alternarGuardado(
  publicacionId: string,
  usuarioId: string,
  yaGuardado: boolean
): Promise<void> {
  const sb = obtenerSupabase();
  const { error } = yaGuardado
    ? await sb
        .from("guardados")
        .delete()
        .eq("publicacion_id", publicacionId)
        .eq("usuario_id", usuarioId)
    : await sb.from("guardados").insert({ publicacion_id: publicacionId, usuario_id: usuarioId });

  if (error) throw new ErrorForo(error.code, error.message);
}

export async function obtenerMisGuardados(): Promise<Set<string>> {
  const { data, error } = await obtenerSupabase().from("guardados").select("publicacion_id");
  if (error) throw new ErrorForo(error.code, error.message);
  return new Set((data ?? []).map((g) => g.publicacion_id as string));
}

export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  const { data, error } = await obtenerSupabase()
    .from("notificaciones")
    .select("id, texto, leida, creado_en, publicacion_id")
    .order("creado_en", { ascending: false })
    .limit(20);

  if (error) throw new ErrorForo(error.code, error.message);
  return data ?? [];
}

export async function marcarNotificacionLeida(id: string): Promise<void> {
  const { error } = await obtenerSupabase()
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", id);

  if (error) throw new ErrorForo(error.code, error.message);
}

export async function obtenerPerfil(id: string): Promise<Perfil | null> {
  const { data, error } = await obtenerSupabase()
    .from("perfiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ErrorForo(error.code, error.message);
  return (data as Perfil) ?? null;
}
