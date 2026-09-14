import type { ReactNode } from "react";

interface SpecificObjective {
  title: string;
  description: string;
  icon: ReactNode;
}

const SPECIFIC_OBJECTIVES: SpecificObjective[] = [
  {
    title: "Necesidades reales primero",
    description:
      "Atender necesidades concretas del estudiantado con acciones que puedan sostenerse durante todo el año lectivo, empezando por las que no requieren presupuesto.",
    icon: <path d="M4 12l5 5L20 6" />,
  },
  {
    title: "Que el estudiantado ejecute, no solo participe",
    description:
      "Abrir espacios donde el estudiantado ejecute y no solo participe, por medio del refuerzo entre pares, los clubes, las comisiones de trabajo y la representación por sección.",
    icon: (
      <path d="M12 3v4M12 17v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M3 12h4M17 12h4M4.2 19.8L7 17M17 7l2.8-2.8" />
    ),
  },
  {
    title: "Rendición de cuentas constante",
    description:
      "Mantener un sistema de escucha y de rendición de cuentas, con informes trimestrales públicos sobre el estado de cada acción.",
    icon: <path d="M4 4v16M4 6h11l-2 3 2 3H4" />,
  },
];

export default function Objectives() {
  return (
    <section className="objectives" id="objetivos">
      <div className="wrap">
        <div className="sec-head">
          <p className="tag">
            <span className="dot" />
            Plan de trabajo
          </p>
          <h2>Objetivos de la fórmula</h2>
        </div>

        <div className="tilt-stage">
          <div className="objective-panel">
            <p className="label">Objetivo general</p>
            <p>
              Ejecutar un plan de trabajo que fortalezca la vida académica,
              cultural, deportiva, técnica y pastoral del Colegio Don Bosco y
              del CECE San Juan Bosco, y que amplíe la participación del
              estudiantado en las actividades y decisiones que le afectan,
              bajo el espíritu salesiano de formar buenos cristianos y
              honrados ciudadanos.
            </p>
          </div>
        </div>

        <p className="tag" style={{ marginBottom: 0 }}>
          <span className="dot" />
          Objetivos específicos
        </p>
        <div className="specific-list">
          {SPECIFIC_OBJECTIVES.map((obj) => (
            <div className="specific-item" key={obj.title}>
              <div className="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="#F2D479" strokeWidth={1.7} aria-hidden="true">
                  {obj.icon}
                </svg>
              </div>
              <h4>{obj.title}</h4>
              <p>{obj.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
