import { validarPropuesta, type Propuesta } from "@/lib/propuestas";

/**
 * Recibe una propuesta del formulario y la reenvía por correo al Consejo.
 *
 * Corre en el Worker de Cloudflare, no en el navegador: aquí, y solo aquí, se
 * usa la clave de Resend. Configuración (para desarrollo local, ver
 * .dev.vars.example):
 *
 *   RESEND_API_KEY     clave de la API de Resend («re_…»). Secreto.
 *   CORREO_CONSEJO     buzón que recibe las propuestas. Secreto, para que la
 *                      dirección no quede publicada en el repositorio.
 *   CORREO_REMITENTE   opcional. Mientras no haya un dominio verificado en
 *                      Resend, se usa su remitente de pruebas, que SOLO puede
 *                      enviar a la dirección dueña de la cuenta de Resend: por
 *                      eso CORREO_CONSEJO tiene que ser ese mismo correo.
 *
 * Son variables de EJECUCIÓN del Worker, no de compilación, y no llevan el
 * prefijo NEXT_PUBLIC_: con él, Next incrustaría la clave en el JavaScript que
 * descarga cualquier visitante. OpenNext las copia a process.env en la primera
 * petición, por eso se leen dentro del manejador y no al cargar el módulo.
 */

const API_RESEND = "https://api.resend.com/emails";
const REMITENTE_PRUEBAS = "Propuestas Di Astrea <onboarding@resend.dev>";

// Se evalúa en cada petición con el entorno real del Worker. Sobre todo por el
// GET de diagnóstico: si Next lo prerenderizara al compilar, reflejaría el
// entorno del build —donde los secretos no existen— y diría siempre «falta».
export const dynamic = "force-dynamic";

/**
 * Las dos variables, sin espacios sobrantes (un espacio pegado por error al
 * final de la clave haría que Resend la rechazara).
 */
function leerConfiguracion() {
  const clave = process.env.RESEND_API_KEY?.trim() || undefined;
  const destino = process.env.CORREO_CONSEJO?.trim() || undefined;
  return { clave, destino };
}

/**
 * Diagnóstico para quien administra el sitio: abrir /api/propuestas en el
 * navegador dice si el Worker tiene las dos variables y si tienen la forma
 * esperada. NUNCA devuelve los valores, solo su estado.
 */
