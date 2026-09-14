"use client";

import { useState } from "react";
import Image from "next/image";
import { areas } from "@/lib/proposals";
import { STATUS_LABEL, type AreaId, type ProposalStatus } from "@/lib/types";
import AreaIcon from "@/components/icons/AreaIcon";

type Filter = AreaId | "todas";

// Los filtros se derivan de las áreas para que siempre coincidan con el
// nombre real de cada proyecto.
const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  ...areas.map((area) => ({ id: area.id, label: area.name })),
];

function statusClass(status: ProposalStatus): string {
  if (status === "aprobada") return "ok";
  if (status === "en-desarrollo") return "dev";
  return "no";
}

export default function Proposals() {
  const [filter, setFilter] = useState<Filter>("todas");

  const visibleAreas =
    filter === "todas" ? areas : areas.filter((area) => area.id === filter);

  return (
    <section className="proposals" id="propuestas">
      <div className="wrap">
        <div className="sec-head">
          <p className="tag">
            <span className="dot" />
            Lo que se está trabajando
          </p>
          <h2>Propuestas del consejo</h2>
          <p>
            Cinco áreas, dos propuestas concretas por área como mínimo. Cada
            una con su estado real: aprobada, en desarrollo o denegada.
          </p>
        </div>

        <div className="filters" role="tablist" aria-label="Filtrar propuestas por área">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
              role="tab"
              aria-selected={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visibleAreas.map((area) => (
          <div className="area-block" key={area.id}>
            <div className="area-head">
              <div className="area-icon">
                <AreaIcon id={area.id} />
              </div>
              <div>
                <h3>{area.name}</h3>
                <p>{area.blurb}</p>
              </div>
            </div>

            <div className="proposal-grid">
              {area.proposals.map((proposal, i) => (
                <div className="card" key={proposal.title}>
                  <div
                    className="card-photo"
                    style={{
                      background:
                        i % 2 === 0
                          ? "linear-gradient(150deg,#1D275E,#131A45)"
                          : "linear-gradient(150deg,#2A3777,#1D275E)",
                    }}
                  >
                    {proposal.image ? (
                      <Image
                        src={proposal.image}
                        alt={proposal.title}
                        fill
                        sizes="(max-width: 920px) 100vw, 420px"
                      />
                    ) : (
                      <AreaIcon id={area.id} />
                    )}
                  </div>
                  <div className="card-body">
                    <h4>{proposal.title}</h4>
                    <p>{proposal.description}</p>
                    <div className="status-row">
                      <span className={`status ${statusClass(proposal.status)}`}>
                        <span className="dot" />
                        {STATUS_LABEL[proposal.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
