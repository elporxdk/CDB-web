import type { ReactNode } from "react";
import type { AreaId } from "@/lib/types";

interface AreaIconProps {
  id: AreaId;
  className?: string;
}

const PATHS: Record<AreaId, ReactNode> = {
  // Libro: el aprendizaje que se vuelve experiencia.
  innovabosco: (
    <>
      <path d="M4 5.5c2.5-1 5.5-1 8 0v13c-2.5-1-5.5-1-8 0v-13z" />
      <path d="M20 5.5c-2.5-1-5.5-1-8 0v13c2.5-1 5.5-1 8 0v-13z" />
    </>
  ),
  // Globo de diálogo: el foro de escucha y el refuerzo entre pares.
  "carl-rogers": (
    <>
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-5 4z" />
      <path d="M8.5 9.5h7M8.5 12.5h4.5" />
    </>
  ),
  // Máscaras de teatro: murales, radio, galería y teatro.
  "expres-arte": (
    <>
      <path d="M4 6c2.2 2 4 2 6 0 2 2 3.8 2 6 0" />
      <path d="M4 6c-1 5 1.5 9 6 9s7-4 6-9" />
      <path d="M8 20c1.2-1.3 6.8-1.3 8 0" />
    </>
  ),
  // Corazón: los grandes hacen para los pequeños.
  "domingo-savio": (
    <path d="M12 20s-7-4.4-7-9.6C5 7 7.2 5 9.7 5c1 0 2 .5 2.3 1.4C12.3 5.5 13.3 5 14.3 5 16.8 5 19 7 19 10.4 19 15.6 12 20 12 20z" />
  ),
  // Balón: los torneos y los retos que suman a la Copa.
  "adn-salesiano": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17M6 6.2c2.2 2 3.8 2 6 0M6 17.8c2.2-2 3.8-2 6 0" />
    </>
  ),
};

export default function AreaIcon({ id, className }: AreaIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F2D479"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  );
}
