import { NextResponse } from "next/server";
import { loadPersonas } from "@/lib/dataLoader";

export async function GET() {
  const personas = loadPersonas();
  return NextResponse.json({ personas });
}
