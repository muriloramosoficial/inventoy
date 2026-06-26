"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/components/tech-badge";
import { User, Building2, CreditCard, Bell, Check, ChevronRight, QrCode } from "lucide-react";

const plans = [
  { id: "free", name: "Free", price: "R$ 0", description: "Até 100 produtos", current: true },
  { id: "starter", name: "Starter", price: "R$ 49", description: "Até 1.000 produtos", current: false },
  { id: "pro", name: "Professional", price: "R$ 149", description: "Até 10.000 produtos", current: false },
  { id: "enterprise", name: "Enterprise", price: "Personalizado", description: "Produtos ilimitados", current: false },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Configurações</h1>
        <p className="text-sm text-text-muted mt-1">
          Gerencie sua conta, faturamento e preferências
        </p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-muted" />
            <CardTitle>Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome" defaultValue="Admin" />
            <Input label="Email" type="email" defaultValue="admin@inventoy.com" />
          </div>
          <Button>Salvar</Button>
        </CardContent>
      </Card>

      {/* Organização */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-text-muted" />
            <CardTitle>Organização</CardTitle>
          </div>
          <CardDescription>Dados da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nome da Empresa" defaultValue="Minha Empresa Ltda" />
          <Input label="Slug da empresa" defaultValue="minha-empresa" />
          <Button>Salvar</Button>
        </CardContent>
      </Card>

      {/* Planos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-text-muted" />
            <CardTitle>Plano e Faturamento</CardTitle>
          </div>
          <CardDescription>Gerencie sua assinatura e forma de pagamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-[6px] border transition-all cursor-pointer ${
                  plan.current
                    ? "border-brand bg-brand/[0.05]"
                    : "border-border-default bg-bg-surface hover:border-[#444]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">{plan.name}</span>
                  {plan.current && <Check className="h-4 w-4 text-brand" />}
                </div>
                <p className="text-2xl font-semibold text-text-primary font-mono">{plan.price}</p>
                <p className="text-xs text-text-muted mt-1">{plan.description}</p>
                {!plan.current && (
                  <Button variant="outline" size="sm" className="w-full mt-3">Upgrade</Button>
                )}
                {plan.current && (
                  <TechBadge variant="green" className="w-full justify-center mt-3">Atual</TechBadge>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
              Forma de Pagamento
            </h4>
            <div className="flex items-center justify-between p-3 rounded-[4px] border border-border-default bg-bg-surface">
              <div className="flex items-center gap-3">
                <QrCode className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm text-text-primary">ASAAS — PIX, Boleto ou Cartão</p>
                  <p className="text-xs text-text-muted">Pagamentos processados via ASAAS em R$</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Configurar <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-text-muted" />
            <CardTitle>Notificações</CardTitle>
          </div>
          <CardDescription>Configure seus alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Alerta de estoque baixo", "Itens próximos ao vencimento", "Resumo diário", "Relatório semanal"].map((item) => (
            <label key={item} className="flex items-center justify-between p-2 rounded-[4px] hover:bg-bg-surface-hover cursor-pointer">
              <span className="text-sm text-text-primary">{item}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-bg-elevated peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
