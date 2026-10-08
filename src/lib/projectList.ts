import type { Project } from "./types";
import type { ProjectSummary } from "./status";

export type ProjectEntry = { project: Project; summary: ProjectSummary };

export type SortKey = "recent" | "oldest" | "name_asc" | "name_desc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "name_asc", label: "Nombre (A–Z)" },
  { value: "name_desc", label: "Nombre (Z–A)" },
];

// Lowercase and strip accents so "camara" finds "Cámara".
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function filterProjects(
  entries: ProjectEntry[],
  query: string
): ProjectEntry[] {
  const q = normalize(query.trim());
  if (!q) return entries;
  return entries.filter(
    ({ project }) =>
      normalize(project.name).includes(q) ||
      normalize(project.idea ?? "").includes(q)
  );
}

export function sortProjects(
  entries: ProjectEntry[],
  sort: SortKey
): ProjectEntry[] {
  const copy = [...entries];
  const byName = (a: ProjectEntry, b: ProjectEntry) =>
    a.project.name.localeCompare(b.project.name, "es", { sensitivity: "base" });
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) =>
        a.project.created_at.localeCompare(b.project.created_at)
      );
    case "name_asc":
      return copy.sort(byName);
    case "name_desc":
      return copy.sort((a, b) => byName(b, a));
    default:
      return copy.sort((a, b) =>
        b.project.created_at.localeCompare(a.project.created_at)
      );
  }
}
