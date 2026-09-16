import Image from "next/image";

// Formulario de Google Forms para recibir ideas del estudiantado.
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc9xTSulg6FHnbtoE8uX7XOMGijqhvXJiL9MVxS5ryOwu-PrQ/viewform?usp=publish-editor";

export default function Buzon() {
  return (
    <section className="buzon" id="buzon">
      <div className="wrap buzon-inner">
        <div>
          <h2>¿Qué te gustaría ver el próximo año?</h2>
          <p>
            Las mejores propuestas no nacen en una oficina: nacen en el
            patio, en el salón, en la fila de la cafetería. Cuéntanos qué
            falta y qué cambiarías. Tu idea puede ser la próxima propuesta
            del consejo.
          </p>
          <a href={FORM_URL} className="btn-primary">
            Dejar mi idea en el buzón
          </a>
        </div>
        <div className="buzon-mascot">
          <Image
            src="/Aguila3.png"
            alt="Águila de Di Astrea"
            width={2508}
            height={2508}
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
