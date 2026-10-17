import Image from "next/image";
import Link from "next/link";

/**
 * Logotipo y nombre del sitio, para todas las cabeceras.
 *
 * Va en un componente propio porque la portada y el calendario tienen cada uno
 * su cabecera, y el nombre oficial no debe poder quedar distinto en una de las
 * dos, que es justo lo que pasaba con el texto de campaña.
 */
export default function Marca({ href, detalle }: { href: string; detalle?: string }) {
  const contenido = (
    <>
      <Image className="brand-logo" src="/LOGO2.svg" alt="" width={34} height={34} />
      <span>
        DI ASTREA
        <small>Sitio oficial · Consejo Estudiantil{detalle ? ` · ${detalle}` : ""}</small>
      </span>
    </>
  );

  // En la portada el enlace es un ancla a #top: un <Link> a "/" recargaría la
  // misma página en vez de subir.
  return href.startsWith("#") ? (
    <a className="brand" href={href}>
      {contenido}
    </a>
  ) : (
    <Link className="brand" href={href}>
      {contenido}
    </Link>
  );
}
