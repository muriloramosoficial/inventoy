"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TechBadge } from "@/components/tech-badge";
import {
  Activity,
  Loader2,
  ArrowRightLeft,
  Package,
  MapPin,
  Building2,
} from "lucide-react";

interface Movement {
  id: string;
  tenant_id: string;
  tenant_name: string;
  user_name: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  from_location?: string;
  to_location?: string;
  notes: string | null;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  in: "Entrada",
  out: "Saida",
  transfer: "Transferencia",
  adjustment: "Ajuste",
  count: "Contagem",
};

const typeColors: Record<string, "green" | "red" | "blue" | "yellow" | "gray"> = {
  in: "green",
  out: "red",
  transfer: "blue",
  adjustment: "yellow",
  count: "gray",
};

export default function AdminActivityPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: movementsData, error: movErr } = await supabase
          .from("movements")
          .select("id, tenant_id, type, quantity, notes, created_at, user_id, product_id, from_location_id, to_location_id")
          .order("created_at", { ascending: false })
          .limit(100);

        if (movErr) throw movErr;

        const tenantIds = [...new Set((movementsData || []).map((m: any) => m.tenant_id))];
        const userIds = [...new Set((movementsData || []).map((m: any) => m.user_id))];
        const productIds = [...new Set((movementsData || []).map((m: any) => m.product_id))];
        const locationIds = [
          ...new Set([
            ...(movementsData || []).map((m: any) => m.from_location_id).filter(Boolean),
            ...(movementsData || []).map((m: any) => m.to_location_id).filter(Boolean),
          ]),
        ];

        const [tenantsRes, usersRes, productsRes, locationsRes] = await Promise.all([
          tenantIds.length ? supabase.from("tenants").select("id, name").in("id", tenantIds) : { data: [] },
          userIds.length ? supabase.from("profiles").select("id, name").in("id", userIds) : { data: [] },
          productIds.length ? supabase.from("products").select("id, name").in("id", productIds) : { data: [] },
          locationIds.length ? supabase.from("locations").select("id, name").in("id", locationIds) : { data: [] },
        ]);

        const tenantMap: Record<string, string> = {};
        const userMap: Record<string, string> = {};
        const productMap: Record<string, string> = {};
        const locationMap: Record<string, string> = {};

        (tenantsRes.data || []).forEach((t: any) => { tenantMap[t.id] = t.name; });
        (usersRes.data || []).forEach((u: any) => { userMap[u.id] = u.name; });
        (productsRes.data || []).forEach((p: any) => { productMap[p.id] = p.name; });
        (locationsRes.data || []).forEach((l: any) => { locationMap[l.id] = l.name; });

        const parsed = (movementsData || []).map((m: any) => ({
          id: m.id,
          tenant_id: m.tenant_id,
          tenant_name: tenantMap[m.tenant_id] || "-",
          user_name: userMap[m.user_id] || "-",
          product_name: productMap[m.product_id] || "-",
          movement_type: m.type,
          quantity: m.quantity,
          from_location: m.from_location_id ? locationMap[m.from_location_id] : undefined,
          to_location: m.to_location_id ? locationMap[m.to_location_id] : undefined,
          notes: m.notes,
          created_at: m.created_at,
        }));

        if (!cancelled) setMovements(parsed);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar atividade");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === "all" ? movements : movements.filter((m) => m.movement_type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Atividade</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? "Carregando..." : `${movements.length} movimentacoes no historico`}
        </p>
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Todas" },
          { value: "in", label: "Entradas" },
          { value: "out", label: "Saidas" },
          { value: "transfer", label: "Transferencias" },
          { value: "adjustment", label: "Ajustes" },
          { value: "count", label: "Contagens" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs rounded-[4px] border transition-colors ${
              filter === f.value
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "border-border-default text-gray-400 hover:text-white hover:border-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="rounded-[6px] border border-border-default overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Nenhuma atividade encontrada
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {filtered.map((m) => (
              <div key={m.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-[4px] ${
                      m.movement_type === "in" ? "bg-green-500/10" :
                      m.movement_type === "out" ? "bg-red-500/10" :
                      m.movement_type === "transfer" ? "bg-blue-500/10" :
                      "bg-white/5"
                    }`}>
                      <ArrowRightLeft className={`h-3.5 w-3.5 ${
                        m.movement_type === "in" ? "text-green-400" :
                        m.movement_type === "out" ? "text-red-400" :
                        m.movement_type === "transfer" ? "text-blue-400" :
                        "text-gray-400"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-white">{m.product_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {m.tenant_name}
                        <span className="text-gray-600">·</span>
                        {m.user_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <TechBadge variant={typeColors[m.movement_type] || "gray"}>
                        {typeLabels[m.movement_type] || m.movement_type}
                      </TechBadge>
                      <span className="text-sm text-gray-300 font-mono">x{m.quantity}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {m.created_at ? new Date(m.created_at).toLocaleString("pt-BR") : "-"}
                    </p>
                  </div>
                </div>
                {m.movement_type === "transfer" && m.from_location && m.to_location && (
                  <div className="mt-1 ml-11 text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {m.from_location} → {m.to_location}
                  </div>
                )}
                {m.notes && (
                  <p className="mt-1 ml-11 text-xs text-gray-600 italic">{m.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
