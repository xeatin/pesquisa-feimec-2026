import Link from "next/link";

import {
  formatCurrency,
  portfolioSnapshot,
  tenants,
} from "@/lib/diagnostics-data";

const platformLayers = [
  {
    title: "Loss map pronto",
    body: "Cada tenant já nasce com perdas priorizadas, valor mensal em R$ e norte operacional definido.",
  },
  {
    title: "Decision math fechado",
    body: "O front já mostra investimento, retorno em 90 dias, cenários e frase de fechamento para CFO.",
  },
  {
    title: "Command board mockado",
    body: "Operação vê quick wins, dono, meta, ETA e prova de impacto sem depender de backend.",
  },
];

export function PortfolioOverview() {
  return (
    <div className="space-y-6">
      <section className="glass-panel noise relative overflow-hidden rounded-[36px] border border-white/10 px-6 py-8 lg:px-10 lg:py-10">
        <div className="absolute -left-16 top-0 h-52 w-52 rounded-full bg-[#22A6F2]/20 blur-3xl" />
        <div className="absolute -right-10 top-8 h-64 w-64 rounded-full bg-[#FF7A1A]/20 blur-3xl" />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="section-label text-white/50">FEIMEC multi-tenant diagnostic app</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Navegue entre diagnósticos como se já estivéssemos operando dentro de cada conta.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
              Este app é um cockpit comercial: ROMI, Paletrans e Combustol já entram com
              mapa de perdas pronto, ROI travado e uma camada visual desenhada para demo de
              feira, discovery e fechamento consultivo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/tenant/${tenants[0].slug}`}
                className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
              >
                Abrir tenant inicial
              </Link>
              <a
                href="#tenants"
                className="inline-flex items-center rounded-full border border-white/14 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/[0.08]"
              >
                Ver todos os tenants
              </a>
            </div>
          </div>

          <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Potencial mensal</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                {formatCurrency(portfolioSnapshot.totalMonthlyCapture, "compact")}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Investimento 90d</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                {formatCurrency(portfolioSnapshot.totalInvestment90d, "compact")}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Retorno base</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                {formatCurrency(portfolioSnapshot.totalBaseReturn90d, "compact")}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Modo demo</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                100% mockado
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel noise rounded-[32px] border border-white/10 p-6 lg:p-8">
          <p className="section-label text-white/48">Por que este app fecha conversa</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
            O front já nasce com números duros, narrativa curta e navegação entre contas.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {platformLayers.map((layer) => (
              <div
                key={layer.title}
                className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                  {layer.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/64">{layer.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel command-grid rounded-[32px] border border-white/10 p-6 lg:p-8">
          <p className="section-label text-white/48">Mock visual stack</p>
          <div className="mt-4 space-y-5">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/70">Tenant switcher</p>
                <span className="rounded-full border border-[#22A6F2]/40 bg-[#22A6F2]/14 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#7CD0FF]">
                  multi-tenant
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tenants.map((tenant) => (
                  <span
                    key={tenant.slug}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderColor: `${tenant.colors.accent}55`,
                      backgroundColor: `${tenant.colors.accent}12`,
                      color: tenant.colors.accent,
                    }}
                  >
                    {tenant.shortName}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Painel CFO</p>
                <p className="mt-3 text-2xl font-semibold text-white">ROI em 1 dobra</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Painel operação</p>
                <p className="mt-3 text-2xl font-semibold text-white">Quick wins já prontos</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/64">
              O que você mostra na feira não é um wireframe vazio. É uma narrativa inteira já
              aterrissada em dados, perdas, cenários e decisão financeira.
            </div>
          </div>
        </div>
      </section>

      <section id="tenants" className="grid gap-6 xl:grid-cols-3">
        {tenants.map((tenant) => (
          <article
            key={tenant.slug}
            className="glass-panel noise overflow-hidden rounded-[32px] border border-white/10 p-6"
          >
            <div
              className="h-1.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${tenant.colors.accent}, ${tenant.colors.secondary})`,
              }}
            />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">{tenant.category}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                  {tenant.shortName}
                </h3>
              </div>
              <span
                className="rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em]"
                style={{
                  borderColor: `${tenant.colors.accent}55`,
                  backgroundColor: `${tenant.colors.accent}12`,
                  color: tenant.colors.accent,
                }}
              >
                {tenant.booth}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/64">{tenant.headline}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/38">Run-rate</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(tenant.monthlyCapture, "compact")}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/38">Investimento 90d</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(tenant.investment90d, "compact")}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {tenant.fairBullets.map((bullet) => (
                <div key={bullet} className="flex gap-3 rounded-[18px] bg-white/[0.03] px-3 py-2.5">
                  <span
                    className="mt-1 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tenant.colors.accent }}
                  />
                  <p className="text-sm leading-6 text-white/66">{bullet}</p>
                </div>
              ))}
            </div>

            <Link
              href={`/tenant/${tenant.slug}`}
              className="mt-6 inline-flex items-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
            >
              Abrir tenant
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}