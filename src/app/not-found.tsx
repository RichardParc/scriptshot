import { Compass } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Compass size={32} className="text-text-disabled" />
      <div>
        <h1 className="mb-1 text-2xl font-medium text-text-primary">
          No encontramos esto
        </h1>
        <p className="text-base text-text-secondary">
          El proyecto o la página que buscas ya no existe, o el link está mal.
        </p>
      </div>
      <LinkButton href="/" variant="primary" className="mt-2">
        Volver al dashboard
      </LinkButton>
    </main>
  );
}
