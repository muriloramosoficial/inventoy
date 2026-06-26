"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Box, BarChart3, Package, ScanLine, Globe, CreditCard, Shield, ArrowRight, Check, Menu, X } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Inventory Control",
    desc: "Real-time stock tracking with multi-location support. Know exactly what you have and where.",
  },
  {
    icon: ScanLine,
    title: "Barcode Scanner",
    desc: "Mobile-first barcode scanning. Receive, transfer, and count inventory from the warehouse floor.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Bento grid dashboard with movement charts, low stock alerts, and valuation reports.",
  },
  {
    icon: Globe,
    title: "Multi-language",
    desc: "Interface in Portuguese, English, and Spanish. Your team works in their preferred language.",
  },
  {
    icon: CreditCard,
    title: "Stripe + ASAAS",
    desc: "Global payments via Stripe. Brazilian payments via ASAAS (PIX, Boleto, Credit Card).",
  },
  {
    icon: Shield,
    title: "Multi-tenant Security",
    desc: "Row Level Security ensures each company sees only their data. SOC2-grade protection.",
  },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/month",
    desc: "For small teams getting started",
    features: ["Up to 100 products", "1 user", "Basic dashboard", "Manual entries"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "R$ 49",
    period: "/month",
    desc: "For growing businesses",
    features: ["Up to 1,000 products", "5 users", "Advanced analytics", "Barcode scanning", "CSV export"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: "/month",
    desc: "For scaling operations",
    features: ["Up to 10,000 products", "Unlimited users", "API access", "Custom reports", "Priority support"],
    cta: "Start Free Trial",
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Navbar ─── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-bg-primary/90 backdrop-blur-md border-b border-border-default" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center">
                <Box className="h-5 w-5 text-brand" />
              </div>
              <span className="text-lg font-semibold text-text-primary tracking-tight">INVENTOY</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Sign In</Button>
                <Button size="sm" onClick={handleGetStarted}>
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text-primary"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-default bg-bg-secondary">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="block text-sm text-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" onClick={() => router.push("/login")}>Sign In</Button>
                <Button onClick={handleGetStarted}>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        {/* Grid background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,207,142,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(62,207,142,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/[0.06] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-mono text-brand tracking-wide">Multi-tenant SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            Smart Inventory
            <br />
            <span className="text-brand">Management</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Track, manage, and optimize your inventory in real-time.
            Built for global teams with local payments — Stripe worldwide, ASAAS in Brazil.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Everything you need to
              <br />
              <span className="text-brand">manage inventory</span>
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              From warehouse floor to boardroom — tools for every role in your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-lg border border-border-default bg-bg-surface hover:border-brand/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-brand/[0.08] flex items-center justify-center mb-4 group-hover:bg-brand/[0.12] transition-colors">
                  <feature.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-base font-medium text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 sm:py-28 px-4 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-lg border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-brand bg-brand/[0.03]"
                    : "border-border-default bg-bg-surface hover:border-[#444]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand text-black text-xs font-medium">
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-medium text-text-primary mb-1">{plan.name}</h3>
                <p className="text-sm text-text-muted mb-4">{plan.desc}</p>

                <div className="mb-6">
                  <span className="text-3xl font-semibold text-text-primary font-mono">{plan.price}</span>
                  <span className="text-sm text-text-muted ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                  onClick={handleGetStarted}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4 border-t border-border-default">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-xl border border-border-default bg-bg-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-4">
              Ready to transform your
              <br />
              <span className="text-brand">inventory management?</span>
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Join thousands of companies using INVENTOY to track, manage, and optimize their inventory.
            </p>
            <Button size="lg" onClick={handleGetStarted}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border-default py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-brand" />
            <span className="text-sm text-text-muted">INVENTOY © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-text-muted">Stripe</span>
            <span className="text-xs text-text-muted">ASAAS</span>
            <span className="text-xs text-text-muted">Supabase</span>
            <span className="text-xs text-text-muted">Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
