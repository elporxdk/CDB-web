import Image from "next/image";

export default function NameStory() {
  return (
    <section className="name-story" id="nombre">
      <div className="wrap">
        <div className="sec-head">
          <p className="tag">
            <span className="dot" />
            Origen
          </p>
          <h2>¿Por qué Di Astrea?</h2>
        </div>

        <div className="name-grid">
          <figure>
            <div className="name-art">
              <svg
                className="constellation"
                viewBox="19 27 350 265"
                fill="none"
                aria-hidden="true"
              >
                <g stroke="#D4A72C" strokeWidth={1.1} opacity={0.7}>
                  <line x1="150" y1="30" x2="110" y2="80" />
                  <line x1="110" y1="80" x2="130" y2="140" />
                  <line x1="130" y1="140" x2="90" y2="180" />
                  <line x1="130" y1="140" x2="180" y2="160" />
                  <line x1="180" y1="160" x2="220" y2="120" />
                  <line x1="180" y1="160" x2="190" y2="220" />
                  <line x1="190" y1="220" x2="150" y2="270" />
                  <line x1="190" y1="220" x2="230" y2="260" />
                  <line x1="90" y1="180" x2="60" y2="240" />
                </g>
                <g fill="#F2D479">
                  <circle cx="150" cy="30" r="3.2" />
                  <circle cx="110" cy="80" r="2.6" />
                  <circle cx="130" cy="140" r="3.6" />
                  <circle cx="90" cy="180" r="2.6" />
                  <circle cx="180" cy="160" r="3.2" />
                  <circle cx="220" cy="120" r="2.6" />
                  <circle cx="190" cy="220" r="3" />
                  <circle cx="150" cy="270" r="2.6" />
                  <circle cx="230" cy="260" r="2.6" />
                  <circle cx="60" cy="240" r="2.4" />
                </g>
              </svg>
              <Image
                src="/LOGO2.svg"
                alt="Emblema del consejo estudiantil Di Astrea: la luna creciente y la estrella de Astrea sobre alas doradas"
                width={460}
                height={459}
                sizes="(max-width: 920px) 220px, 300px"
              />
            </div>
          </figure>

          <div className="name-copy">
            <p>
              Astrea, en la mitología griega y latina, es la doncella de las
              estrellas: diosa de la justicia pura y de la inocencia. Fue la
              última divinidad en abandonar la Tierra cuando la humanidad se
              corrompió, y al ascender se convirtió en la constelación de
              Virgo. Su figura representa la justicia incorruptible y la
              esperanza de un regreso.
            </p>
            <p>
              Di Astrea toma ese nombre porque un consejo estudiantil se
              elige para lo mismo: hacer las cosas con rectitud y dejar la
              casa lista para quien viene después.
            </p>
            <blockquote>
              «Hacer las cosas con rectitud y dejar la casa lista para quien
              viene después.»
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
