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
            <a href="#propuestas">Propuestas</a>
            <a href="#nombre">El nombre</a>
            <a href="#objetivos">Objetivos</a>
          </div>

          <div className="footer-col">
            <h5>Comunidad</h5>
            <a href="#buzon">Buzón de ideas</a>
            <a href="#consejo">Informes trimestrales</a>
            <a href="#consejo">Sobre el consejo</a>
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
