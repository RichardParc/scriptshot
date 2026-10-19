"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
import { NewProjectForm } from "@/components/NewProjectForm";

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Nuevo proyecto — Scriptshot";
  }, []);

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <BackLink href="/" label="Volver" />

      <h1 className="mb-8 mt-6 text-2xl font-medium text-text-primary">
        Nuevo proyecto
      </h1>

      <NewProjectForm onCancel={() => router.push("/")} />
    </main>
  );
}
