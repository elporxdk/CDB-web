/**
 * Propuestas del estudiantado: validación y envío.
 *
 * Separado del formulario para que las reglas vivan en un solo sitio. Cuando
 * exista un backend, este fichero es lo único que hay que tocar: el formulario
 * no sabe ni le importa adónde va la propuesta.
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
  } else if (nombre.split(/\s+/).length < 2) {
    // El campo pide el nombre completo: sin apellido el Consejo no puede saber
    // de quién es la propuesta si hay dos estudiantes con el mismo nombre.
    errores.nombre = "Escribe tu nombre y al menos un apellido.";
  } else if (nombre.length < LIMITES.nombre.min) {
    errores.nombre = `El nombre necesita al menos ${LIMITES.nombre.min} caracteres.`;
  }

  if (grado.length < LIMITES.grado.min) {
    errores.grado = "Indica tu grado o especialidad.";
  }

  if (!propuesta) {
    errores.propuesta = "Escribe tu propuesta.";
  } else if (propuesta.length < LIMITES.propuesta.min) {
    const faltan = LIMITES.propuesta.min - propuesta.length;
    errores.propuesta = `Cuéntanos un poco más: faltan ${faltan} caracter${faltan === 1 ? "" : "es"}.`;
  }

  return errores;
}

/**
 * Envía una propuesta.
 *
 * ⚠️  HOY NO ENVÍA A NINGÚN SITIO.
 *
 * Esta fase se pidió solo con lógica de interfaz: el formulario valida, muestra
 * «Propuesta enviada con éxito» y se limpia. Pero no existe todavía dónde
 * guardar las propuestas, así que lo que escribe el estudiante NO le llega al
 * Consejo: se descarta al limpiar el formulario.
 *
 * No publiques este formulario ante el estudiantado hasta conectar esta
 * función. Quien envíe una propuesta verá que «se envió con éxito» y dará por
 * hecho que el Consejo la recibió.
 *
 * Para conectarla basta con sustituir el cuerpo por la llamada real (por
 * ejemplo, un `fetch` a una ruta /api/propuestas que la guarde en Cloudflare
 * D1) y lanzar un Error si falla: el formulario ya muestra el error y conserva
 * lo escrito para que no se pierda.
 */
export async function enviarPropuesta(datos: Propuesta): Promise<void> {
  // La validación se repite aquí aunque el formulario ya la haya hecho: esta
  // función será la puerta de entrada al backend y no debe fiarse de quien la
  // llama.
  if (Object.keys(validarPropuesta(datos)).length > 0) {
    throw new Error("Revisa los campos marcados antes de enviar.");
  }
}