export function GET() {
  const { clave, destino } = leerConfiguracion();
  return Response.json(
    {
      buzon: clave && destino ? "activo" : "inactivo",
      RESEND_API_KEY: revisar(process.env.RESEND_API_KEY, (v) => v.startsWith("re_"), "no parece una clave de Resend: debería empezar por re_"),
      CORREO_CONSEJO: revisar(process.env.CORREO_CONSEJO, (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "no parece una dirección de correo"),
      ayuda:
        "Si alguna dice «falta», añádela en Cloudflare → Workers & Pages → cdb-web → Settings → Variables and Secrets (no en Build), tipo Secret.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

function revisar(valor: string | undefined, formaCorrecta: (v: string) => boolean, pista: string): string {
  if (valor === undefined) return "falta";
  const limpio = valor.trim();
  if (limpio === "") return "existe pero está vacía";
  if (/^["'].*["']$/.test(limpio)) return "tiene comillas alrededor: vuelve a pegarla sin ellas";
  return formaCorrecta(limpio) ? "configurada" : `configurada, pero ${pista}`;
}

export async function POST(request: Request) {
  const { clave, destino } = leerConfiguracion();

  // Sin configurar, se dice claramente. Lo peor que podría pasar aquí es lo que
  // hacía la versión anterior: decirle al estudiante que se envió.
  if (!clave || !destino) {
    const faltan = [!clave && "RESEND_API_KEY", !destino && "CORREO_CONSEJO"].filter(Boolean).join(" y ");
    console.error(`Propuestas: el Worker no tiene ${faltan} en sus variables de ejecución.`);
    return Response.json(
      { error: "El buzón de propuestas todavía no está activo. Inténtalo más tarde." },
      { status: 503 }
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ error: "Petición no válida." }, { status: 400 });
  }
  if (!cuerpo || typeof cuerpo !== "object") {
    return Response.json({ error: "Petición no válida." }, { status: 400 });
  }

  const { nombre, grado, propuesta, sitio_web } = cuerpo as Record<string, unknown>;

  // Campo trampa: invisible para personas, lo rellenan los bots. Se responde
  // como si hubiera ido bien; avisar al bot de que se le detectó solo le enseña
  // a esquivar la trampa.
  if (typeof sitio_web === "string" && sitio_web.trim() !== "") {
    return Response.json({ ok: true });
  }

  if (typeof nombre !== "string" || typeof grado !== "string" || typeof propuesta !== "string") {
    return Response.json({ error: "Petición no válida." }, { status: 400 });
  }

  const datos: Propuesta = {
    nombre: nombre.trim(),
    grado: grado.trim(),
    propuesta: propuesta.trim(),
  };

  // Las mismas reglas que el formulario, longitudes máximas incluidas: el
  // maxLength del navegador se salta llamando a esta ruta directamente.
  const errores = validarPropuesta(datos);
  if (Object.keys(errores).length > 0) {
    return Response.json({ error: "Revisa los campos marcados.", errores }, { status: 422 });
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(API_RESEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
        // Obligatoria: la API de Resend está detrás de Cloudflare, que responde
        // 403 (código 1010) a las peticiones sin User-Agent. curl y los SDK la
        // ponen solos; el fetch de un Worker, no.
        "User-Agent": "di-astrea-propuestas/1.0",
      },
      body: JSON.stringify({
        from: process.env.CORREO_REMITENTE || REMITENTE_PRUEBAS,
        // El destinatario sale SIEMPRE de la configuración y nunca de la
        // petición: si no, cualquiera podría usar el sitio para enviar correos
        // a quien quisiera en nombre del Consejo.
        to: [destino],
        subject: asunto(datos),
        text: comoTexto(datos),
        html: comoHtml(datos),
      }),
    });
  } catch (error) {
    console.error("Propuestas: no se pudo contactar con Resend.", error);
    return Response.json(
      { error: "No se pudo entregar la propuesta. Inténtalo de nuevo en unos minutos." },
      { status: 502 }
    );
  }

  if (!respuesta.ok) {
    // El detalle va al registro del Worker, no al estudiante: puede incluir
    // datos de la cuenta de Resend.
    console.error("Propuestas: Resend rechazó el envío.", respuesta.status, await respuesta.text());
    return Response.json(
      { error: "No se pudo entregar la propuesta. Inténtalo de nuevo en unos minutos." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}

/* ---------- contenido del correo ---------- */

/** Fecha en hora de El Salvador: el Worker corre en UTC. */
function fechaRecepcion(): string {
  return new Intl.DateTimeFormat("es-SV", {
    timeZone: "America/El_Salvador",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

/** Una sola línea: un salto de línea en el asunto podría colar cabeceras. */
function enUnaLinea(texto: string): string {
  return texto.replace(/[\r\n]+/g, " ").trim();
}

function asunto({ nombre, grado }: Propuesta): string {
  return enUnaLinea(`Nueva propuesta de ${nombre} (${grado})`).slice(0, 180);
}

function comoTexto({ nombre, grado, propuesta }: Propuesta): string {
  return [
    "Nueva propuesta recibida desde el sitio oficial del Consejo.",
    "",
    `Nombre: ${nombre}`,
    `Grado o especialidad: ${grado}`,
    `Recibida: ${fechaRecepcion()} (hora de El Salvador)`,
    "",
    "Propuesta:",
    propuesta,
  ].join("\n");
}

/**
 * Todo lo que escribe el estudiante se escapa. Sin esto, una propuesta con
 * etiquetas HTML se pintaría como tal en el correo del Consejo: enlaces falsos,
 * imágenes de rastreo o texto disfrazado de mensaje oficial.
 */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function comoHtml({ nombre, grado, propuesta }: Propuesta): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1f2544;max-width:600px">
  <p style="margin:0 0 16px;font-size:13px;color:#5c6381">Nueva propuesta recibida desde el sitio oficial del Consejo.</p>
  <table style="border-collapse:collapse;margin:0 0 18px">
    <tr><td style="padding:3px 14px 3px 0;color:#5c6381">Nombre</td><td style="padding:3px 0"><strong>${escapar(nombre)}</strong></td></tr>
    <tr><td style="padding:3px 14px 3px 0;color:#5c6381">Grado o especialidad</td><td style="padding:3px 0">${escapar(grado)}</td></tr>
    <tr><td style="padding:3px 14px 3px 0;color:#5c6381">Recibida</td><td style="padding:3px 0">${escapar(fechaRecepcion())} (hora de El Salvador)</td></tr>
  </table>
  <div style="border-left:3px solid #d4a72c;padding:4px 0 4px 14px;white-space:pre-wrap">${escapar(propuesta)}</div>
</div>`;
}
