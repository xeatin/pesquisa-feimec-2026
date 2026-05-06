export type PredictionCriterion = {
  index: number;
  label: string;
  score: number;
  maxScore: number;
  warning: boolean;
  justification: string;
};

export type ChurnBand = "critical" | "high" | "medium" | "low" | "very-low";

export type DecisionKey =
  | "upgrade-stand"
  | "renew-stand"
  | "salvage-account"
  | "high-churn-risk";

export type CategoryKey =
  | "automation-robotics"
  | "cutting-welding-laser"
  | "cnc-forming"
  | "industrial-software"
  | "metrology-quality"
  | "components-fluids-pneumatics"
  | "movement-logistics"
  | "associations-entities"
  | "general-industrial";

export type CompanyProfile = {
  name: string;
  slug: string;
  fileName: string | null;
  booths: string[];
  boothLabel: string;
  baseUsed: string | null;
  searchUrl: string | null;
  matchesFound: number | null;
  inferred: boolean;
  summary80_20: string | null;
  products: string[];
  services: string[];
  pains: string[];
  dreams: string[];
  bottlenecks: string[];
  gaps: string[];
  publicSignals: string | null;
};

export type GoodExperienceScore = {
  score: number;
  explanation: string;
  whyBelieve: string[];
};

export type CompanySegmentation = {
  categoryKey: CategoryKey;
  categoryLabel: string;
  directCompetitorsCount: number;
  companyCountInCategory: number;
  categoryStatus: string;
  categoryStatusReason: string;
  differentialLabel: string;
  differentialReason: string;
  relativeRiskLabel: string;
  relativeRiskReason: string;
};

export type PredictionSnapshot = {
  name: string;
  slug: string;
  boothLabel: string;
  score: number;
  class: "A" | "B" | "C" | "D";
  probability: number;
  decision: DecisionKey;
  rationale: string;
  nextBestAction: string;
  renewalProbability: number;
  upgradeProbability: number;
  churnProbability: number;
  renewAndUpgradeProbability: number;
};

export type CompanyPrediction = {
  slug: string;
  name: string;
  score: number;
  class: "A" | "B" | "C" | "D";
  bucket: "renew-now" | "renew-with-upsell" | "save-with-roi-plan" | "high-churn-risk";
  actionLabel: string;
  playbook: string;
  consolidatedContext: string;
  diagnostic: string | null;
  actionRecommended: string;
  criteria: PredictionCriterion[];
  profile: CompanyProfile;
  source: {
    report: string;
    hasDetailedProfile: boolean;
    detailedSection: "top20" | "bottom10" | null;
    hasCompanyFile: boolean;
    inferredCompanyProfile: boolean;
  };
  predictions: {
    buyStandAgainProbability: number;
    churnProbability: number;
    buyBetterStandProbability: number;
    renewAndUpgradeProbability: number;
    partnershipProbability: number;
    churnBand: ChurnBand;
  };
  insights: string[];
  mainReason: string;
  nextActionShort: string;
  goodExperience: GoodExperienceScore;
  segmentation: CompanySegmentation;
  nextBestAction: string;
  decision: DecisionKey;
};

export type FeimecPredictionsPayload = {
  generatedAt: string;
  sourceFile: string;
  methodology: {
    input: string;
    note: string;
    formulas: {
      renewal: string;
      churn: string;
      upgrade: string;
      renewAndUpgrade: string;
      goodExperience: string;
    };
  };
  summary: {
    totalCompanies: number;
    averageScore: number;
    inferredProfilesCount: number;
    countsByClass: Record<"A" | "B" | "C" | "D", number>;
    decisionCounts: Record<DecisionKey, number>;
    expansionCandidates: PredictionSnapshot[];
    standAgainCandidates: PredictionSnapshot[];
    betterStandCandidates: PredictionSnapshot[];
    topChurnRisk: PredictionSnapshot[];
  };
  companies: CompanyPrediction[];
};

export const classMeta: Record<CompanyPrediction["class"], { label: string; tone: string }> = {
  A: { label: "Classe A", tone: "#79f2b8" },
  B: { label: "Classe B", tone: "#7cd0ff" },
  C: { label: "Classe C", tone: "#ffd36e" },
  D: { label: "Classe D", tone: "#ff8a7a" },
};

export const decisionMeta: Record<DecisionKey, { label: string; tone: string; surface: string }> = {
  "upgrade-stand": {
    label: "Foco em upgrade",
    tone: "#7cf29a",
    surface: "rgba(124, 242, 154, 0.14)",
  },
  "renew-stand": {
    label: "Renovar já",
    tone: "#7cd0ff",
    surface: "rgba(124, 208, 255, 0.14)",
  },
  "salvage-account": {
    label: "Salvar com ROI",
    tone: "#ffd36e",
    surface: "rgba(255, 211, 110, 0.14)",
  },
  "high-churn-risk": {
    label: "Risco crítico",
    tone: "#ff8a7a",
    surface: "rgba(255, 138, 122, 0.14)",
  },
};

export const churnBandMeta: Record<ChurnBand, { label: string; tone: string }> = {
  critical: { label: "Crítico", tone: "#ff8a7a" },
  high: { label: "Alto", tone: "#ffad66" },
  medium: { label: "Médio", tone: "#ffd36e" },
  low: { label: "Baixo", tone: "#7cd0ff" },
  "very-low": { label: "Muito baixo", tone: "#79f2b8" },
};

export function formatPercent(value: number) {
  return `${value}%`;
}