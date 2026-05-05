import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { TenantDashboard } from "@/components/tenant-dashboard";
import { getTenantBySlug, tenants } from "@/lib/diagnostics-data";

export async function generateStaticParams() {
  return tenants.map((tenant) => ({ slug: tenant.slug }));
}

export default async function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  return (
    <AppShell activeSlug={tenant.slug}>
      <TenantDashboard tenant={tenant} />
    </AppShell>
  );
}