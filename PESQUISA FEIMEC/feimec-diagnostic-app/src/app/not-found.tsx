import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return (
    <AppShell>
      <section className="glass-panel noise rounded-[36px] border border-white/10 px-6 py-10 lg:px-10 lg:py-12">
        <p className="section-label text-white/48">tenant não encontrado</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Esta rota não existe no mock multi-tenant.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/64">
          Volte ao portfolio e abra um dos tenants válidos para navegar entre os diagnósticos.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5"
        >
          Voltar ao portfolio
        </Link>
      </section>
    </AppShell>
  );
}