import { NextResponse } from "next/server";
import { loadScenarios } from "@/lib/dataLoader";

export async function GET() {
  const scenarios = loadScenarios();
  return NextResponse.json({ scenarios });
}
