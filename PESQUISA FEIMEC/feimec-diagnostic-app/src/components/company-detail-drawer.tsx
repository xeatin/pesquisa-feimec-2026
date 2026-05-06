"use client";

import { useEffect } from "react";

import {
  churnBandMeta,
  classMeta,
  decisionMeta,
  formatPercent,
  type CompanyPrediction,
} from "@/lib/feimec-predictions";

type CompanyDetailDrawerProps = {
  company: CompanyPrediction | null;
  open: boolean;
  onClose: () => void;
};

function ProbabilityTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{formatPercent(value)}</p>
      <div className="metric-track mt-3">
        <div className="metric-fill" style={{ width: `${value}%`, backgroundColor: tone }} />
      </div>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}/100</p>
      <div className="mt-3 h-1.5 rounded-full" style={{ backgroundColor: `${tone}33` }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: tone }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-white/64">{detail}</p>
    </div>
  );
}

function FactCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-white/62">{detail}</p>
    </div>
  );
}

function ExecutiveCard({
  title,
  text,
  accent,
}: {
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <p className="section-label text-white/42">{title}</p>
      </div>
      <p className="mt-4 text-base leading-7 text-white/78">{text}</p>
    </section>
  );
}

function DetailList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <p className="section-label text-white/42">{title}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={`${title}-${item}`}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-white/72"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function DetailText({
  title,
  text,
}: {
  title: string;
  text: string | null;
}) {
  if (!text) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <p className="section-label text-white/42">{title}</p>
      <p className="mt-4 text-sm leading-7 text-white/70">{text}</p>
    </section>
  );
}

export function CompanyDetailDrawer({ company, open, onClose }: CompanyDetailDrawerProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !company) {
    return null;
  }

  const decision = decisionMeta[company.decision];
  const classTone = classMeta[company.class];
  const churnTone = churnBandMeta[company.predictions.churnBand];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label={`Fechar resumo de ${company.name}`}
        onClick={onClose}
        className="absolute inset-0 bg-[#03070dcc]/80 backdrop-blur-sm"
      />

      <aside className="relative flex h-full w-full max-w-[820px] flex-col border-l border-white/10 bg-[#07111df2] shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#07111df2] px-5 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-label text-white/42">Leitura executiva da conta</p>
              <p className="mt-2 text-sm text-white/56">Resumo para orientar a proxima conversa comercial.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/74 transition hover:bg-white/[0.08]"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 lg:px-8 lg:py-8">
          <section className="glass-panel noise relative overflow-hidden rounded-[34px] border border-white/10 p-6 lg:p-7">
            <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-[#7cd0ff]/16 blur-3xl" />
            <div className="absolute -right-12 top-12 h-44 w-44 rounded-full bg-[#79f2b8]/12 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-full border px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
                  style={{ borderColor: `${classTone.tone}55`, color: classTone.tone }}
                >
                  {classTone.label}
                </span>
                <span
                  className="rounded-full border px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    borderColor: `${decision.tone}55`,
                    color: decision.tone,
                    backgroundColor: decision.surface,
                  }}
                >
                  {decision.label}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-white/58">
                  {company.profile.boothLabel || "Stand nao identificado"}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-white/58">
                  {company.segmentation.categoryLabel}
                </span>
                {company.profile.inferred ? (
                  <span className="rounded-full border border-[#ffd36e]/45 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffd36e]">
                    Leitura estimada
                  </span>
                ) : null}
              </div>

              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {company.name}
              </h2>

              <p className="mt-5 text-base leading-7 text-white/72">
                {company.profile.summary80_20 ?? company.diagnostic ?? company.consolidatedContext}
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <ExecutiveCard title="Motivo principal" text={company.mainReason} accent="#7cd0ff" />
                <ExecutiveCard
                  title="Proxima acao"
                  text={`${company.nextActionShort} ${company.nextBestAction}`}
                  accent="#79f2b8"
                />
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <ScoreTile
                  label="Chance de boa experiencia"
                  value={company.goodExperience.score}
                  detail={company.goodExperience.explanation}
                  tone="#ffd36e"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <ProbabilityTile
                    label="Renovar + upar"
                    value={company.predictions.renewAndUpgradeProbability}
                    tone="#79f2b8"
                  />
                  <ProbabilityTile
                    label="Renovar"
                    value={company.predictions.buyStandAgainProbability}
                    tone="#7cd0ff"
                  />
                  <ProbabilityTile
                    label="Upgrade"
                    value={company.predictions.buyBetterStandProbability}
                    tone="#79f2b8"
                  />
                  <ProbabilityTile
                    label="Churn"
                    value={company.predictions.churnProbability}
                    tone={churnTone.tone}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.03] p-5 lg:p-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-label text-white/42">Posicao na categoria</p>
                <h3 className="mt-3 font-display text-3xl font-semibold text-white">
                  Como a conta se comporta entre pares
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                  A comparacao considera apenas empresas que disputam o mesmo tipo de visitante.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <FactCard
                label="Categoria"
                value={company.segmentation.categoryLabel}
                detail={`${company.segmentation.companyCountInCategory} empresa(s) no grupo comparavel.`}
              />
              <FactCard
                label="Pressao competitiva"
                value={`${company.segmentation.directCompetitorsCount} concorrentes`}
                detail="Expositores comparaveis disputando a mesma atencao na mesma categoria."
              />
              <FactCard
                label="Momento da categoria"
                value={company.segmentation.categoryStatus}
                detail={company.segmentation.categoryStatusReason}
              />
              <FactCard
                label="Risco na categoria"
                value={company.segmentation.relativeRiskLabel}
                detail={company.segmentation.relativeRiskReason}
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <ExecutiveCard
                title="Diferencial competitivo"
                text={`${company.segmentation.differentialLabel} ${company.segmentation.differentialReason}`}
                accent="#79f2b8"
              />
              <ExecutiveCard
                title="Plano de abordagem"
                text={`${company.mainReason} ${company.nextActionShort}`}
                accent="#7cd0ff"
              />
            </div>
          </section>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <p className="section-label text-white/42">Sinais a favor</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {company.goodExperience.whyBelieve.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6 text-white/72"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </section>

            <DetailList title="Sinais-chave" items={company.insights} />
            <DetailList title="Servicos principais" items={company.profile.services} />
            <DetailList title="Produtos" items={company.profile.products} />
            <DetailList title="Dores do expositor" items={company.profile.pains} />
            <DetailList title="Objetivos" items={company.profile.dreams} />
            <DetailList title="Gargalos" items={company.profile.bottlenecks} />
            <DetailList title="Pontos descobertos" items={company.profile.gaps} />
            <DetailText title="Sinais do mercado" text={company.profile.publicSignals} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <DetailText title="Leitura comercial" text={company.diagnostic} />
            <DetailText title="Resumo do contexto" text={company.consolidatedContext} />
          </div>
        </div>
      </aside>
    </div>
  );
}