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
            Un espacio abierto donde el estudiantado podrá proponer, debatir y
            votar las ideas que mueven al colegio. No es un tablero de
            avisos: es la mesa donde se sienta quien quiere construir algo
            real. Lo estamos construyendo para que tu voz no se quede en el
            patio.
          </p>

          <p className="cs-cta">
            Ayúdanos a seguir desarrollando soluciones y cambios — la mejor
            forma de hacerlo es contándonos qué necesitas.{" "}
            <a href="#buzon">Deja tu idea en el buzón</a> y sé de los primeros
            en marcar la diferencia.
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
