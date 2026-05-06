"use client";

import { useMemo, useState } from "react";

import { CompanyDetailDrawer } from "@/components/company-detail-drawer";
import { PredictionsTable } from "@/components/predictions-table";
import {
  churnBandMeta,
  classMeta,
  decisionMeta,
  formatPercent,
  type CompanyPrediction,
  type FeimecPredictionsPayload,
} from "@/lib/feimec-predictions";

type RetentionDashboardProps = {
  data: FeimecPredictionsPayload;
};

type CategorySummary = {
  key: string;
  label: string;
  count: number;
  avgExpansion: number;
  avgChurn: number;
  avgExperience: number;
  upgradeCount: number;
  riskCount: number;
  note: string;
};

type ActionQueueItem = {
  label: string;
  count: number;
};

function percentOf(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function findCompany(companies: CompanyPrediction[], slug: string | null) {
  if (!slug) {
    return null;
  }

  return companies.find((company) => company.slug === slug) ?? null;
}

function buildCategorySummaries(companies: CompanyPrediction[]) {
  const buckets = new Map<
    string,
    {
      key: string;
      label: string;
      count: number;
      expansionSum: number;
      churnSum: number;
      experienceSum: number;
      upgradeCount: number;
      riskCount: number;
    }
  >();

  for (const company of companies) {
    const key = company.segmentation.categoryKey;

    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        label: company.segmentation.categoryLabel,
        count: 0,
        expansionSum: 0,
        churnSum: 0,
        experienceSum: 0,
        upgradeCount: 0,
        riskCount: 0,
      });
    }

    const bucket = buckets.get(key)!;
    bucket.count += 1;
    bucket.expansionSum += company.predictions.renewAndUpgradeProbability;
    bucket.churnSum += company.predictions.churnProbability;
    bucket.experienceSum += company.goodExperience.score;

    if (company.decision === "upgrade-stand") {
      bucket.upgradeCount += 1;
    }

    if (company.decision === "high-churn-risk") {
      bucket.riskCount += 1;
    }
  }

  return Array.from(buckets.values())
    .map((bucket) => {
      const avgExpansion = Math.round(bucket.expansionSum / Math.max(bucket.count, 1));
      const avgChurn = Math.round(bucket.churnSum / Math.max(bucket.count, 1));
      const avgExperience = Math.round(bucket.experienceSum / Math.max(bucket.count, 1));

      let note = `${bucket.count} expositores comparaveis com comportamento equilibrado.`;

      if (bucket.upgradeCount >= bucket.riskCount && avgExpansion >= 60) {
        note = `${bucket.upgradeCount} empresa(s) com espaco claro para crescer na mesma categoria.`;
      } else if (bucket.riskCount > 0 && avgChurn >= 35) {
        note = `${bucket.riskCount} empresa(s) exigem defesa ativa para evitar perda de recorrencia.`;
      }

      return {
        key: bucket.key,
        label: bucket.label,
        count: bucket.count,
        avgExpansion,
        avgChurn,
        avgExperience,
        upgradeCount: bucket.upgradeCount,
        riskCount: bucket.riskCount,
        note,
      } satisfies CategorySummary;
    })
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return right.avgExpansion - left.avgExpansion;
    });
}

function buildActionQueue(companies: CompanyPrediction[]) {
  const buckets = new Map<string, number>();

  for (const company of companies) {
    buckets.set(company.nextActionShort, (buckets.get(company.nextActionShort) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([label, count]) => ({ label, count } satisfies ActionQueueItem))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label, "pt-BR");
    });
}

function HeaderChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60">
      {children}
    </span>
  );
}

function HeroMetricCard({
  label,
  value,
  detail,
  tone,
  share,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  share: number;
}) {
  return (
    <article className="rounded-[26px] border border-white/10 bg-black/20 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[11rem] text-[0.68rem] uppercase tracking-[0.22em] text-white/42">{label}</p>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/54">
          {share}% da carteira
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="font-display text-4xl font-semibold leading-none text-white sm:text-[2.8rem]">{value}</p>
        <div className="mb-1 h-1.5 w-16 shrink-0 rounded-full" style={{ backgroundColor: `${tone}33` }}>
          <div className="h-full w-full rounded-full" style={{ backgroundColor: tone }} />
        </div>
      </div>

      <p className="mt-3 clamp-2 text-sm leading-6 text-white/62">{detail}</p>
    </article>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-3 font-display text-4xl font-semibold text-white">{value}</p>
      <div className="mt-4 h-1.5 rounded-full" style={{ backgroundColor: `${tone}33` }}>
        <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: tone }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-white/58">{detail}</p>
    </article>
  );
}

