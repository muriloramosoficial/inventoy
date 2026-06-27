"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { createClient } from "@/lib/supabase/client";
import {
  Code2,
  Key,
  Copy,
  Check,
  Globe,
  Lock,
  Shield,
  Loader2,
  ChevronRight,
  Terminal,
  BookOpen,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface TenantInfo {
  id: string;
  name: string;
  plan: string;
  subscription_status: string | null;
}

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/products",
    params: "?page=1&limit=20&category_id=uuid&search=termo",
    desc: "Listar produtos com paginação e filtros",
    auth: "API Key",
  },
  {
    method: "POST",
    path: "/api/v1/products",
    params: "",
    desc: "Criar um novo produto",
    auth: "API Key",
  },
  {
    method: "GET",
    path: "/api/v1/products/{id}",
    params: "",
    desc: "Buscar produto por ID",
    auth: "API Key",
  },
  {
    method: "PATCH",
    path: "/api/v1/products/{id}",
    params: "",
    desc: "Atualizar parcialmente um produto",
    auth: "API Key",
  },
  {
    method: "DELETE",
    path: "/api/v1/products/{id}",
    params: "",
    desc: "Excluir um produto",
    auth: "API Key",
  },
  {
    method: "GET",
    path: "/api/v1/inventory",
    params: "?location_id=uuid&status=low",
    desc: "Consultar inventário com produto e localização",
    auth: "API Key",
  },
  {
    method: "GET",
    path: "/api/v1/movements",
    params: "?product_id=uuid&type=in&page=1&limit=50",
    desc: "Histórico de movimentações",
    auth: "API Key",
  },
  {
    method: "POST",
    path: "/api/v1/movements",
    params: "",
    desc: "Registrar entrada ou saída",
    auth: "API Key",
  },
];

const LANGUAGES = [
  {
    name: "cURL",
    code: `curl -H "Authorization: Bearer SEU_API_KEY" \\
  -H "Content-Type: application/json" \\
  "https://www.invetoy.com.br/api/v1/products?limit=5"`,
  },
  {
    name: "JavaScript (fetch)",
    code: `const response = await fetch("https://www.invetoy.com.br/api/v1/products?limit=5", {
  headers: {
    Authorization: "Bearer SEU_API_KEY",
    "Content-Type": "application/json",
  },
});
const data = await response.json();
console.log(data);`,
  },
  {
    name: "Python",
    code: `import requests

headers = {
    "Authorization": "Bearer SEU_API_KEY",
    "Content-Type": "application/json",
}
response = requests.get(
    "https://www.invetoy.com.br/api/v1/products?limit=5",
    headers=headers,
)
data = response.json()
print(data)`,
  },
];

