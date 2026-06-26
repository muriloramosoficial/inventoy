"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

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
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center justify-center w-16 h-16 rounded-xl bg-brand/10 mb-4 hover:bg-brand/[0.15] transition-colors">
            <Box className="h-8 w-8 text-brand" />
          </Link>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">INVENTOY</h1>
          <p className="text-sm text-text-muted mt-1">Gestão de Estoque Inteligente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="h-4 w-4" />}
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock className="h-4 w-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div className="text-sm p-3 rounded-[4px] border border-brand-danger/20 bg-brand-danger-dim text-brand-danger">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" loading={loading}>
            Entrar
          </Button>

          <div className="text-center pt-4">
            <span className="text-sm text-text-muted">Não tem conta? </span>
            <Link
              href="/register"
              className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
            >
              Cadastre-se grátis
            </Link>
          </div>

          <div className="relative pt-2">
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
            onClick={async () => {
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
            }}
          >
            <Mail className="h-4 w-4" />
            Entrar com link mágico
          </Button>
        </form>
      </div>
    </div>
  );
}
