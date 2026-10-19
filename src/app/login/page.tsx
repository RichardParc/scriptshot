"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/lib/field";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Revisa tu correo y confirma la cuenta para continuar.");
      return;
    }
    const nextPath = new URLSearchParams(window.location.search).get("next");
    window.location.assign(
      nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="Scriptshot" width={616} height={139} className="h-9 w-auto" priority />
        </div>
        <h1 className="mb-2 text-xl font-medium text-text-primary">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-text-secondary">
          Accede para organizar tus proyectos y preparar tus rodajes.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            Correo electrónico
            <input className={fieldClass("md")} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            Contraseña
            <input className={fieldClass("md")} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p role="alert" className="text-sm text-status-missing">{error}</p>}
          {message && <p role="status" className="text-sm text-text-secondary">{message}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={busy}>
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>
        <button type="button" className="mt-5 w-full text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>
          {mode === "login" ? "¿Primera vez? Crea una cuenta" : "Ya tengo cuenta. Iniciar sesión"}
        </button>
      </section>
    </main>
  );
}
