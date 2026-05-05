import Link from "next/link";
import type { ReactNode } from "react";

import {
  formatCurrency,
  portfolioSnapshot,
  tenants,
} from "@/lib/diagnostics-data";

type AppShellProps = {
  activeSlug?: string;
  children: ReactNode;
};

export function AppShell({ activeSlug, children }: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto flex max-w-[1800px] gap-6">
        <aside className="glass-panel noise sticky top-4 hidden h-[calc(100vh-2rem)] w-[320px] shrink-0 overflow-hidden rounded-[32px] border border-white/10 p-5 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                  FF
                </span>
                <div>
                  <p className="section-label text-white/50">FEIMEC command center</p>
                  <h1 className="font-display text-xl font-semibold tracking-tight text-white">
                    Diagnostic OS
                  </h1>
                </div>
              </Link>
              <p className="mt-4 text-sm leading-6 text-white/62">
                Multi-tenant frontend mockado em Next.js para navegar entre os diagnósticos,
                ROI e planos de execução já fechados.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Potencial mensal</p>
                <p className="mt-2 font-display text-3xl font-semibold text-white">
                  {formatCurrency(portfolioSnapshot.totalMonthlyCapture, "compact")}
                </p>
                <p className="mt-2 text-sm text-white/55">3 tenants, 1 narrativa de captura de margem.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Investimento 90d</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(portfolioSnapshot.totalInvestment90d, "compact")}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Retorno base</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(portfolioSnapshot.totalBaseReturn90d, "compact")}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-3">
              <p className="section-label text-white/45">Tenants</p>
              {tenants.map((tenant) => {
                const isActive = tenant.slug === activeSlug;

                return (
                  <Link
                    key={tenant.slug}
                    href={`/tenant/${tenant.slug}`}
                    className={`group block rounded-[24px] border px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5 ${
                      isActive
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.05]"
                    }`}
                    style={
                      isActive
                        ? {
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${tenant.colors.accent}22`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/45">
                          {tenant.category}
                        </p>
                        <h2 className="mt-2 font-display text-xl font-semibold text-white">
                          {tenant.shortName}
                        </h2>
                      </div>
                      <span
                        className="rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em]"
                        style={{
                          borderColor: `${tenant.colors.accent}55`,
                          color: tenant.colors.accent,
                          backgroundColor: `${tenant.colors.accent}14`,
                        }}
                      >
                        {tenant.booth}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/58">{tenant.headline}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/38">
                          Run-rate mensal
                        </p>
                        <p className="mt-1 text-base font-semibold text-white">
                          {formatCurrency(tenant.monthlyCapture, "compact")}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-white/55">
                        Confiança {tenant.confidence}%
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55">
            Frontend-only. Todos os resultados estão mockados no front para demo de feira,
            discovery comercial e fechamento consultivo.
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="glass-panel noise overflow-x-auto rounded-[28px] border border-white/10 px-4 py-3 lg:hidden">
            <div className="flex min-w-max items-center gap-3">
              <Link
                href="/"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !activeSlug ? "bg-white text-black" : "bg-white/8 text-white/70"
                }`}
              >
                Portfolio
              </Link>
              {tenants.map((tenant) => {
                const isActive = tenant.slug === activeSlug;

                return (
                  <Link
                    key={tenant.slug}
                    href={`/tenant/${tenant.slug}`}
                    className="rounded-full border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: isActive ? `${tenant.colors.accent}66` : "rgba(255,255,255,0.12)",
                      backgroundColor: isActive ? `${tenant.colors.accent}18` : "rgba(255,255,255,0.04)",
                      color: isActive ? tenant.colors.accent : "rgba(255,255,255,0.72)",
                    }}
                  >
                    {tenant.shortName}
                  </Link>
                );
              })}
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}