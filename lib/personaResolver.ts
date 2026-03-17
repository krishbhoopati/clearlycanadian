import type { Persona } from "./types";
import { loadPersonas } from "./dataLoader";

export function resolvePersona(id: string): Persona | null {
  const personas = loadPersonas();
  return personas.find((p) => p.id === id) ?? null;
}

export function listPersonas(): Persona[] {
  return loadPersonas();
}
