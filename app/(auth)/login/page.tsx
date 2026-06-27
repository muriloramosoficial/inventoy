"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Confirme seu email antes de entrar. Verifique sua caixa de entrada.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError("Digite seu email primeiro");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      });
      if (magicError) throw magicError;
      setError("");
      alert("Link mágico enviado! Verifique seu email.");
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar link mágico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(62,207,142,1) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,142,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand/3 blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm transition-all duration-500 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link
            href="/"
            className="group flex items-center justify-center w-14 h-14 rounded-xl bg-brand/[0.08] mb-4 hover:bg-brand/[0.12] transition-all duration-300 hover:shadow-[0_0_30px_rgba(62,207,142,0.1)]"
            aria-label="Voltar para página inicial"
          >
            <Box className="h-7 w-7 text-brand transition-transform duration-300 group-hover:scale-110" />
          </Link>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">INVENTOY</h1>
          <p className="text-sm text-text-muted mt-1">Gestão de Estoque Inteligente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                icon={<Mail className="h-4 w-4" />}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="login-password">Senha</Label>
                <button
                  type="button"
                  className="text-[11px] text-text-muted hover:text-brand transition-colors"
                  tabIndex={-1}
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="text-sm p-3 rounded-[4px] border border-brand-danger/20 bg-brand-danger-dim text-brand-danger animate-in"
              style={{ animation: "fadeIn 0.2s ease-out" }}
              role="alert"
            >
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" loading={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center">
            <span className="text-sm text-text-muted">Não tem conta? </span>
            <Link
              href="/register"
              className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
            >
              Cadastre-se grátis
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-primary px-2 text-text-muted">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleMagicLink}
            disabled={loading}
          >
            <Mail className="h-4 w-4" />
            Entrar com link mágico
          </Button>
        </form>
      </div>

      {/* Terms footer */}
      <p className="relative mt-10 text-[10px] text-text-muted text-center max-w-xs">
        Ao continuar, você aceita nossos{" "}
        <Link href="/termos" className="text-text-muted hover:text-text-primary underline underline-offset-2 transition-colors">
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link href="/privacidade" className="text-text-muted hover:text-text-primary underline underline-offset-2 transition-colors">
          Política de Privacidade
        </Link>
      </p>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
