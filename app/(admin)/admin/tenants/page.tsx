"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Building2,
  Search,
  Loader2,
  Users,
  Package,
  MapPin,
  ArrowRightLeft,
  ExternalLink,
  CreditCard,
} from "lucide-react";

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string;
  payment_provider: string | null;
  created_at: string;
}

interface TenantMetrics {
  user_count: number;
  product_count: number;
  location_count: number;
  movement_count: number;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, TenantMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: tenantsData, error: tenantsErr } = await supabase
          .from("tenants")
          .select("id, name, slug, plan, subscription_status, payment_provider, created_at")
          .order("created_at", { ascending: false });

        if (tenantsErr) throw tenantsErr;
        if (!cancelled) setTenants((tenantsData || []) as TenantRow[]);

        const ids: string[] = (tenantsData || []).map((t: TenantRow) => t.id);
        if (ids.length > 0) {
          const [usersRes, productsRes, locationsRes, movementsRes] = await Promise.all([
            supabase.from("profiles").select("tenant_id"),
            supabase.from("products").select("tenant_id"),
            supabase.from("locations").select("tenant_id"),
            supabase.from("movements").select("tenant_id"),
          ]);

          const counts: Record<string, TenantMetrics> = {};
          ids.forEach((id) => {
            counts[id] = { user_count: 0, product_count: 0, location_count: 0, movement_count: 0 };
          });

          (usersRes.data || []).forEach((r: { tenant_id: string }) => {
            if (counts[r.tenant_id]) counts[r.tenant_id].user_count++;
          });
          (productsRes.data || []).forEach((r: { tenant_id: string }) => {
            if (counts[r.tenant_id]) counts[r.tenant_id].product_count++;
          });
          (locationsRes.data || []).forEach((r: { tenant_id: string }) => {
            if (counts[r.tenant_id]) counts[r.tenant_id].location_count++;
          });
          (movementsRes.data || []).forEach((r: { tenant_id: string }) => {
            if (counts[r.tenant_id]) counts[r.tenant_id].movement_count++;
          });

          if (!cancelled) setMetricsMap(counts);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar empresas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const planColors: Record<string, "gray" | "blue" | "green" | "yellow"> = {
    free: "gray",
    starter: "blue",
    pro: "green",
    enterprise: "yellow",
  };

  const statusColors: Record<string, "green" | "blue" | "yellow" | "red" | "gray"> = {
    active: "green",
    trialing: "blue",
    past_due: "yellow",
    canceled: "red",
    incomplete: "gray",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Empresas</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? "Carregando..." : `${tenants.length} empresas cadastradas`}
        </p>
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-white placeholder:text-gray-500 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">
                <Users className="h-3.5 w-3.5 inline mr-1" />
                Users
              </TableHead>
              <TableHead className="text-center">
                <Package className="h-3.5 w-3.5 inline mr-1" />
                Produtos
              </TableHead>
              <TableHead className="text-center">
                <MapPin className="h-3.5 w-3.5 inline mr-1" />
                Locais
              </TableHead>
              <TableHead className="text-center">
                <ArrowRightLeft className="h-3.5 w-3.5 inline mr-1" />
                Movs
              </TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Criada em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  Nenhuma empresa encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => {
                const m = metricsMap[t.id] || { user_count: 0, product_count: 0, location_count: 0, movement_count: 0 };
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TechBadge variant={planColors[t.plan] || "gray"}>
                        {t.plan?.toUpperCase()}
                      </TechBadge>
                    </TableCell>
                    <TableCell>
                      <TechBadge variant={statusColors[t.subscription_status] || "gray"}>
                        {t.subscription_status?.toUpperCase() || "UNKNOWN"}
                      </TechBadge>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-gray-300">
                      {m.user_count}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-gray-300">
                      {m.product_count}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-gray-300">
                      {m.location_count}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-gray-300">
                      {m.movement_count}
                    </TableCell>
                    <TableCell>
                      {t.payment_provider ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {t.payment_provider}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
