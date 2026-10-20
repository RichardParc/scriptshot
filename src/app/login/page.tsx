"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/lib/field";

export default function LoginPage() {
  const [playBackground, setPlayBackground] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const desktopViewport = window.matchMedia("(min-width: 768px)");
    const syncBackgroundMotion = () => {
      setPlayBackground(motionPreference.matches && desktopViewport.matches);
    };

    syncBackgroundMotion();
    motionPreference.addEventListener("change", syncBackgroundMotion);
    desktopViewport.addEventListener("change", syncBackgroundMotion);
    return () => {
      motionPreference.removeEventListener("change", syncBackgroundMotion);
      desktopViewport.removeEventListener("change", syncBackgroundMotion);
    };
  }, []);

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
    <main className="relative isolate flex min-h-screen overflow-hidden bg-canvas">
      {!playBackground && (
        <Image
          src="/login-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-50"
        />
      )}
      {playBackground && (
        <video
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/login-poster.jpg"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/8089126/8089126-uhd_4096_2160_25fps.mp4"
            type="video/mp4"
          />
        </video>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_50%,rgba(211,47,47,0.19),transparent_45%),linear-gradient(90deg,rgba(10,10,11,0.93)_0%,rgba(10,10,11,0.72)_48%,rgba(10,10,11,0.76)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-base via-transparent to-base/30" />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:gap-16 lg:px-12">
        <div className="hidden max-w-2xl lg:block">
          <Image src="/logo.png" alt="Scriptshot" width={616} height={139} className="mb-10 h-10 w-auto" priority />
          <p className="mb-4 font-mono text-xs tracking-[0.2em] text-accent-hover">DE LA IDEA AL RODAJE</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight text-text-primary xl:text-6xl">
            Prepara el set.<br />Cuenta la historia.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-text-secondary">
            Guiones, escenas y producción en un espacio creado para quienes hacen video.
          </p>
          <a
            href="https://www.pexels.com/video/a-cameraman-preparing-for-the-shooting-production-8089126/"
            target="_blank"
            rel="noreferrer"
            className="mt-12 inline-flex text-xs text-text-disabled transition-colors hover:text-text-secondary"
          >
            Video: Ron Lach · Pexels
          </a>
        </div>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-canvas/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
          <div className="mb-7 flex justify-center lg:hidden">
            <Image src="/logo.png" alt="Scriptshot" width={616} height={139} className="h-9 w-auto" priority />
          </div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-accent-hover lg:hidden">DE LA IDEA AL RODAJE</p>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-text-primary">
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h2>
          <p className="mb-7 text-sm leading-relaxed text-text-secondary">
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
            {error && <p role="alert" className="rounded-lg border border-status-missing/30 bg-status-missing/10 px-3 py-2 text-sm text-status-missing">{error}</p>}
            {message && <p role="status" className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-secondary">{message}</p>}
            <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-1 w-full rounded-lg">
              {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
            </Button>
          </form>
          <button type="button" className="mt-5 min-h-10 w-full rounded-lg text-sm text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>
            {mode === "login" ? "¿Primera vez? Crea una cuenta" : "Ya tengo cuenta. Iniciar sesión"}
          </button>
          <a
            href="https://www.pexels.com/video/a-cameraman-preparing-for-the-shooting-production-8089126/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 block text-center text-[10px] text-text-disabled hover:text-text-secondary lg:hidden"
          >
            Video: Ron Lach · Pexels
          </a>
        </section>
      </div>
    </main>
  );
}
