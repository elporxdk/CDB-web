import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div>
          <p className="eyebrow">
            <span className="dot" />
            Consejo estudiantil, Colegio Don Bosco 2027
          </p>
          <h1>La justicia no se hereda: se construye entre todos.</h1>
          <p className="sub">
            Di Astrea es el espacio donde el consejo estudiantil muestra lo
            que hace, cómo lo hace y en qué va cada proyecto. Sin letra
            pequeña, sin promesas sueltas.
          </p>
          <div className="cta-row">
            <a href="#propuestas" className="btn-primary">
              Ver las propuestas
            </a>
            <a href="#buzon" className="btn-ghost">
              Enviar mi idea
            </a>
          </div>
        </div>

        <div className="hero-art">
          <svg
            className="constellation"
            viewBox="0 0 400 400"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="#D4A72C" strokeWidth={1} opacity={0.55}>
              <line x1="60" y1="70" x2="120" y2="40" />
              <line x1="120" y1="40" x2="200" y2="60" />
              <line x1="200" y1="60" x2="270" y2="30" />
              <line x1="270" y1="30" x2="330" y2="80" />
              <line x1="60" y1="70" x2="90" y2="150" />
              <line x1="330" y1="80" x2="340" y2="170" />
              <line x1="90" y1="150" x2="60" y2="230" />
              <line x1="340" y1="170" x2="310" y2="260" />
              <line x1="60" y1="230" x2="110" y2="320" />
              <line x1="310" y1="260" x2="250" y2="330" />
              <line x1="110" y1="320" x2="250" y2="330" />
            </g>
            <g fill="#F2D479">
              <circle cx="60" cy="70" r="3" />
              <circle cx="120" cy="40" r="2.4" />
              <circle cx="200" cy="60" r="3.4" />
              <circle cx="270" cy="30" r="2.4" />
              <circle cx="330" cy="80" r="3" />
              <circle cx="90" cy="150" r="2" />
              <circle cx="340" cy="170" r="2.4" />
              <circle cx="60" cy="230" r="3" />
              <circle cx="310" cy="260" r="2.4" />
              <circle cx="110" cy="320" r="2.8" />
              <circle cx="250" cy="330" r="2.4" />
            </g>
          </svg>
          <Image
            src="/mascot-large.webp"
            alt="Mascota de Di Astrea, un águila con lentes leyendo un libro"
            width={525}
            height={640}
            priority
            sizes="(max-width: 920px) 260px, 420px"
          />
        </div>
      </div>
    </section>
  );
}
