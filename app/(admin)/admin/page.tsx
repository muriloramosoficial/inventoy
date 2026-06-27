"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Building2,
  Package,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
} from "lucide-react";

interface AdminMetrics {
  total_tenants: number;
  total_users: number;
  total_products: number;
  total_movements: number;
  active_tenants: number;
  trial_tenants: number;
  tenants_by_plan: Record<string, number>;
  recent_signups: { name: string; email: string; created_at: string; tenant: string }[];
  daily_signups: { date: string; count: number }[];
}

interface TenantRow {
  id: string;
  name: string;
  plan: string;
  subscription_status: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  tenant_id: string;
  tenants?: { name: string } | null;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        const [tenantsRes, usersRes, productsRes, movementsRes, profilesRes] = await Promise.all([
          supabase.from("tenants").select("id, name, plan, subscription_status, created_at"),
          supabase.from("profiles").select("id"),
          supabase.from("products").select("id"),
          supabase.from("movements").select("id, created_at"),
          supabase.from("profiles").select("id, name, email, created_at, tenant_id, tenants(name)").order("created_at", { ascending: false }).limit(10),
        ]);

        if (tenantsRes.error) throw tenantsRes.error;
        if (usersRes.error) throw usersRes.error;
        if (productsRes.error) throw productsRes.error;
        if (movementsRes.error) throw movementsRes.error;
        if (profilesRes.error) throw profilesRes.error;

        const tenants = (tenantsRes.data || []) as TenantRow[];
        const profiles = (profilesRes.data || []) as unknown as ProfileRow[];
        const movements = (movementsRes.data || []) as { id: string; created_at: string }[];

        const planCounts: Record<string, number> = {};
        tenants.forEach((t) => {
          planCounts[t.plan] = (planCounts[t.plan] || 0) + 1;
        });

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const dailyMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          dailyMap[d.toISOString().slice(0, 10)] = 0;
        }
        profiles.forEach((p) => {
          const day = p.created_at?.slice(0, 10);
          if (day && dailyMap[day] !== undefined) {
            dailyMap[day]++;
          }
        });

        if (!cancelled) {
          setMetrics({
            total_tenants: tenants.length,
            total_users: usersRes.data?.length || 0,
            total_products: productsRes.data?.length || 0,
            total_movements: movements.length,
            active_tenants: tenants.filter((t) => t.subscription_status === "active").length,
            trial_tenants: tenants.filter((t) => t.subscription_status === "trialing").length,
            tenants_by_plan: planCounts,
            recent_signups: profiles.map((p) => ({
              name: p.name,
              email: p.email,
              created_at: p.created_at,
              tenant: (p.tenants && typeof p.tenants === "object" && "name" in p.tenants)
                ? (p.tenants as { name: string }).name
                : "-",
            })),
            daily_signups: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar metricas");
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

  if (!metrics) return null;

  const kpis = [
    {
      label: "Empresas",
      value: metrics.total_tenants,
      sub: `${metrics.active_tenants} ativas · ${metrics.trial_tenants} trial`,
      icon: <Building2 className="h-5 w-5" />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Usuarios",
      value: metrics.total_users,
      sub: "todos os tenants",
      icon: <Users className="h-5 w-5" />,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Produtos",
      value: metrics.total_products,
      sub: "cadastrados no sistema",
      icon: <Package className="h-5 w-5" />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Movimentacoes",
      value: metrics.total_movements,
      sub: "total historico",
      icon: <ArrowRightLeft className="h-5 w-5" />,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Visao Geral</h1>
        <p className="text-sm text-gray-500 mt-1">Metricas do SaaS em tempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[6px] border border-border-default bg-bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{kpi.label}</span>
              <div className={`p-2 rounded-[4px] ${kpi.bg}`}>
                <span className={kpi.color}>{kpi.icon}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{kpi.value.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Planos</h2>
          <div className="space-y-3">
            {Object.entries(metrics.tenants_by_plan).map(([plan, count]) => {
              const colors: Record<string, string> = {
                free: "bg-gray-500",
                starter: "bg-blue-500",
                pro: "bg-purple-500",
                enterprise: "bg-yellow-500",
              };
              const pct = metrics.total_tenants > 0 ? (count / metrics.total_tenants) * 100 : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white capitalize">{plan}</span>
                    <span className="text-sm text-gray-400">{count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[plan] || "bg-gray-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Cadastros Recentes</h2>
          <div className="space-y-3">
            {metrics.recent_signups.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum cadastro ainda</p>
            ) : (
              metrics.recent_signups.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                  <div>
                    <p className="text-sm text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{s.tenant}</p>
                    <p className="text-[10px] text-gray-600">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString("pt-BR") : "-"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-[6px] border border-border-default bg-bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Atividade (7 dias)</h2>
        </div>
        <div className="flex items-end gap-2 h-32">
          {metrics.daily_signups.map((d) => {
            const maxCount = Math.max(...metrics.daily_signups.map((x) => x.count), 1);
            const height = (d.count / maxCount) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{d.count}</span>
                <div
                  className="w-full bg-blue-500/30 rounded-t-[2px] min-h-[2px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-[10px] text-gray-600">
                  {d.date.slice(5, 10)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
