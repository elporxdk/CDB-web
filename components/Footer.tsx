import Link from "next/link";

/**
 * Pie común a la portada y a las páginas internas.
 *
 * Las anclas van como "/#seccion" y no "#seccion": este pie también se
 * renderiza en /calendario, donde un ancla suelta no llevaría a ninguna parte.
 */
export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="mark" />
              <span>DI ASTREA</span>
            </div>
            <p className="footer-lema">
              Sitio oficial del Consejo Estudiantil, Colegio Don Bosco.
              Justicia, rectitud y trabajo por quien viene después.
            </p>
          </div>

          <div className="footer-col">
            <h5>El Consejo</h5>
            <Link href="/#propuestas">Propuestas</Link>
            <Link href="/#objetivos">Objetivos</Link>
            <Link href="/#nombre">El nombre</Link>
            <Link href="/#consejo">Transparencia</Link>
          </div>

          <div className="footer-col">
            <h5>Participa</h5>
            <Link href="/#enviar-propuesta">Enviar una propuesta</Link>
            <Link href="/calendario">Calendario</Link>
            <Link href="/#foro">Foro (próximamente)</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Sitio oficial del Consejo Estudiantil Di Astrea · Colegio Don Bosco · 2027</p>
          <p>Formación salesiana: buenos cristianos y honrados ciudadanos.</p>
        </div>
      </div>
    </footer>
  );
}
