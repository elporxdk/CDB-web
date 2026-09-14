import Image from "next/image";

export default function About() {
  return (
    <section className="about" id="consejo">
      <div className="wrap">
        <div className="about-grid">
          <div className="about-art">
            <div className="about-sparks" aria-hidden="true">
              <span className="about-spark" />
              <span className="about-spark" />
              <span className="about-spark" />
              <span className="about-spark" />
              <span className="about-spark" />
              <span className="about-spark" />
            </div>
            <Image
              src="/Aguila2.png"
              alt="Mascota de Di Astrea volando con la banda del consejo estudiantil"
              width={1263}
              height={1120}
              sizes="(max-width: 920px) 240px, 360px"
            />
          </div>
          <div className="about-copy">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <p className="tag">
                <span className="dot" />
                Transparencia
              </p>
              <h2>Un registro público de cómo se manejan los proyectos.</h2>
            </div>
            <p>
              Cada propuesta que presenta el consejo queda anotada aquí: qué
              se propuso, en qué va y qué se decidió. No todo se aprueba, y
              eso también se muestra. La idea es simple: que cualquier
              estudiante pueda revisar el estado real de lo que se prometió,
              en cualquier momento del año.
            </p>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat">
            <b>5</b>
            <span>Áreas de trabajo activas</span>
          </div>
          <div className="stat">
            <b>10</b>
            <span>Propuestas en registro</span>
          </div>
          <div className="stat">
            <b>4</b>
            <span>Informes trimestrales al año</span>
          </div>
        </div>
      </div>
    </section>
  );
}
