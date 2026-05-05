import Link from "next/link";
import type { CSSProperties } from "react";

import {
  formatCurrency,
  getNextTenantSlug,
  type Tenant,
} from "@/lib/diagnostics-data";

type TenantDashboardProps = {
  tenant: Tenant;
};

export function TenantDashboard({ tenant }: TenantDashboardProps) {
  const nextSlug = getNextTenantSlug(tenant.slug);
  const maxLoss = Math.max(...tenant.losses.map((loss) => loss.amount));
  const baseScenario = tenant.scenarios[1];
  const aggressiveScenario = tenant.scenarios[2];
  const tenantAccentStyle = {
    boxShadow: `0 0 0 1px ${tenant.colors.accent}1c, 0 22px 80px rgba(0,0,0,0.28)`,
  } satisfies CSSProperties;

  return (
    <div className="space-y-6">
      <section
        className="glass-panel noise relative overflow-hidden rounded-[36px] border border-white/10 px-6 py-8 lg:px-10 lg:py-10"
        style={tenantAccentStyle}
      >
        <div
          className="absolute -right-12 top-0 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: tenant.colors.halo }}
        />
        <div
          className="absolute bottom-0 left-0 h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: `${tenant.colors.secondary}22` }}
        />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/74 transition hover:bg-white/[0.08]"
              >
                Portfolio
              </Link>
              <span
                className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]"
                style={{
                  borderColor: `${tenant.colors.accent}55`,
                  backgroundColor: `${tenant.colors.accent}12`,
                  color: tenant.colors.accent,
                }}
              >
                {tenant.booth}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/54">
                frontend mockado
              </span>
            </div>

            <p className="section-label mt-6 text-white/46">{tenant.category}</p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {tenant.name}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/66 sm:text-lg">
              {tenant.summary}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {tenant.fairBullets.map((bullet) => (
                <div key={bullet} className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                  <div
                    className="h-2 w-10 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${tenant.colors.accent}, ${tenant.colors.secondary})`,
                    }}
                  />
                  <p className="mt-3 text-sm leading-6 text-white/66">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
            <MetricCard
              label="Potencial mensal"
              value={formatCurrency(tenant.monthlyCapture, "compact")}
              helper="run-rate capturável"
            />
            <MetricCard
              label="Investimento 90d"
              value={formatCurrency(tenant.investment90d, "compact")}
              helper="ticket fechado"
            />
            <MetricCard
              label="Retorno base"
              value={formatCurrency(baseScenario.return90d, "compact")}
              helper={`${baseScenario.roi} em 90 dias`}
            />
            <MetricCard
              label="Cenário agressivo"
              value={aggressiveScenario.roi}
              helper={formatCurrency(aggressiveScenario.return90d, "compact")}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
        <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label text-white/45">Loss map already filled</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                Mapa de perdas pronto, com caixa visível por alavanca.
              </h2>
            </div>
            <p className="text-sm text-white/52">North star: {tenant.northStar}</p>
          </div>

          <div className="mt-8 space-y-4">
            {tenant.losses.map((loss) => {
              const width = `${Math.max((loss.amount / maxLoss) * 100, 12)}%`;

              return (
                <div
                  key={loss.title}
                  className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/42">
                        {loss.title}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/66">{loss.statement}</p>
                      <p className="mt-4 text-sm font-medium text-white">
                        Ação já mockada: <span className="text-white/72">{loss.action}</span>
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">Impacto mensal</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-white">
                        {formatCurrency(loss.amount, "compact")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 metric-track">
                    <div
                      className="metric-fill"
                      style={{
                        width,
                        background: `linear-gradient(90deg, ${tenant.colors.accent}, ${tenant.colors.secondary})`,
                        boxShadow: `0 0 28px ${tenant.colors.accent}55`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
            <p className="section-label text-white/45">Decision math</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
              A conta já está pronta para diretoria.
            </h2>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Investimento travado</p>
              <p className="mt-3 font-display text-4xl font-semibold text-white">
                {formatCurrency(tenant.investment90d, "compact")}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/58">{tenant.cfoSummary}</p>
            </div>

            <div className="mt-5 space-y-3">
              {tenant.scenarios.map((scenario) => (
                <div
                  key={scenario.label}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/40">
                        {scenario.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatCurrency(scenario.return90d, "compact")}
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{
                        borderColor: `${tenant.colors.accent}55`,
                        backgroundColor: `${tenant.colors.accent}12`,
                        color: tenant.colors.accent,
                      }}
                    >
                      {scenario.roi}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/58">{scenario.capture}</p>
                  <p className="mt-2 text-sm leading-6 text-white/64">{scenario.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
            <p className="section-label text-white/45">Scoreboard</p>
            <div className="mt-5 space-y-4">
              {tenant.scores.map((score) => (
                <div key={score.label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{score.label}</p>
                    <p className="text-sm text-white/58">{score.value}/10</p>
                  </div>
                  <div className="mt-2 metric-track">
                    <div
                      className="metric-fill"
                      style={{
                        width: `${(score.value / 10) * 100}%`,
                        background: `linear-gradient(90deg, ${tenant.colors.accent}, ${tenant.colors.secondary})`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{score.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="section-label text-white/45">Quick wins command board</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                O que muda agora, quem toca e quanto volta por mês.
              </h2>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {tenant.quickWins.map((quickWin, index) => (
              <div
                key={quickWin.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                      Quick win {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{quickWin.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/62">{quickWin.proof}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Impacto mensal</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-white">
                      {formatCurrency(quickWin.impact, "compact")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <MiniField label="Owner" value={quickWin.owner} />
                  <MiniField label="Meta" value={quickWin.target} />
                  <MiniField label="ETA" value={quickWin.eta} />
                  <MiniField label="Risco" value={quickWin.risk} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
          <p className="section-label text-white/45">What the mock says</p>
          <div className="mt-4 space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Visão operação</p>
              <p className="mt-3 text-sm leading-7 text-white/66">{tenant.operatorSummary}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Fechamento de feira</p>
              <p className="mt-3 text-xl leading-8 text-white">“{tenant.fairClose}”</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">UI highlights</p>
              <div className="mt-4 space-y-3">
                {tenant.uiHighlights.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span
                      className="mt-2 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tenant.colors.accent }}
                    />
                    <p className="text-sm leading-6 text-white/66">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel scanline command-grid relative overflow-hidden rounded-[36px] border border-white/10 px-6 py-8 lg:px-8 lg:py-8">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${tenant.colors.accent}, transparent)`,
          }}
        />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <p className="section-label text-white/45">Mocked control surface</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
              Front-end pronto para demo, pitch e navegação entre contas.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/66">
              Este bloco não depende de backend. Tudo que aparece aqui já está desenhado para
              parecer produto operando: loss map, command board, cenários e resumo executivo.
            </p>
          </div>

          <Link
            href={`/tenant/${nextSlug}`}
            className="inline-flex items-center rounded-full border border-white/14 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Abrir próximo tenant
          </Link>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Pulse</p>
              <p className="mt-3 font-display text-4xl font-semibold text-white">
                {formatCurrency(tenant.monthlyCapture, "compact")}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/58">Potencial mensal já mockado no tenant.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Money shot</p>
              <p className="mt-3 text-sm leading-7 text-white/66">{tenant.cfoSummary}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">Live board mock</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                  {tenant.shortName} command surface
                </h3>
              </div>
              <span
                className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
                style={{
                  borderColor: `${tenant.colors.secondary}55`,
                  color: tenant.colors.secondary,
                  backgroundColor: `${tenant.colors.secondary}14`,
                }}
              >
                operator + cfo mode
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4">
                {tenant.losses.map((loss) => (
                  <div key={loss.title} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white/82">{loss.title}</p>
                      <p className="text-sm text-white">{formatCurrency(loss.amount, "compact")}</p>
                    </div>
                    <div className="mt-3 metric-track">
                      <div
                        className="metric-fill"
                        style={{
                          width: `${Math.max((loss.amount / maxLoss) * 100, 12)}%`,
                          background: `linear-gradient(90deg, ${tenant.colors.accent}, ${tenant.colors.secondary})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">Action queue</p>
                <div className="mt-4 space-y-3">
                  {tenant.quickWins.map((quickWin, index) => (
                    <div
                      key={quickWin.title}
                      className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1.2fr_0.7fr_0.5fr]"
                    >
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
                          Frente {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">{quickWin.title}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Owner</p>
                        <p className="mt-1 text-sm text-white/70">{quickWin.owner}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Impacto</p>
                        <p className="mt-1 text-sm text-white">{formatCurrency(quickWin.impact, "compact")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
          <p className="section-label text-white/45">Execution ladder</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
            Timeline já amarrada para vender diagnóstico, piloto e escala.
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {tenant.milestones.map((milestone) => (
              <div key={milestone.label} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">{milestone.window}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{milestone.label}</h3>
                <p className="mt-3 text-sm font-medium text-white/78">{milestone.focus}</p>
                <div className="mt-4 space-y-3">
                  {milestone.outcomes.map((outcome) => (
                    <div key={outcome} className="flex gap-3">
                      <span
                        className="mt-2 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: tenant.colors.secondary }}
                      />
                      <p className="text-sm leading-6 text-white/64">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] border border-white/10 p-6 lg:p-8">
          <p className="section-label text-white/45">Fair close</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
            O texto que entra no estande já sai com dinheiro na mesa.
          </h2>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-lg leading-8 text-white">“{tenant.fairClose}”</p>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-white/64">
            <p>
              O app foi desenhado para parecer uma solução já operando. Você troca o tenant,
              mantém a arquitetura e muda apenas o conteúdo econômico-operacional.
            </p>
            <p>
              Isso deixa a demo forte o suficiente para discovery, proposta e exploração de
              value ladder sem precisar improvisar no pitch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
};

function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-white/58">{helper}</p>
    </div>
  );
}

type MiniFieldProps = {
  label: string;
  value: string;
};

function MiniField({ label, value }: MiniFieldProps) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/38">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/72">{value}</p>
    </div>
  );
}