/**
 * Agenda del Consejo Estudiantil.
 *
 * Las fechas se guardan como "YYYY-MM-DD" y NO como ISO con zona. Un
 * `new Date("2026-09-20")` se interpreta como medianoche UTC, que en El
 * Salvador (UTC-6) cae el día 19 — el calendario pintaría todo corrido un día.
 * Por eso se parsean a mano con `aFechaLocal`.
 */

export type CategoriaEvento =
  | "academico"
  | "cultural"
  | "deportivo"
  | "pastoral"
  | "consejo";

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  /** "YYYY-MM-DD" */
  inicio: string;
  /** "YYYY-MM-DD" inclusive. Solo para eventos de varios días. */
  fin?: string;
  /** "HH:MM" en 24h. Si falta, es de día completo. */
  horaInicio?: string;
  horaFin?: string;
  lugar?: string;
  categoria: CategoriaEvento;
  /** Proyecto del que sale el evento, para enlazarlo con las propuestas. */
  proyecto?: string;
}

export const CATEGORIAS: Record<
  CategoriaEvento,
  { etiqueta: string; color: string }
> = {
  academico: { etiqueta: "Académico", color: "#6FA8DC" },
  cultural: { etiqueta: "Cultural", color: "#C58AF9" },
  deportivo: { etiqueta: "Deportivo", color: "#5FCF8D" },
  pastoral: { etiqueta: "Pastoral", color: "#F2D479" },
  consejo: { etiqueta: "Consejo", color: "#E7823F" },
};

/**
 * Interruptor de la agenda.
 *
 * Mientras esté en `true` el calendario se muestra bloqueado: la cuadrícula
 * sale de fondo pero sin fechas, con el aviso de que se activa con el voto.
 * Para publicar la agenda basta con llenar `eventos` y pasarlo a `false`; toda
 * la maquinaria de rejilla, filtros y fichas sigue intacta debajo.
 */
export const AGENDA_BLOQUEADA: boolean = true;

export const eventos: Evento[] = [];

/* ---------- utilidades de fecha ---------- */

/** Convierte "YYYY-MM-DD" en una fecha local, sin corrimiento de zona. */
export function aFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Pasa una fecha a "YYYY-MM-DD" usando sus componentes locales. */
export function aClave(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "septiembre de 2027" */
export function nombreMes(anio: number, mes: number): string {
  return `${MESES[mes]} de ${anio}`;
}

/** "3 de septiembre de 2027" */
export function fechaLarga(fecha: string): string {
  const d = aFechaLocal(fecha);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** Rango legible de un evento, con horas si las tiene. */
export function rangoEvento(evento: Evento): string {
  const inicio = fechaLarga(evento.inicio);
  if (evento.fin && evento.fin !== evento.inicio) {
    return `Del ${inicio} al ${fechaLarga(evento.fin)}`;
  }
  if (evento.horaInicio) {
    const hasta = evento.horaFin ? ` a ${evento.horaFin}` : "";
    return `${inicio} · ${evento.horaInicio}${hasta}`;
  }
  return `${inicio} · todo el día`;
}

/** Días que ocupa un evento, para pintarlo en todas sus casillas. */
function clavesDeEvento(evento: Evento): string[] {
  if (!evento.fin || evento.fin === evento.inicio) return [evento.inicio];
  const claves: string[] = [];
  const cursor = aFechaLocal(evento.inicio);
  const fin = aFechaLocal(evento.fin);
  while (cursor <= fin) {
    claves.push(aClave(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return claves;
}

/** Índice día -> eventos. Se calcula una vez y se reutiliza. */
export function indexarPorDia(lista: Evento[]): Map<string, Evento[]> {
  const mapa = new Map<string, Evento[]>();
  for (const evento of lista) {
    for (const clave of clavesDeEvento(evento)) {
      const previos = mapa.get(clave);
      if (previos) previos.push(evento);
      else mapa.set(clave, [evento]);
    }
  }
  return mapa;
}

export interface Casilla {
  fecha: Date;
  clave: string;
  /** false para los días de relleno del mes anterior o siguiente. */
  delMes: boolean;
}

/**
 * Rejilla del mes, siempre en semanas completas de domingo a sábado.
 *
 * Se rellena con días vecinos en vez de huecos vacíos para que la cuadrícula
 * no se deforme y el usuario vea la continuidad entre meses.
 */
export function construirMes(anio: number, mes: number): Casilla[] {
  const primero = new Date(anio, mes, 1);
  const cursor = new Date(primero);
  cursor.setDate(1 - primero.getDay());

  const casillas: Casilla[] = [];
  // 6 semanas cubren cualquier mes sin importar en qué día empiece.
  for (let i = 0; i < 42; i++) {
    casillas.push({
      fecha: new Date(cursor),
      clave: aClave(cursor),
      delMes: cursor.getMonth() === mes,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return casillas;
}

/** Eventos que aún no han pasado, ordenados por fecha. */
export function proximosEventos(cantidad: number, desde = new Date()): Evento[] {
  const hoy = aClave(desde);
  return eventos
    .filter((evento) => (evento.fin ?? evento.inicio) >= hoy)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .slice(0, cantidad);
}

/** Mes que conviene abrir primero: el del próximo evento, o el actual. */
export function mesInicial(desde = new Date()): { anio: number; mes: number } {
  const siguiente = proximosEventos(1, desde)[0];
  const referencia = siguiente ? aFechaLocal(siguiente.inicio) : desde;
  return { anio: referencia.getFullYear(), mes: referencia.getMonth() };
}

/**
 * Enlace para añadir el evento a Google Calendar.
 *
 * En eventos de día completo el rango es medio abierto: el `fin` que espera
 * Google es el día siguiente al último, o el evento se vería un día más corto.
 */
export function enlaceGoogleCalendar(evento: Evento): string {
  const compacta = (fecha: string) => fecha.replace(/-/g, "");
  let fechas: string;

  if (evento.horaInicio) {
    const hora = (h: string) => `${h.replace(":", "")}00`;
    const fin = evento.horaFin ?? evento.horaInicio;
    fechas = `${compacta(evento.inicio)}T${hora(evento.horaInicio)}/${compacta(
      evento.fin ?? evento.inicio
    )}T${hora(fin)}`;
  } else {
    const ultimo = aFechaLocal(evento.fin ?? evento.inicio);
    ultimo.setDate(ultimo.getDate() + 1);
    fechas = `${compacta(evento.inicio)}/${compacta(aClave(ultimo))}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    details: evento.descripcion,
    dates: fechas,
  });
  if (evento.lugar) params.set("location", evento.lugar);

  return `https://calendar.google.com/calendar/render?${params}`;
}
