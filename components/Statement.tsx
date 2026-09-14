const WORDS = [
  { text: "¡Sé", accent: false },
  { text: "parte", accent: false },
  { text: "del", accent: false },
  { text: "cambio!", accent: true },
];

export default function Statement() {
  return (
    <section className="statement" aria-label="Sé parte del cambio">
      <div className="statement-glow" aria-hidden="true" />
      <div className="statement-inner">
        <p className="statement-eyebrow">
          <span className="dot" />
          El consejo lo hacemos entre todos
        </p>
        <p className="statement-line">
          {WORDS.map((word) => (
            <span className="statement-word" key={word.text}>
              <span className={word.accent ? "statement-accent" : undefined}>
                {word.text}
              </span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