export default function ApiDocsPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState(0);
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);

  useEffect(() => {
    async function loadTenant() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          const { data: tenantData } = await supabase
            .from("tenants")
            .select("id, name, plan, subscription_status")
            .eq("id", profile.tenant_id)
            .single();
          if (tenantData) {
            setTenant(tenantData);
            // Generate a demo API key based on tenant
            setApiKey(`inv_${tenantData.id.slice(0, 8)}_${tenantData.name.slice(0, 6).toLowerCase().replace(/\\s/g, "")}_demo`);
          }
        }
      } catch {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, [router]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasApiAccess = tenant && (tenant.plan === "starter" || tenant.plan === "pro") && tenant.subscription_status !== "canceled";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 text-brand animate-spin" />
        <span className="ml-3 text-sm text-text-secondary">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">API Documentation</h1>
        <p className="text-sm text-text-muted mt-1">
          Integre o INVENTOY com seus sistemas internos, ERP ou aplicativo mobile
        </p>
      </div>

      {/* Access Gate */}
      {!hasApiAccess ? (
        <div className="p-8 rounded-lg border border-border-default bg-bg-surface text-center">
          <Lock className="h-10 w-10 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-medium text-text-primary mb-2">API disponível nos planos Starter e Pro</h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            Faça upgrade do seu plano para gerar uma chave de API e integrar o INVENTOY com seus sistemas.
          </p>
          <Button onClick={() => router.push("/subscription")}>
            Ver Planos <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {/* API Key Card */}
          <Card accent="brand">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-brand" />
                <CardTitle>Sua Chave de API</CardTitle>
              </div>
              <CardDescription>
                Use esta chave para autenticar suas requisições. Mantenha-a segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-sm">
                <code className="flex-1 truncate text-text-primary">{apiKey}</code>
                <button
                  onClick={handleCopyKey}
                  className="shrink-0 p-1.5 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
                  aria-label={copied ? "Copiado" : "Copiar chave"}
                >
                  {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-muted">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>
                  Inclua sua chave no header <code className="font-mono text-text-secondary bg-bg-elevated px-1 rounded">Authorization: Bearer SUA_CHAVE</code> em todas as requisições.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-text-muted" />
                <CardTitle>Base URL</CardTitle>
              </div>
              <CardDescription>Todas as requisições usam esta URL base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-sm">
                <code className="text-text-primary">https://www.invetoy.com.br/api/v1</code>
                <TechBadge variant="green">HTTPS</TechBadge>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-text-muted" />
                <CardTitle>Autenticação</CardTitle>
              </div>
              <CardDescription>
                Todas as requisições devem incluir o header de autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-text-secondary">
                A API utiliza <strong className="text-text-primary">Bearer Token</strong> authentication.
                Inclua sua chave de API em todas as requisições:
              </p>
              <div className="p-3 rounded-[4px] bg-bg-elevated border border-border-default font-mono text-xs">
                <span className="text-text-muted">Authorization: </span>
                <span className="text-brand">Bearer</span>
                <span className="text-text-primary"> inv_seu_id_demo_key</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-text-muted">
                <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>A chave de API é vinculada ao seu tenant. Chamadas sem autenticação retornam <strong className="text-text-secondary">401 Unauthorized</strong>.</p>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-text-muted" />
                <CardTitle>Endpoints</CardTitle>
              </div>
              <CardDescription>
                Todos os endpoints disponíveis para integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ENDPOINTS.map((ep, i) => (
                <div
                  key={ep.path + ep.method}
                  className="border border-border-default rounded-[4px] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg-surface-hover transition-colors"
                  >
                    <TechBadge
                      variant={
                        ep.method === "GET" ? "green" :
                        ep.method === "POST" ? "blue" :
                        ep.method === "PATCH" ? "yellow" :
                        ep.method === "DELETE" ? "red" : "gray"
                      }
                      className="font-mono w-16 justify-center shrink-0"
                    >
                      {ep.method}
                    </TechBadge>
                    <code className="text-sm text-text-primary flex-1 font-mono">{ep.path}</code>
                    <ChevronRight
                      className={`h-4 w-4 text-text-muted transition-transform duration-200 ${
                        expandedEndpoint === i ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {expandedEndpoint === i && (
                    <div className="px-3 pb-3 border-t border-border-default">
                      <div className="pt-3 space-y-3">
                        <p className="text-sm text-text-secondary">{ep.desc}</p>
                        {ep.params && (
                          <div>
                            <p className="text-xs text-text-muted mb-1">Parâmetros de consulta:</p>
                            <code className="text-xs text-text-secondary bg-bg-elevated px-2 py-1 rounded font-mono">
                              {ep.path}{ep.params}
                            </code>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Shield className="h-3 w-3" />
                          <span>Autenticação: {ep.auth}</span>
                        </div>
                        {/* Example Response */}
                        <div>
                          <details className="group">
                            <summary className="text-xs text-text-muted cursor-pointer hover:text-text-primary transition-colors select-none">
                              Exemplo de resposta (200 OK)
                            </summary>
                            <pre className="mt-2 p-3 rounded-[4px] bg-bg-elevated border border-border-default overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
{`{
  "data": [
    {
      "id": "uuid",
      "name": "Produto Exemplo",
      "sku": "SKU-001",
      "quantity": 42,
      "category": "Eletrônicos",
      "created_at": "2026-06-26T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}`}
                            </pre>
                          </details>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-text-muted" />
                <CardTitle>Exemplos de Código</CardTitle>
              </div>
              <CardDescription>
                Exemplos prontos para usar na sua integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language tabs */}
              <div className="flex gap-1 p-1 rounded-[4px] bg-bg-elevated border border-border-default w-fit">
                {LANGUAGES.map((lang, i) => (
                  <button
                    key={lang.name}
                    onClick={() => setSelectedLang(i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors ${
                      selectedLang === i
                        ? "bg-bg-surface text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              <pre className="p-4 rounded-[4px] bg-bg-elevated border border-border-default overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
                <code>{LANGUAGES[selectedLang].code}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-text-muted" />
                <CardTitle>Rate Limits</CardTitle>
              </div>
              <CardDescription>Limites de requisição para proteger a plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Requisições/minuto", value: "60", plan: "Starter" },
                  { label: "Requisições/minuto", value: "120", plan: "Pro" },
                  { label: "Concorrência máxima", value: "10", plan: "Ambos" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-[4px] border border-border-default bg-bg-surface">
                    <p className="text-xs text-text-muted mb-1">{item.label}</p>
                    <p className="text-lg font-semibold text-text-primary font-mono">{item.value}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{item.plan}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-text-muted" />
                <CardTitle>Códigos de Erro</CardTitle>
              </div>
              <CardDescription>Possíveis respostas de erro da API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { code: 401, message: "Unauthorized — Chave de API inválida ou ausente" },
                  { code: 403, message: "Forbidden — Sem permissão para este recurso" },
                  { code: 404, message: "Not Found — Recurso não encontrado" },
                  { code: 422, message: "Unprocessable Entity — Dados inválidos na requisição" },
                  { code: 429, message: "Too Many Requests — Rate limit excedido" },
                ].map((err) => (
                  <div key={err.code} className="flex items-center gap-3 p-2 rounded-[4px] hover:bg-bg-surface-hover">
                    <TechBadge variant="red" className="font-mono w-12 justify-center shrink-0">
                      {err.code}
                    </TechBadge>
                    <span className="text-sm text-text-secondary">{err.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Footer note */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border-default bg-bg-surface">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <ExternalLink className="h-4 w-4" />
          <span>
            Base URL: <code className="font-mono text-text-secondary">https://www.invetoy.com.br/api/v1</code>
          </span>
        </div>
        <TechBadge variant="green">v1.0</TechBadge>
      </div>
    </div>
  );
}
