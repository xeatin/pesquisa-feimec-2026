import type { Metadata } from "next";

import { RetentionDashboard } from "@/components/retention-dashboard";
import predictionsData from "@/data/feimec-predictions.json";
import type { FeimecPredictionsPayload } from "@/lib/feimec-predictions";

export const metadata: Metadata = {
  title: "Painel Executivo | FEIMEC 2026",
  description:
    "Painel executivo para administrador, COO e dono do evento acompanharem renovação, churn e expansão dos expositores da FEIMEC.",
};

export default function Home() {
  return <RetentionDashboard data={predictionsData as FeimecPredictionsPayload} />;
}
