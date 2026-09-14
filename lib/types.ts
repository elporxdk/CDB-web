export type ProposalStatus = "aprobada" | "en-desarrollo" | "denegada";

export type AreaId =
  | "innovabosco"
  | "carl-rogers"
  | "expres-arte"
  | "domingo-savio"
  | "adn-salesiano";

export interface Proposal {
  title: string;
  description: string;
  status: ProposalStatus;
  image?: string;
}

export interface AreaBlock {
  id: AreaId;
  name: string;
  blurb: string;
  proposals: Proposal[];
}

export const STATUS_LABEL: Record<ProposalStatus, string> = {
  aprobada: "Aprobada",
  "en-desarrollo": "En desarrollo",
  denegada: "Denegada",
};