function ActionQueueCard({ items }: { items: ActionQueueItem[] }) {
  return (
    <section className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
      <p className="section-label text-white/48">Agenda imediata</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
        As frentes que pedem acao agora
      </h2>
      <div className="mt-6 space-y-3">
        {items.slice(0, 4).map((item, index) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-white/42">Frente {index + 1}</p>
              <p className="mt-1 text-base font-semibold text-white">{item.label}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-semibold text-white">{item.count}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/44">empresas</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FocusCard({
  eyebrow,
  title,
  value,
  detail,
  tone,
}: {
  eyebrow: string;
  title: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-3xl font-semibold" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/62">{detail}</p>
    </article>
  );
}

function SpotlightCard({
  company,
  onOpen,
}: {
  company: CompanyPrediction;
  onOpen: (slug: string) => void;
}) {
  const decision = decisionMeta[company.decision];
  const churnTone = churnBandMeta[company.predictions.churnBand];
  const classTone = classMeta[company.class];

  return (
    <section className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="section-label text-white/48">Conta com maior alavanca agora</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
              style={{ borderColor: `${classTone.tone}55`, color: classTone.tone }}
            >
              {classTone.label}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
              style={{
                borderColor: `${decision.tone}55`,
                color: decision.tone,
                backgroundColor: decision.surface,
              }}
            >
              {decision.label}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/56">
              {company.profile.boothLabel || "Sem estande"}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/56">
              {company.segmentation.categoryLabel}
            </span>
          </div>

          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {company.name}
          </h2>

          <p className="mt-4 text-lg leading-7 text-white/72">{company.mainReason}</p>
          <p className="mt-3 text-sm leading-6 text-white/58">{company.nextActionShort}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {company.goodExperience.whyBelieve.slice(0, 3).map((reason) => (
              <span
                key={reason}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/64"
              >
                {reason}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onOpen(company.slug)}
            className="mt-6 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            Abrir analise da conta
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
          <MetricCard
            label="Renovar + upar"
            value={formatPercent(company.predictions.renewAndUpgradeProbability)}
            detail={`Renovar ${formatPercent(company.predictions.buyStandAgainProbability)} e upgrade ${formatPercent(company.predictions.buyBetterStandProbability)}.`}
            tone="#79f2b8"
          />
          <MetricCard
            label="Boa experiencia provavel"
            value={`${company.goodExperience.score}/100`}
            detail={company.goodExperience.explanation}
            tone="#ffd36e"
          />
          <MetricCard
            label="Churn"
            value={formatPercent(company.predictions.churnProbability)}
            detail={`${churnTone.label} dentro da carteira atual.`}
            tone={churnTone.tone}
          />
          <MetricCard
            label="Risco dentro do grupo"
            value={company.segmentation.relativeRiskLabel.replace("Risco ", "")}
            detail={company.segmentation.relativeRiskReason}
            tone="#7cd0ff"
          />
        </div>
      </div>
    </section>
  );
}

function DistributionCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number; total: number; tone: string; detail: string }>;
}) {
  return (
    <section className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
      <p className="section-label text-white/48">Carteira</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-white/56">{item.detail}</p>
              </div>
              <p className="text-2xl font-semibold text-white">{item.value}</p>
            </div>
            <div className="metric-track mt-4">
              <div
                className="metric-fill"
                style={{ width: `${percentOf(item.value, item.total)}%`, backgroundColor: item.tone }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryBoard({ items }: { items: CategorySummary[] }) {
  return (
    <section className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
      <p className="section-label text-white/48">Monitoramento por categoria</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
        Onde a feira esta forte e onde esta pressionada
      </h2>
      <div className="mt-6 space-y-3">
        {items.slice(0, 6).map((item) => (
          <div
            key={item.key}
            className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr_1fr] lg:items-center"
          >
            <div>
              <p className="text-base font-semibold text-white">{item.label}</p>
              <p className="mt-1 text-sm text-white/54">{item.count} expositores comparaveis</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/40">Ren.+Up</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatPercent(item.avgExpansion)}</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/40">Experiencia</p>
              <p className="mt-1 text-lg font-semibold text-white">{item.avgExperience}/100</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/40">Churn</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatPercent(item.avgChurn)}</p>
            </div>
            <p className="text-sm leading-6 text-white/58">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QueueCompanyCard({
  company,
  tone,
  label,
  onOpen,
}: {
  company: CompanyPrediction;
  tone: string;
  label: string;
  onOpen: (slug: string) => void;
}) {
  const decision = decisionMeta[company.decision];

  return (
    <button
      type="button"
      onClick={() => onOpen(company.slug)}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">{label}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">{company.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/58">
              {company.profile.boothLabel || "Sem estande"}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/58">
              {company.segmentation.categoryLabel}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
              style={{
                borderColor: `${decision.tone}55`,
                color: decision.tone,
                backgroundColor: decision.surface,
              }}
            >
              {decision.label}
            </span>
          </div>
        </div>
        <div className="rounded-[22px] border px-4 py-3 text-right" style={{ borderColor: `${tone}33`, backgroundColor: `${tone}14` }}>
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/42">Sinal</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {label === "Expansao" ? formatPercent(company.predictions.renewAndUpgradeProbability) : formatPercent(company.predictions.churnProbability)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/72">{company.mainReason}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/42">Acao</p>
          <p className="mt-2 text-sm font-semibold text-white">{company.nextActionShort}</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/42">Experiencia</p>
          <p className="mt-2 text-sm font-semibold text-white">{company.goodExperience.score}/100</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/42">Risco grupo</p>
          <p className="mt-2 text-sm font-semibold text-white">{company.segmentation.relativeRiskLabel}</p>
        </div>
      </div>
    </button>
  );
}

function FooterPanel({
  generatedAt,
  totalCompanies,
  mappedBoothsCount,
}: {
  generatedAt: string;
  totalCompanies: number;
  mappedBoothsCount: number;
}) {
  return (
    <footer className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <p className="section-label text-white/48">Como decidir</p>
          <p className="mt-3 text-sm leading-7 text-white/66">
            Comece pelas frentes urgentes, avance para categorias sob pressao e abra a conta
            apenas quando precisar sustentar a conversa comercial.
          </p>
        </div>
        <div>
          <p className="section-label text-white/48">Escopo da leitura</p>
          <p className="mt-3 text-sm leading-7 text-white/66">
            {totalCompanies} expositores analisados, com {mappedBoothsCount} contas ja conectadas ao
            stand e leitura pronta de expansao, renovacao e risco.
          </p>
        </div>
        <div>
          <p className="section-label text-white/48">Atualizacao da leitura</p>
          <p className="mt-3 text-sm leading-7 text-white/66">
            Painel atualizado em {new Date(generatedAt).toLocaleString("pt-BR")} para reuniao de
            diretoria, time comercial e decisao de carteira.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function RetentionDashboard({ data }: RetentionDashboardProps) {
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | null>(null);

  const totalCompanies = data.summary.totalCompanies;
  const mappedBoothsCount = data.companies.filter((company) => company.profile.booths.length > 0).length;
  const criticalChurnCount = data.companies.filter(
    (company) => company.predictions.churnBand === "critical",
  ).length;
  const upgradeCount = data.summary.decisionCounts["upgrade-stand"];
  const renewalCount = data.summary.decisionCounts["renew-stand"];
  const salvageCount = data.summary.decisionCounts["salvage-account"];
  const highChurnCount = data.summary.decisionCounts["high-churn-risk"];
  const leadingCompany =
    findCompany(data.companies, data.summary.expansionCandidates[0]?.slug ?? null) ?? data.companies[0] ?? null;
  const selectedCompany = findCompany(data.companies, selectedCompanySlug);

  const categorySummaries = useMemo(() => buildCategorySummaries(data.companies), [data.companies]);
  const actionQueue = useMemo(() => buildActionQueue(data.companies), [data.companies]);
  const growthCategory = [...categorySummaries]
    .filter((category) => category.upgradeCount > 0)
    .sort((left, right) => {
      if (right.avgExpansion !== left.avgExpansion) {
        return right.avgExpansion - left.avgExpansion;
      }

      if (right.upgradeCount !== left.upgradeCount) {
        return right.upgradeCount - left.upgradeCount;
      }

      return right.avgExperience - left.avgExperience;
    })[0];
  const riskCategory = [...categorySummaries].sort((left, right) => {
    if (right.riskCount !== left.riskCount) {
      return right.riskCount - left.riskCount;
    }

    return right.avgChurn - left.avgChurn;
  })[0];

  const expansionCompanies = data.summary.expansionCandidates
    .slice(0, 6)
    .map((item) => findCompany(data.companies, item.slug))
    .filter((company): company is CompanyPrediction => company !== null);

  const churnCompanies = data.summary.topChurnRisk
    .slice(0, 4)
    .map((item) => findCompany(data.companies, item.slug))
    .filter((company): company is CompanyPrediction => company !== null);

  return (
    <>
      <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
        <div className="mx-auto max-w-[1800px] space-y-6">
          <section className="glass-panel noise relative overflow-hidden rounded-[36px] border border-white/10 px-6 py-7 lg:px-10 lg:py-9">
            <div className="absolute -left-12 top-0 h-56 w-56 rounded-full bg-[#7cd0ff]/18 blur-3xl" />
            <div className="absolute right-0 top-8 h-64 w-64 rounded-full bg-[#79f2b8]/14 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[#ff8a7a]/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="section-label text-white/50">FEIMEC 2026 | visao executiva da carteira</p>
                <div className="flex flex-wrap gap-2">
                  <HeaderChip>Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR")}</HeaderChip>
                  <HeaderChip>{mappedBoothsCount} contas com stand identificado</HeaderChip>
                </div>
              </div>

              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(640px,0.85fr)] xl:items-center">
                <div className="max-w-4xl">
                  <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    O painel para decidir renovacao, expansao e defesa da carteira.
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-white/66 sm:text-lg">
                    Aqui so entra o que ajuda a agir: onde fechar rapido, onde ampliar area e onde
                    defender receita antes da proxima edicao.
                  </p>
                </div>

                <div className="grid w-full max-w-[760px] gap-4 md:grid-cols-2 xl:ml-auto xl:w-[min(100%,760px)]">
                  <HeroMetricCard
                    label="Expansao imediata"
                    value={String(upgradeCount)}
                    detail="Upgrade de area e visibilidade para capturar receita adicional agora."
                    tone="#79f2b8"
                    share={percentOf(upgradeCount, totalCompanies)}
                  />
                  <HeroMetricCard
                    label="Renovacao saudavel"
                    value={String(renewalCount)}
                    detail="Renovacao com baixa friccao e boa previsibilidade de receita."
                    tone="#7cd0ff"
                    share={percentOf(renewalCount, totalCompanies)}
                  />
                  <HeroMetricCard
                    label="Resgate comercial"
                    value={String(salvageCount)}
                    detail="Conta recuperavel com prova de ROI, trafego e ativacao."
                    tone="#ffd36e"
                    share={percentOf(salvageCount, totalCompanies)}
                  />
                  <HeroMetricCard
                    label="Risco critico"
                    value={String(highChurnCount)}
                    detail="Defesa comercial imediata para nao perder receita recorrente."
                    tone="#ff8a7a"
                    share={percentOf(highChurnCount, totalCompanies)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <ActionQueueCard items={actionQueue} />

            <section className="grid gap-4 md:grid-cols-2">
              {growthCategory ? (
                <FocusCard
                  eyebrow="Categoria com espaco para crescer"
                  title={growthCategory.label}
                  value={`${growthCategory.upgradeCount} conta(s) para expansao`}
                  detail={`Media de Ren.+Up em ${growthCategory.avgExpansion}% e experiencia media de ${growthCategory.avgExperience}/100 dentro do grupo comparavel.`}
                  tone="#79f2b8"
                />
              ) : null}
              {riskCategory ? (
                <FocusCard
                  eyebrow="Categoria sob pressao"
                  title={riskCategory.label}
                  value={`${riskCategory.riskCount} conta(s) em risco`}
                  detail={`Media de churn em ${riskCategory.avgChurn}% e ${riskCategory.riskCount} empresa(s) pedindo defesa ativa na mesma categoria.`}
                  tone="#ff8a7a"
                />
              ) : null}
              <FocusCard
                eyebrow="Pulso da carteira"
                title="Chance media de boa experiencia"
                value={`${Math.round(
                  data.companies.reduce((sum, company) => sum + company.goodExperience.score, 0) /
                    Math.max(totalCompanies, 1),
                )}/100`}
                detail="Leitura media da chance de o expositor sair satisfeito e querer voltar com mais conviccao."
                tone="#ffd36e"
              />
              <FocusCard
                eyebrow="Risco extremo"
                title="Contas que pedem intervencao"
                value={`${criticalChurnCount} empresa(s)`}
                detail="Expositores com risco muito alto dentro da leitura atual e que pedem acao defensiva imediata."
                tone="#ff8a7a"
              />
            </section>
          </section>

          {leadingCompany ? <SpotlightCard company={leadingCompany} onOpen={setSelectedCompanySlug} /> : null}

          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <DistributionCard
              title="Distribuicao operacional da carteira"
              items={[
                {
                  label: `${decisionMeta["upgrade-stand"].label} (${percentOf(upgradeCount, totalCompanies)}%)`,
                  value: upgradeCount,
                  total: totalCompanies,
                  tone: decisionMeta["upgrade-stand"].tone,
                  detail: "Contas para renovacao com venda de area, visibilidade ou pacote premium.",
                },
                {
                  label: `${decisionMeta["renew-stand"].label} (${percentOf(renewalCount, totalCompanies)}%)`,
                  value: renewalCount,
                  total: totalCompanies,
                  tone: decisionMeta["renew-stand"].tone,
                  detail: "Carteira para fechamento rapido, com foco em manter receita e previsibilidade.",
                },
                {
                  label: `${decisionMeta["salvage-account"].label} (${percentOf(salvageCount, totalCompanies)}%)`,
                  value: salvageCount,
                  total: totalCompanies,
                  tone: decisionMeta["salvage-account"].tone,
                  detail: "Empresas que dependem de ativacao, leads e narrativa de ROI para continuar.",
                },
                {
                  label: `${decisionMeta["high-churn-risk"].label} (${percentOf(highChurnCount, totalCompanies)}%)`,
                  value: highChurnCount,
                  total: totalCompanies,
                  tone: decisionMeta["high-churn-risk"].tone,
                  detail: "Contas que pedem diagnostico, reposicionamento e defesa comercial antes do churn.",
                },
              ]}
            />

            <CategoryBoard items={categorySummaries} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="section-label text-white/48">Fila de expansao</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
                    Empresas prontas para ampliar investimento
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                    Aqui ficam as contas com maior chance de gerar receita adicional com menor atrito comercial.
                  </p>
                </div>
                <HeaderChip>{upgradeCount} oportunidade(s) claras</HeaderChip>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {expansionCompanies.map((company) => (
                  <QueueCompanyCard
                    key={company.slug}
                    company={company}
                    label="Expansao"
                    tone="#79f2b8"
                    onOpen={setSelectedCompanySlug}
                  />
                ))}
              </div>
            </section>

            <section className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="section-label text-white/48">Fila defensiva</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
                    Empresas que exigem defesa imediata
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    Lista curta para visita, feedback e correcao antes de perder a conta.
                  </p>
                </div>
                <HeaderChip>{highChurnCount} em risco</HeaderChip>
              </div>

              <div className="mt-6 space-y-4">
                {churnCompanies.map((company) => (
                  <QueueCompanyCard
                    key={company.slug}
                    company={company}
                    label="Risco"
                    tone="#ff8a7a"
                    onOpen={setSelectedCompanySlug}
                  />
                ))}
              </div>
            </section>
          </section>

          <PredictionsTable
            companies={data.companies}
            spotlight={{
              expansion: data.summary.expansionCandidates.map((item) => item.slug),
              churnRisk: data.summary.topChurnRisk.map((item) => item.slug),
            }}
            selectedCompanySlug={selectedCompanySlug}
            onSelectCompany={setSelectedCompanySlug}
          />

          <FooterPanel
            generatedAt={data.generatedAt}
            totalCompanies={totalCompanies}
            mappedBoothsCount={mappedBoothsCount}
          />
        </div>
      </div>

      <CompanyDetailDrawer
        company={selectedCompany}
        open={selectedCompany !== null}
        onClose={() => setSelectedCompanySlug(null)}
      />
    </>
  );
}