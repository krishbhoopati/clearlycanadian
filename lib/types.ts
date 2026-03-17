// ─── Core Domain Entities ─────────────────────────────────────────────────────

export interface Persona {
  id: string;
  name: string;
  age_range: string;
  market: string;
  region?: string;
  generation: "Gen Z" | "Millennial" | "Gen X" | "Boomer";
  customer_type: string;
  behavioral_segment: string;
  description: string;
  motivations: string[];
  pain_points: string[];
  buying_triggers: string[];
  objections: string[];
  decision_style: string;
  channel_preferences: string[];
  product_preferences: string[];
  language_style: string;
  core_traits: string[];
  behavior_rules: string[];
  evidence_ids: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  context: string;
  question_templates: string[];
  recommended_personas: string[];
  required_fact_categories: string[];
  contextTags?: string[];
}

export interface BehaviorFact {
  id: string;
  statement: string;
  category: string;
  applies_to: string[];
  market: string;
  source: string;
  source_type: "study" | "survey" | "report" | "article" | "internal" | "other";
  source_url?: string;
  confidence: number;
  notes?: string;
  tags: string[];
}

export interface BrandFact {
  id: string;
  statement: string;
  category: string;
  applies_to_products: string[];
  source: string;
  source_url?: string;
  confidence: number;
}

export interface Evidence {
  id: string;
  text: string;          // mapped from BehaviorFact.statement at retrieval time
  tags: string[];
  category: string;
  relevanceScore: number; // 0–1, computed at retrieval time
  source?: string;
  datePublished?: string;
}

export interface QueryResult {
  query: string;
  parsedIntent: "explore" | "compare" | "validate" | "explain";
  evidence: Evidence[];
  summary: string;
  score: number;
  scenarioId?: string;
  personaId?: string;
}

// ─── API Request / Response Types ─────────────────────────────────────────────

export interface AskLabRequest {
  user_question: string;
  product_context?: string;
  market_context?: string;
}

export interface PersonaChatRequest {
  persona_id: string;
  message: string;
  scenario_id?: string;
  session_id?: string;
}

export interface PersonaSimulationResult {
  persona_id: string;
  persona_name: string;
  decision: "likely_try" | "likely_reject" | "mixed_interest" | "likely_repeat" | "low_awareness_high_potential";
  drivers: string[];
  barriers: string[];
  inferred_beliefs: string[];
  confidence: number;
  used_evidence_ids: string[];
  response_text: string;
  validator_flags: string[];
}

export interface AskLabResponse {
  overall_summary: string;
  consulted_personas: PersonaSimulationResult[];
  top_drivers: string[];
  top_barriers: string[];
  key_disagreements: string[];
  strategic_takeaway: string;
  confidence: number;
  used_evidence_ids: string[];
  evidence_items: Evidence[];
  scenario_matched: boolean;
}

export interface PersonaChatResponse {
  persona_response: string;
  session_id: string;
  confidence: number;
  used_evidence_ids: string[];
  validator_flags: string[];
}

// ─── Internal Utility Types ───────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: {
    personaId?: string;
    scenarioId?: string;
    evidenceIds?: string[];
    confidence?: number;
  };
}

export interface SimulationResponse<T = AskLabResponse | ChatTurn> {
  success: boolean;
  data: T | null;
  error?: string;
  meta: {
    processingMs: number;
    evidenceCount: number;
    version: string;
  };
}

export interface ChatTurn {
  userMessage: Message;
  personaReply: Message;
  persona: Persona;
  scenario?: Scenario;
  sessionId: string;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface ScoringResult {
  overallScore: number;
  breakdown: {
    relevance: number;
    recency: number;
    coverage: number;
  };
  notes: string[];
}

export interface ParsedQuery {
  rawText: string;
  keywords: string[];
  intent: "explore" | "compare" | "validate" | "explain";
  category?: string;
  personaFilter?: string;
  scenarioFilter?: string;
  market?: "CA" | "US";
  generation?: "Gen Z" | "Millennial" | "Gen X" | "Boomer";
  customerType?: "potential" | "existing";
  topic?: string;
  confidence: number;
  missingFields: string[];
}

export interface ChatSession {
  sessionId: string;
  personaId: string;
  scenarioId?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AggregatedResult {
  byCategory: Record<string, Evidence[]>;
  topEvidence: Evidence[];
  totalCount: number;
}

export interface PanelData {
  title: string;
  evidenceItems: Evidence[];
  scoringResult: ScoringResult;
  queryResult: QueryResult;
  personas: Persona[];
}

export interface ScenarioMatch {
  scenarioId: string;
  scenario: Scenario;
  explanation: string;
  score: number;
}
