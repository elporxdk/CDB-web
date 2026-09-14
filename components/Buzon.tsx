import Image from "next/image";

// TODO: reemplaza esta URL por el link real del formulario (Google Forms, Typeform, etc.)
const FORM_URL = "#";

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
            src="/mascot-small.webp"
            alt="Mascota de Di Astrea sosteniendo un libro"
            width={164}
            height={200}
          />
        </div>
      </div>
    </section>
  );
}
