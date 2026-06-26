"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Mail, Lock, Eye, EyeOff, User, Building2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            tenant_name: companyName,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Account created! Check your email to confirm your registration. You can close this page.",
      });

      // Don't redirect - user needs to confirm email first
      // The Supabase handle_new_user trigger will create tenant + profile
      // AFTER email is confirmed (if email confirmation is enabled)
      //
      // IMPORTANTE: Execute o schema SQL (lib/supabase-schema.sql) no Supabase
      // para criar o trigger handle_new_user que auto-cria tenant + profile.
      // Sem ele, o perfil do usuário não será criado após o signup.
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand/10 mb-4">
            <Box className="h-8 w-8 text-brand" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Start your free trial — no credit card needed
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="h-4 w-4" />}
          />

          <Input
            label="Company Name"
            placeholder="My Company Ltda"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            icon={<Building2 className="h-4 w-4" />}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="h-4 w-4" />}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              icon={<Lock className="h-4 w-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" className="w-full h-11" loading={loading}>
            Create Account
          </Button>

          {message && (
            <div
              className={`text-sm p-3 rounded-[4px] border ${
                message.type === "success"
                  ? "border-brand/20 bg-brand/[0.08] text-brand"
                  : "border-brand-danger/20 bg-brand-danger-dim text-brand-danger"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="text-center pt-2">
            <span className="text-sm text-text-muted">Already have an account? </span>
            <Link
              href="/login"
              className="text-sm text-brand hover:text-brand-hover transition-colors"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
