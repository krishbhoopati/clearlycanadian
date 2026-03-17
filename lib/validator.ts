import { loadPersonas } from "./dataLoader";

export function validateQuery(text: string): string | null {
  if (!text || text.trim().length === 0) return "Query cannot be empty.";
  if (text.trim().length < 3) return "Query is too short. Please enter at least 3 characters.";
  if (text.length > 500) return "Query is too long. Please keep it under 500 characters.";
  return null;
}

export function validatePersonaId(id: string): boolean {
  const personas = loadPersonas();
  return personas.some((p) => p.id === id);
}
