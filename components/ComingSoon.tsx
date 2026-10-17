export default function ComingSoon() {
  return (
    <section className="coming-soon" id="foro">
      <div className="wrap">
        <div className="coming-soon-inner">
          <div className="coming-soon-badge">
            <span className="dot" />
            Próximamente
          </div>

          <h2>
            El foro de <span className="cs-accent">Di Astrea</span> está en
            camino.
          </h2>

          <p>
            Un espacio abierto donde el estudiante podrá mostrar sus talentos
            al mundo y expresarse con aquello que le apasiona. No es un tablero
            de avisos: es la mesa donde se sienta quien quiere construir algo
            real. Lo estamos construyendo para que tu voz no se quede en el
            patio.
          </p>

          <p className="cs-cta">
            Mientras tanto, la forma más directa de que tu voz llegue al
            Consejo es contarnos qué necesitas:{" "}
            <a href="#enviar-propuesta">envíanos una propuesta</a>.
          </p>

          <div className="cs-orbit" aria-hidden="true">
            <span className="cs-core" />
            <span className="cs-ring cs-ring-1" />
            <span className="cs-ring cs-ring-2" />
            <span className="cs-ring cs-ring-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
