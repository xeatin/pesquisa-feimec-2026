"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";

import {
  churnBandMeta,
  classMeta,
  decisionMeta,
  formatPercent,
  type CompanyPrediction,
  type DecisionKey,
} from "@/lib/feimec-predictions";

type PredictionsTableProps = {
  companies: CompanyPrediction[];
  spotlight: {
    expansion: string[];
    churnRisk: string[];
  };
  selectedCompanySlug: string | null;
  onSelectCompany: (slug: string) => void;
};

const decisionFilters: Array<{ value: "all" | DecisionKey; label: string }> = [
  { value: "all", label: "Todos os movimentos" },
  { value: "upgrade-stand", label: "Expandir" },
  { value: "renew-stand", label: "Renovar" },
  { value: "salvage-account", label: "Recuperar" },
  { value: "high-churn-risk", label: "Risco de saida" },
];

const classFilters = ["all", "A", "B", "C", "D"] as const;

function ProbabilityBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="metric-track mt-2 h-2.5">
      <div className="metric-fill" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function isOpenKey(key: string) {
  return key === "Enter" || key === " ";
}

export function PredictionsTable({
  companies,
  spotlight,
  selectedCompanySlug,
  onSelectCompany,
}: PredictionsTableProps) {
  const [query, setQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<(typeof decisionFilters)[number]["value"]>("all");
  const [classFilter, setClassFilter] = useState<(typeof classFilters)[number]>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const expansionSet = useMemo(() => new Set(spotlight.expansion), [spotlight.expansion]);
  const churnSet = useMemo(() => new Set(spotlight.churnRisk), [spotlight.churnRisk]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(companies.map((company) => company.segmentation.categoryLabel))).sort(
      (left, right) => left.localeCompare(right, "pt-BR"),
    );

    return ["all", ...categories];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const searchableContent = [
        company.name,
        company.actionLabel,
        company.mainReason,
        company.nextActionShort,
        company.nextBestAction,
        company.segmentation.categoryLabel,
        company.profile.boothLabel,
        company.profile.summary80_20 ?? "",
        company.profile.services.join(" "),
        company.profile.pains.join(" "),
        company.insights.join(" "),
        company.goodExperience.explanation,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = deferredQuery.length === 0 || searchableContent.includes(deferredQuery);
      const matchesDecision = decisionFilter === "all" || company.decision === decisionFilter;
      const matchesClass = classFilter === "all" || company.class === classFilter;
      const matchesCategory = categoryFilter === "all" || company.segmentation.categoryLabel === categoryFilter;

      return matchesQuery && matchesDecision && matchesClass && matchesCategory;
    });
  }, [categoryFilter, classFilter, companies, decisionFilter, deferredQuery]);

  return (
    <section className="glass-panel noise rounded-[32px] border border-white/10 p-5 lg:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-label text-white/48">Leitura detalhada da carteira</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            Empresas para revisar e agir
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
            Filtre a carteira, localize um expositor e abra a conta quando precisar sustentar uma
            conversa comercial com mais contexto.
          </p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/64">
          {filteredCompanies.length} empresa(s) na tela
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-[1.45fr_1fr_1fr_1fr]">
        <label className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">Busca rapida</p>
          <input
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => setQuery(nextValue));
            }}
            placeholder="Empresa, stand, categoria ou motivo"
            className="mt-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28"
          />
        </label>

        <label className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">Movimento</p>
          <select
            value={decisionFilter}
            onChange={(event) =>
              setDecisionFilter(event.target.value as (typeof decisionFilters)[number]["value"])
            }
            className="mt-3 w-full bg-transparent text-sm text-white outline-none"
          >
            {decisionFilters.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#08111d]">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">Classe</p>
          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value as (typeof classFilters)[number])}
            className="mt-3 w-full bg-transparent text-sm text-white outline-none"
          >
            {classFilters.map((option) => (
              <option key={option} value={option} className="bg-[#08111d]">
                {option === "all" ? "Todas as classes" : `Classe ${option}`}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/42">Categoria</p>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="mt-3 w-full bg-transparent text-sm text-white outline-none"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option} className="bg-[#08111d]">
                {option === "all" ? "Todas as categorias" : option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-4 lg:hidden">
        {filteredCompanies.map((company) => {
          const classTone = classMeta[company.class];
          const decisionTone = decisionMeta[company.decision];
          const churnTone = churnBandMeta[company.predictions.churnBand];
          const isExpansion = expansionSet.has(company.slug);
          const isTopChurn = churnSet.has(company.slug);
          const isSelected = selectedCompanySlug === company.slug;

          return (
            <button
              key={company.slug}
              type="button"
              onClick={() => onSelectCompany(company.slug)}
              className={`w-full rounded-[28px] border p-4 text-left transition ${
                isSelected
                  ? "border-[#7cd0ff]/55 bg-white/[0.08]"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
                      style={{ borderColor: `${classTone.tone}55`, color: classTone.tone }}
                    >
                      {classTone.label}
                    </span>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
                      style={{
                        borderColor: `${decisionTone.tone}55`,
                        color: decisionTone.tone,
                        backgroundColor: decisionTone.surface,
                      }}
                    >
                      {decisionTone.label}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/58">
                      {company.profile.boothLabel || "Stand nao informado"}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white">{company.name}</h3>
                  <p className="mt-2 text-sm text-white/56">{company.segmentation.categoryLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-white/38">Score</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{company.score}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-white/45">
                {company.source.hasCompanyFile ? <span>Analise detalhada</span> : null}
                {isExpansion ? <span>Prioridade de expansao</span> : null}
                {isTopChurn ? <span>Risco imediato</span> : null}
              </div>

              <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/42">Motivo principal</p>
                <p className="mt-2 text-sm leading-6 text-white/76">{company.mainReason}</p>
                <p className="mt-3 text-sm font-semibold text-[#79f2b8]">{company.nextActionShort}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/42">Ren.+Up</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatPercent(company.predictions.renewAndUpgradeProbability)}
                  </p>
                  <ProbabilityBar value={company.predictions.renewAndUpgradeProbability} color="#79f2b8" />
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/42">Experiencia</p>
                  <p className="mt-2 text-xl font-semibold text-white">{company.goodExperience.score}/100</p>
                  <p className="mt-2 text-xs leading-5 text-white/58">{company.goodExperience.whyBelieve[0]}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/42">Churn</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatPercent(company.predictions.churnProbability)}
                  </p>
                  <ProbabilityBar value={company.predictions.churnProbability} color={churnTone.tone} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-[28px] border border-white/10 lg:block">
        <div className="max-h-[920px] overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-[#09111dcc] backdrop-blur">
              <tr className="border-b border-white/10 text-left text-[0.68rem] uppercase tracking-[0.22em] text-white/44">
                <th className="px-4 py-4 font-semibold">Empresa</th>
                <th className="px-4 py-4 font-semibold">Categoria</th>
                <th className="px-4 py-4 font-semibold">Stand</th>
                <th className="px-4 py-4 font-semibold">Proxima acao</th>
                <th className="px-4 py-4 font-semibold">Expansao</th>
                <th className="px-4 py-4 font-semibold">Experiencia</th>
                <th className="px-4 py-4 font-semibold">Churn</th>
                <th className="px-4 py-4 font-semibold">Movimento</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => {
                const classTone = classMeta[company.class];
                const decisionTone = decisionMeta[company.decision];
                const churnTone = churnBandMeta[company.predictions.churnBand];
                const isExpansion = expansionSet.has(company.slug);
                const isTopChurn = churnSet.has(company.slug);
                const isSelected = selectedCompanySlug === company.slug;

                return (
                  <tr
                    key={company.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectCompany(company.slug)}
                    onKeyDown={(event) => {
                      if (isOpenKey(event.key)) {
                        event.preventDefault();
                        onSelectCompany(company.slug);
                      }
                    }}
                    className={`border-b border-white/6 align-top transition focus:outline-none ${
                      isSelected
                        ? "bg-white/[0.08]"
                        : "cursor-pointer hover:bg-white/[0.03] focus:bg-white/[0.04]"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="max-w-[280px]">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em]"
                            style={{ borderColor: `${classTone.tone}55`, color: classTone.tone }}
                          >
                            {classTone.label}
                          </span>
                          {company.source.hasCompanyFile ? (
                            <span className="rounded-full border border-white/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/52">
                              Dossie individual
                            </span>
                          ) : null}
                          {isExpansion ? (
                            <span className="rounded-full border border-[#79f2b8]/45 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#79f2b8]">
                              Prioridade de expansao
                            </span>
                          ) : null}
                          {isTopChurn ? (
                            <span className="rounded-full border border-[#ff8a7a]/45 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ff8a7a]">
                              Risco imediato
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-3 font-display text-xl font-semibold text-white">{company.name}</h3>
                        <p className="mt-2 text-sm text-white/56">{company.mainReason}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-[170px]">
                        <p className="text-sm font-semibold text-white">{company.segmentation.categoryLabel}</p>
                        <p className="mt-2 text-xs leading-5 text-white/52">
                          {company.segmentation.directCompetitorsCount} concorrentes diretos
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm font-semibold text-white/74">
                        {company.profile.boothLabel || "Stand nao informado"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-[220px]">
                        <p className="clamp-2 text-sm leading-6 text-white/76">{company.mainReason}</p>
                        <p className="mt-3 text-sm font-semibold text-[#79f2b8]">{company.nextActionShort}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-[150px]">
                        <p className="text-xl font-semibold text-white">
                          {formatPercent(company.predictions.renewAndUpgradeProbability)}
                        </p>
                        <ProbabilityBar value={company.predictions.renewAndUpgradeProbability} color="#79f2b8" />
                        <div className="mt-2 flex items-center justify-between text-xs text-white/48">
                          <span>Ren {formatPercent(company.predictions.buyStandAgainProbability)}</span>
                          <span>Up {formatPercent(company.predictions.buyBetterStandProbability)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-[180px]">
                        <p className="text-xl font-semibold text-white">{company.goodExperience.score}/100</p>
                        <p className="mt-2 clamp-2 text-xs leading-5 text-white/56">
                          {company.goodExperience.explanation}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-white">
                            {formatPercent(company.predictions.churnProbability)}
                          </p>
                          <span className="text-sm" style={{ color: churnTone.tone }}>
                            {churnTone.label}
                          </span>
                        </div>
                        <ProbabilityBar value={company.predictions.churnProbability} color={churnTone.tone} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em]"
                        style={{
                          borderColor: `${decisionTone.tone}55`,
                          backgroundColor: decisionTone.surface,
                          color: decisionTone.tone,
                        }}
                      >
                        {decisionTone.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}