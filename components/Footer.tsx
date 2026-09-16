import Link from "next/link";

/**
 * Pie común a la portada y a las páginas internas.
 *
 * Las anclas van como "/#seccion" y no "#seccion": este pie también se
 * renderiza en /calendario y /foro, donde un ancla suelta no llevaría a
 * ninguna parte.
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
            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                color: "var(--slate)",
                maxWidth: 280,
              }}
            >
              Consejo Estudiantil, Colegio Don Bosco. Justicia, rectitud y
              trabajo por quien viene después.
            </p>
          </div>

          <div className="footer-col">
            <h5>Plataforma</h5>
            <Link href="/#propuestas">Propuestas</Link>
            <Link href="/#nombre">El nombre</Link>
            <Link href="/#objetivos">Objetivos</Link>
            <Link href="/calendario">Calendario</Link>
          </div>

          <div className="footer-col">
            <h5>Comunidad</h5>
            <Link href="/#buzon">Buzón de ideas</Link>
            <Link href="/foro">RED ASTRA</Link>
            <Link href="/#consejo">Sobre el consejo</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Consejo Estudiantil Di Astrea · Colegio Don Bosco · 2027</p>
          <p>Formación salesiana: buenos cristianos y honrados ciudadanos.</p>
        </div>
      </div>
    </footer>
  );
}
