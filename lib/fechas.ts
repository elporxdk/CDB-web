/**
 * Fechas en castellano.
 *
 * Se usa `es-SV` y no `es`: cambia el orden y las preposiciones respecto al
 * castellano de España, y el colegio es salvadoreño.
 */

/** Fecha relativa corta: «hace 3 horas», «hace 5 días». */
export function haceCuanto(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const escalas: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
  ];
  const fmt = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  let anterior = 1;
  for (const [limite, unidad] of escalas) {
    if (segundos < limite) return fmt.format(-Math.floor(segundos / anterior), unidad);
    anterior = limite;
  }
  return fmt.format(-Math.floor(segundos / 31557600), "year");
}

/** Fecha completa para el detalle de una publicación. */
export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
