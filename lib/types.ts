// ─── UI State Types ────────────────────────────────────────────────────────────

export interface ConversationTurn {
  question: string;
  result: AskLabResponse;
  timestamp: number; // Date.now() at submission time
}

// ─── Core Domain Entities ─────────────────────────────────────────────────────

export interface Persona {
  id: string;
  name: string;
  age?: number;
  age_range: string;
  market: string;
  region?: string;
  occupation?: string;
  location?: string;
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
  never_say?: string[];
  evidence_ids: string[];
  // Extended persona-specific fields (optional — graceful if absent)
  beverage_psychology?: string;
  price_sensitivity?: string;
  discovery_channels?: string[];
  cc_awareness?: string;
  cc_awareness_label?: string;
  segment_label?: string;
  cc_perception?: string;
  response_to_maple_product?: string;
  bar_and_festival_relevance?: string;
  nostalgia_relevance?: string;
  canadian_identity_relevance?: string;
  sustainability_attitude?: string;
  social_media_behavior?: string;
  current_beverages?: string[];
  shopping_locations?: string[];
  avatar_url?: string;
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
  context_data?: Record<string, unknown>;
}

export interface BehaviorFact {
  id: string;
  statement: string;
  category: string;
  applies_to: string[];
  market: string;
  source: string;
  source_type: "study" | "survey" | "report" | "article" | "internal" | "other" | "industry_research" | "company_data" | "cmo_interview" | "market_report" | "behavioral_data";
  source_url?: string;
  confidence: number;
  notes?: string;
  tags: string[];
  date_verified?: string;
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

export interface Competitor {
  id: string;
  name: string;
  parent_company: string;
  founded: number | string;
  positioning: string;
  price_points: {
    single: string;
    multipack: string;
    per_can_cost: string;
  };
  calories_per_serving: number | string;
  sugar_per_serving: string;
  sweetener: string;
  key_differentiators: string[];
  weaknesses_vs_cc: string[];
  retail_doors_estimate: string;
  target_demographic: string;
  social_media_strategy: string;
  recent_news_2025_2026: string[];
  market_context: string;
  comparison_to_cc: {
    cc_wins: string[];
    cc_loses: string[];
  };
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
  persona_ids?: string[];
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
  decision:
    | "immediate_yes"
    | "likely_try"
    | "interested_but_barriers"
    | "indifferent"
    | "unlikely_without_push"
    | "hard_no"
    | "already_buying";
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
  segments_to_watch: string[];
  suggested_follow_ups: string[];
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
