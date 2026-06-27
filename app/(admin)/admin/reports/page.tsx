"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  Loader2,
  TrendingUp,
  Package,
  ArrowRightLeft,
  MapPin,
} from "lucide-react";

interface TenantActivity {
  tenant_id: string;
  tenant_name: string;
  movement_count: number;
  product_count: number;
  location_count: number;
}

interface MovementByType {
  type: string;
  count: number;
}

interface RecentMovement {
  id: string;
  tenant_name: string;
  user_name: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  created_at: string;
}

export default function AdminReportsPage() {
  const [tenantActivity, setTenantActivity] = useState<TenantActivity[]>([]);
  const [movementsByType, setMovementsByType] = useState<MovementByType[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const [tenantsRes, productsRes, locationsRes, movementsRes] = await Promise.all([
          supabase.from("tenants").select("id, name"),
          supabase.from("products").select("id, tenant_id"),
          supabase.from("locations").select("id, tenant_id"),
          supabase
            .from("movements")
            .select("id, tenant_id, type, quantity, created_at, user_id, product_id"),
        ]);

        if (tenantsRes.error) throw tenantsRes.error;
        if (productsRes.error) throw productsRes.error;
        if (locationsRes.error) throw locationsRes.error;
        if (movementsRes.error) throw movementsRes.error;

        const tenants = (tenantsRes.data || []) as { id: string; name: string }[];
        const products = (productsRes.data || []) as { id: string; tenant_id: string }[];
        const locations = (locationsRes.data || []) as { id: string; tenant_id: string }[];
        const movements = (movementsRes.data || []) as {
          id: string; tenant_id: string; type: string; quantity: number; created_at: string;
          user_id: string; product_id: string;
        }[];

        const tenantMap: Record<string, string> = {};
        tenants.forEach((t) => { tenantMap[t.id] = t.name; });

        const activity: Record<string, TenantActivity> = {};
        tenants.forEach((t) => {
          activity[t.id] = {
            tenant_id: t.id,
            tenant_name: t.name,
            movement_count: 0,
            product_count: 0,
            location_count: 0,
          };
        });

        products.forEach((p) => {
          if (activity[p.tenant_id]) activity[p.tenant_id].product_count++;
        });
        locations.forEach((l) => {
          if (activity[l.tenant_id]) activity[l.tenant_id].location_count++;
        });
        movements.forEach((m) => {
          if (activity[m.tenant_id]) activity[m.tenant_id].movement_count++;
        });

        const sorted = Object.values(activity).sort((a, b) => b.movement_count - a.movement_count);

        const typeCounts: Record<string, number> = {};
        movements.forEach((m) => {
          typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
        });
        const byType = Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        const profilesRes = await supabase.from("profiles").select("id, name");
        const productsAllRes = await supabase.from("products").select("id, name");
        const profileMap: Record<string, string> = {};
        const productMap: Record<string, string> = {};
        (profilesRes.data || []).forEach((p: { id: string; name: string }) => {
          profileMap[p.id] = p.name;
        });
        (productsAllRes.data || []).forEach((p: { id: string; name: string }) => {
          productMap[p.id] = p.name;
        });

        const recent = movements
          .slice(0, 20)
          .map((m) => ({
            id: m.id,
            tenant_name: tenantMap[m.tenant_id] || "-",
            user_name: profileMap[m.user_id] || "-",
            product_name: productMap[m.product_id] || "-",
            movement_type: m.type,
            quantity: m.quantity,
            created_at: m.created_at,
          }));

        if (!cancelled) {
          setTenantActivity(sorted);
          setMovementsByType(byType);
          setRecentMovements(recent);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar relatorios");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[4px] border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    in: "Entrada",
    out: "Saida",
    transfer: "Transferencia",
    adjustment: "Ajuste",
    count: "Contagem",
  };

  const totalMovements = movementsByType.reduce((s, m) => s + m.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Relatorios</h1>
        <p className="text-sm text-gray-500 mt-1">Uso do sistema por empresa</p>
      </div>

      {/* Movements by type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Movimentacoes por Tipo</h2>
          </div>
          <div className="space-y-3">
            {movementsByType.map((m) => {
              const pct = totalMovements > 0 ? (m.count / totalMovements) * 100 : 0;
              return (
                <div key={m.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{typeLabels[m.type] || m.type}</span>
                    <span className="text-sm text-gray-400">{m.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top tenants by activity */}
        <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Empresas Mais Ativas</h2>
          </div>
          <div className="space-y-3">
            {tenantActivity.slice(0, 5).map((t, i) => {
              const maxMov = tenantActivity[0]?.movement_count || 1;
              const pct = (t.movement_count / maxMov) * 100;
              return (
                <div key={t.tenant_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">
                      <span className="text-gray-500 mr-2">#{i + 1}</span>
                      {t.tenant_name}
                    </span>
                    <span className="text-sm text-gray-400">{t.movement_count} movs</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tenant summary table */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Resumo por Empresa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-2 text-gray-400 font-medium">Empresa</th>
                <th className="text-right py-2 text-gray-400 font-medium">Produtos</th>
                <th className="text-right py-2 text-gray-400 font-medium">Locais</th>
                <th className="text-right py-2 text-gray-400 font-medium">Movimentacoes</th>
              </tr>
            </thead>
            <tbody>
              {tenantActivity.map((t) => (
                <tr key={t.tenant_id} className="border-b border-border-default last:border-0">
                  <td className="py-2 text-white">{t.tenant_name}</td>
                  <td className="py-2 text-right text-gray-300 font-mono">{t.product_count}</td>
                  <td className="py-2 text-right text-gray-300 font-mono">{t.location_count}</td>
                  <td className="py-2 text-right text-gray-300 font-mono">{t.movement_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent movements */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Movimentacoes Recentes</h2>
        <div className="space-y-2">
          {recentMovements.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma movimentacao registrada</p>
          ) : (
            recentMovements.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">
                    {m.created_at ? new Date(m.created_at).toLocaleDateString("pt-BR") : "-"}
                  </span>
                  <div>
                    <p className="text-sm text-white">{m.product_name}</p>
                    <p className="text-xs text-gray-500">
                      {m.tenant_name} · {m.user_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${
                    m.movement_type === "in" ? "text-green-400" :
                    m.movement_type === "out" ? "text-red-400" :
                    "text-gray-400"
                  }`}>
                    {typeLabels[m.movement_type] || m.movement_type}
                  </span>
                  <p className="text-xs text-gray-500">qtd: {m.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
