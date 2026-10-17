/**
 * Propuestas del estudiantado: validación y envío.
 *
 * Las reglas de validación viven aquí y las usan los DOS lados: el formulario,
 * para avisar antes de enviar, y la ruta app/api/propuestas, que es la que de
 * verdad decide. Así no pueden discrepar.
 */

export interface Propuesta {
  nombre: string;
  grado: string;
  propuesta: string;
}

export type CampoPropuesta = keyof Propuesta;
export type ErroresPropuesta = Partial<Record<CampoPropuesta, string>>;

export const LIMITES = {
  nombre: { min: 3, max: 80 },
  grado: { min: 2, max: 60 },
  propuesta: { min: 20, max: 2000 },
} as const;

/**
 * Comprueba una propuesta y devuelve un mensaje por cada campo que falle.
 *
 * Los mensajes van en español y los escribe esta función, en lugar de dejar
 * los globos de validación del navegador: esos salen en el idioma del
 * navegador y con un estilo que no se puede adaptar al tema.
 */
export function validarPropuesta(datos: Propuesta): ErroresPropuesta {
  const errores: ErroresPropuesta = {};
  const nombre = datos.nombre.trim();
  const grado = datos.grado.trim();
  const propuesta = datos.propuesta.trim();

  if (!nombre) {
    errores.nombre = "Escribe tu nombre completo.";
  } else if (nombre.length > LIMITES.nombre.max) {
    errores.nombre = `El nombre no puede pasar de ${LIMITES.nombre.max} caracteres.`;
  } else if (nombre.split(/\s+/).length < 2) {
    // El campo pide el nombre completo: sin apellido el Consejo no puede saber
    // de quién es la propuesta si hay dos estudiantes con el mismo nombre.
    errores.nombre = "Escribe tu nombre y al menos un apellido.";
  } else if (nombre.length < LIMITES.nombre.min) {
    errores.nombre = `El nombre necesita al menos ${LIMITES.nombre.min} caracteres.`;
  }

  if (grado.length < LIMITES.grado.min) {
    errores.grado = "Indica tu grado o especialidad.";
  } else if (grado.length > LIMITES.grado.max) {
    errores.grado = `No puede pasar de ${LIMITES.grado.max} caracteres.`;
  }

  if (!propuesta) {
    errores.propuesta = "Escribe tu propuesta.";
  } else if (propuesta.length > LIMITES.propuesta.max) {
    errores.propuesta = `La propuesta no puede pasar de ${LIMITES.propuesta.max} caracteres.`;
  } else if (propuesta.length < LIMITES.propuesta.min) {
    const faltan = LIMITES.propuesta.min - propuesta.length;
    errores.propuesta = `Cuéntanos un poco más: faltan ${faltan} caracter${faltan === 1 ? "" : "es"}.`;
  }

  return errores;
}

/**
 * Envía una propuesta al Consejo.
 *
 * La manda a la ruta /api/propuestas, que corre en el Worker de Cloudflare y la
 * reenvía por correo al buzón del Consejo con Resend. La clave de Resend vive
 * solo en el servidor; desde aquí no se ve.
 *
 * `trampa` es el valor del campo oculto del formulario. Una persona nunca lo
 * rellena porque no lo ve; los bots que llenan todo lo que encuentran, sí. El
 * servidor descarta en silencio lo que llegue con ese campo escrito.
 *
 * Si algo falla, lanza un Error con un mensaje que se puede enseñar tal cual:
 * el formulario lo muestra y conserva lo escrito.
 */
export async function enviarPropuesta(datos: Propuesta, trampa = ""): Promise<void> {
  // Se valida aquí también para no gastar una petición en algo que el servidor
  // va a rechazar. Pero quien decide es el servidor, no esto.
  if (Object.keys(validarPropuesta(datos)).length > 0) {
    throw new Error("Revisa los campos marcados antes de enviar.");
  }

  let respuesta: Response;
  try {
    respuesta = await fetch("/api/propuestas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, sitio_web: trampa }),
    });
  } catch {
    throw new Error("No hay conexión. Revisa tu internet e inténtalo de nuevo.");
  }

  if (!respuesta.ok) {
    let mensaje = "No se pudo enviar la propuesta. Inténtalo de nuevo en unos minutos.";
    try {
      const cuerpo: unknown = await respuesta.json();
      if (cuerpo && typeof cuerpo === "object" && "error" in cuerpo && typeof cuerpo.error === "string") {
        mensaje = cuerpo.error;
      }
    } catch {
      // Respuesta sin JSON (p. ej. una página de error de Cloudflare): mensaje genérico.
    }
    throw new Error(mensaje);
  }
}
