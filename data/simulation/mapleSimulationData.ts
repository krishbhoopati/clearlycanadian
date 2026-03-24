import type { SimAgent, GraphNode, GraphLink, SimPost, SentimentPoint, SwarmSegment } from "@/lib/types";

// ─── Knowledge Graph — Main Nodes ─────────────────────────────────────────────

export const mainNodes: GraphNode[] = [
  // Center
  { id: "cc-maple", label: "CC Maple Zero Sugar", group: "center", color: "#1B6EC2", tooltip: "2% unaided awareness nationally — massive upside potential" },

  // Products
  { id: "p-originals", label: "Originals", group: "product", color: "#2563EB", tooltip: "Original 1987 flavors — Indiegogo comeback, fan-funded" },
  { id: "p-zero-sugar", label: "Zero Sugar Line", group: "product", color: "#2563EB", tooltip: "Fastest-growing SKU category in sparkling water" },
  { id: "p-essence", label: "Essence", group: "product", color: "#2563EB", tooltip: "Zero calories, zero sweeteners — clean label positioning" },
  { id: "p-glass-bottle", label: "Glass Bottle", group: "product", color: "#2563EB", tooltip: "Iconic 340ml glass — highest premium signal in category" },
  { id: "p-sleek-can", label: "SleekCan", group: "product", color: "#2563EB", tooltip: "New 355ml format — convenience & gym-friendly" },

  // Competitors
  { id: "c-lacroix", label: "LaCroix", group: "competitor", color: "#EF4444", tooltip: "Market leader, $0.42/can at Costco — primary comparison benchmark" },
  { id: "c-poppi", label: "Poppi", group: "competitor", color: "#EF4444", tooltip: "Prebiotic soda — Gen Z darling, collab-first marketing" },
  { id: "c-olipop", label: "Olipop", group: "competitor", color: "#EF4444", tooltip: "Digestive wellness positioning, $2.49–$2.99/can" },
  { id: "c-topo", label: "Topo Chico", group: "competitor", color: "#EF4444", tooltip: "Coca-Cola-owned, mineral water heritage, bar staple" },
  { id: "c-liquid-death", label: "Liquid Death", group: "competitor", color: "#EF4444", tooltip: "Brand-first, irreverent — NOT present in tourist retail" },

  // Channels
  { id: "ch-tourist", label: "Tourist Retail", group: "channel", color: "#10B981", tooltip: "13M visitors to Niagara Falls alone — zero sparkling water competition" },
  { id: "ch-souvenir", label: "Souvenir Shops", group: "channel", color: "#10B981", tooltip: "Maple syrup is Canada's #1 souvenir — adjacency play" },
  { id: "ch-bars", label: "Bars & Restaurants", group: "channel", color: "#10B981", tooltip: "48% on-premise conversion rate when sampled" },
  { id: "ch-grocery", label: "Grocery", group: "channel", color: "#10B981", tooltip: "Shoppers Drug Mart, Sobeys, Metro — growing placement" },
  { id: "ch-convenience", label: "Convenience", group: "channel", color: "#10B981", tooltip: "7-Eleven, Mac's — impulse buy, price-sensitive segment" },
  { id: "ch-costco", label: "Costco", group: "channel", color: "#10B981", tooltip: "Household buyers need variety pack format to switch from LaCroix" },

  // Persona segments
  { id: "seg-genz", label: "Gen Z", group: "persona", color: "#8B5CF6", tooltip: "Discovers through TikTok & friends — won't pick off shelf without social proof" },
  { id: "seg-millennials", label: "Millennials", group: "persona", color: "#8B5CF6", tooltip: "Premium lifestyle buyers — glass bottle aesthetic converts fast" },
  { id: "seg-genx", label: "Gen X", group: "persona", color: "#8B5CF6", tooltip: "Nostalgic loyalists — 90s CC memory is a purchase trigger" },
  { id: "seg-bartenders", label: "Bartenders", group: "persona", color: "#8B5CF6", tooltip: "Evaluates for cocktail menu — maple sparkling base saves prep time" },
  { id: "seg-sober", label: "Sober Curious", group: "persona", color: "#8B5CF6", tooltip: "Fastest-growing on-premise segment — needs interesting NA options" },
  { id: "seg-household", label: "Household Buyers", group: "persona", color: "#8B5CF6", tooltip: "Karen-type — price comparison to LaCroix is key decision gate" },

  // Concepts
  { id: "con-buy-canadian", label: "Buy Canadian", group: "concept", color: "#F59E0B", tooltip: "Purchase intent for Canadian brands up 38% since 2024 tariff tensions" },
  { id: "con-maple-souvenir", label: "Maple Syrup #1 Souvenir", group: "concept", color: "#F59E0B", tooltip: "Maple is Canada's #1 purchased souvenir — CC Maple is a natural adjacency" },
  { id: "con-shania", label: "Shania Twain Campaign", group: "concept", color: "#F59E0B", tooltip: "Comeback story + Canadian icon — Gen X nostalgia activation" },
  { id: "con-blue-jays", label: "Blue Jays Partnership", group: "concept", color: "#F59E0B", tooltip: "Rogers Centre placement — 3M+ annual attendance, captive audience" },
  { id: "con-conversion", label: "48% Conversion Rate", group: "concept", color: "#F59E0B", tooltip: "On-premise sample-to-purchase rate — highest in category when sampled" },
  { id: "con-awareness", label: "2% Unaided Awareness", group: "concept", color: "#F59E0B", tooltip: "Baseline is near zero — every touchpoint is net new discovery" },

  // Markets
  { id: "m-niagara", label: "Niagara Falls (13M)", group: "market", color: "#14B8A6", tooltip: "13M annual visitors — largest tourist retail opportunity in Canada" },
  { id: "m-banff", label: "Banff (4.3M)", group: "market", color: "#14B8A6", tooltip: "4.3M annual visitors, high international tourist mix" },
  { id: "m-montreal", label: "Old Montréal", group: "market", color: "#14B8A6", tooltip: "French-Canadian market — Marie-type sober curious consumer density" },
  { id: "m-vancouver", label: "Vancouver", group: "market", color: "#14B8A6", tooltip: "Granville Island, Gastown — premium lifestyle & tourist overlap" },
  { id: "m-toronto", label: "Toronto", group: "market", color: "#14B8A6", tooltip: "CN Tower, Distillery District — highest on-premise opportunity" },
];

export const mainLinks: GraphLink[] = [
  // Center to products
  { source: "cc-maple", target: "p-originals", label: "line extension" },
  { source: "cc-maple", target: "p-zero-sugar", label: "same line" },
  { source: "cc-maple", target: "p-glass-bottle", label: "hero format" },
  { source: "cc-maple", target: "p-sleek-can", label: "convenience format" },
  { source: "cc-maple", target: "p-essence", label: "adjacent sku" },
  // Center to competitors
  { source: "cc-maple", target: "c-lacroix", label: "competes with", strength: 0.3 },
  { source: "cc-maple", target: "c-poppi", label: "competes with", strength: 0.3 },
  { source: "cc-maple", target: "c-olipop", label: "competes with", strength: 0.3 },
  { source: "cc-maple", target: "c-topo", label: "competes with", strength: 0.3 },
  { source: "cc-maple", target: "c-liquid-death", label: "competes with", strength: 0.2 },
  // Channels to center
  { source: "ch-tourist", target: "cc-maple", label: "no competition zone" },
  { source: "ch-souvenir", target: "cc-maple", label: "natural adjacency" },
  { source: "ch-bars", target: "cc-maple", label: "cocktail base" },
  { source: "ch-grocery", target: "cc-maple" },
  { source: "ch-costco", target: "cc-maple", label: "variety pack needed" },
  // Segments to channels
  { source: "seg-genz", target: "ch-tourist" },
  { source: "seg-millennials", target: "ch-bars" },
  { source: "seg-genx", target: "ch-grocery" },
  { source: "seg-bartenders", target: "ch-bars", label: "evaluates" },
  { source: "seg-sober", target: "ch-bars", label: "seeks NA options" },
  { source: "seg-household", target: "ch-costco", label: "needs format" },
  // Concepts to center
  { source: "con-buy-canadian", target: "cc-maple" },
  { source: "con-maple-souvenir", target: "ch-tourist" },
  { source: "con-maple-souvenir", target: "ch-souvenir" },
  { source: "con-shania", target: "seg-genx" },
  { source: "con-shania", target: "seg-genz", label: "content angle" },
  { source: "con-blue-jays", target: "ch-bars" },
  { source: "con-conversion", target: "ch-bars" },
  { source: "con-awareness", target: "seg-genz", label: "net new" },
  // Markets to channels
  { source: "m-niagara", target: "ch-tourist" },
  { source: "m-banff", target: "ch-tourist" },
  { source: "m-montreal", target: "ch-bars" },
  { source: "m-vancouver", target: "ch-bars" },
  { source: "m-toronto", target: "ch-bars" },
  { source: "m-toronto", target: "ch-tourist" },
];

// ─── Knowledge Graph — Micro-Nodes (second wave, denser graph) ─────────────────

export const microNodes: GraphNode[] = [
  // Specific tourist locations
  { id: "m-cn-tower", label: "CN Tower Gift Shop", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-niagara-falls-hotel", label: "Niagara Marriott", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-banff-springs", label: "Banff Springs Hotel", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-whistler", label: "Whistler Village", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-distillery", label: "Distillery District", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-gastown", label: "Gastown", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-old-port", label: "Old Port Montréal", group: "micro", color: "#14B8A6", isMicro: true },
  { id: "m-clifton-hill", label: "Clifton Hill", group: "micro", color: "#14B8A6", isMicro: true },
  // Specific retailers
  { id: "r-shoppers", label: "Shoppers Drug Mart", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-sobeys", label: "Sobeys", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-metro", label: "Metro", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-whole-foods", label: "Whole Foods CA", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-7eleven", label: "7-Eleven", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-lcbo", label: "LCBO", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-loblaws", label: "Loblaws", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-iga", label: "IGA Québec", group: "micro", color: "#10B981", isMicro: true },
  { id: "r-farm-boy", label: "Farm Boy", group: "micro", color: "#10B981", isMicro: true },
  // Social media contexts
  { id: "sm-tiktok-maple", label: "#MapleWater TikTok", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "sm-ig-aesthetic", label: "#ClearlyCanadian IG", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "sm-reddit-cc", label: "r/ClearlyCanadian", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "sm-cocktail-ig", label: "#SparklingCocktails IG", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "sm-buycanadian", label: "#BuyCanadian Twitter", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "sm-nostalgia-tiktok", label: "#90sBeverages TikTok", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "sm-sober-curious", label: "#SoberCurious Community", group: "micro", color: "#8B5CF6", isMicro: true },
  // Specific competitor products
  { id: "cp-lacroix-lime", label: "LaCroix Lime", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-lacroix-pamplemousse", label: "LaCroix Pamplemousse", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-bubly-cherry", label: "Bubly Cherry", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-bubly-mango", label: "Bubly Mango", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-poppi-strawberry", label: "Poppi Strawberry Lemon", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-olipop-vintage", label: "Olipop Vintage Cola", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-spindrift-lemon", label: "Spindrift Lemon", group: "micro", color: "#EF4444", isMicro: true },
  { id: "cp-topo-mineral", label: "Topo Chico Mineral", group: "micro", color: "#EF4444", isMicro: true },
  // Concepts micro
  { id: "con-crowdfunding", label: "Indiegogo Campaign", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-nostalgia-90s", label: "90s Nostalgia Wave", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-tariff-tensions", label: "Tariff Tensions 2025", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-clean-label", label: "Clean Label Movement", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-maple-extract", label: "Real Maple Extract", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-zero-sugar-trend", label: "Zero Sugar Trend", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-celebrity-collab", label: "Celebrity Collab Model", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "con-glass-premium", label: "Glass Premium Signal", group: "micro", color: "#F59E0B", isMicro: true },
  // Bartender specific
  { id: "bar-old-fashioned", label: "Northern Old Fashioned", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "bar-maple-gin", label: "Maple Gin Fizz", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "bar-mocktail", label: "Maple Mocktail Menu", group: "micro", color: "#8B5CF6", isMicro: true },
  { id: "bar-spec", label: "Back Bar Display", group: "micro", color: "#8B5CF6", isMicro: true },
  // Price micro
  { id: "price-comparison", label: "$1.33/can vs $0.42 LaCroix", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "price-variety-pack", label: "12-pack Variety Format", group: "micro", color: "#F59E0B", isMicro: true },
  { id: "price-tourism-premium", label: "Tourist Price Tolerance +40%", group: "micro", color: "#F59E0B", isMicro: true },
  // Channels micro
  { id: "ch-airport", label: "YYZ/YVR Airport Retail", group: "micro", color: "#10B981", isMicro: true },
  { id: "ch-ski-resort", label: "Ski Resort F&B", group: "micro", color: "#10B981", isMicro: true },
  { id: "ch-national-park", label: "National Park Stores", group: "micro", color: "#10B981", isMicro: true },
];

export const microLinks: GraphLink[] = [
  // Tourist locations to tourist channel
  { source: "m-cn-tower", target: "ch-tourist", isDotted: true },
  { source: "m-niagara-falls-hotel", target: "m-niagara", isDotted: true },
  { source: "m-banff-springs", target: "m-banff", isDotted: true },
  { source: "m-whistler", target: "m-vancouver", isDotted: true },
  { source: "m-distillery", target: "m-toronto", isDotted: true },
  { source: "m-gastown", target: "m-vancouver", isDotted: true },
  { source: "m-old-port", target: "m-montreal", isDotted: true },
  { source: "m-clifton-hill", target: "m-niagara", isDotted: true },
  // Retailers to channel
  { source: "r-shoppers", target: "ch-grocery", isDotted: true },
  { source: "r-sobeys", target: "ch-grocery", isDotted: true },
  { source: "r-metro", target: "ch-grocery", isDotted: true },
  { source: "r-whole-foods", target: "ch-grocery", isDotted: true },
  { source: "r-7eleven", target: "ch-convenience", isDotted: true },
  { source: "r-lcbo", target: "ch-bars", isDotted: true },
  { source: "r-loblaws", target: "ch-grocery", isDotted: true },
  { source: "r-iga", target: "ch-grocery", isDotted: true },
  { source: "r-farm-boy", target: "ch-grocery", isDotted: true },
  // Social media to segments
  { source: "sm-tiktok-maple", target: "seg-genz", isDotted: true },
  { source: "sm-ig-aesthetic", target: "seg-millennials", isDotted: true },
  { source: "sm-reddit-cc", target: "seg-genx", isDotted: true },
  { source: "sm-cocktail-ig", target: "seg-bartenders", isDotted: true },
  { source: "sm-buycanadian", target: "con-buy-canadian", isDotted: true },
  { source: "sm-nostalgia-tiktok", target: "con-shania", isDotted: true },
  { source: "sm-sober-curious", target: "seg-sober", isDotted: true },
  // Competitor products to parent competitors
  { source: "cp-lacroix-lime", target: "c-lacroix", isDotted: true },
  { source: "cp-lacroix-pamplemousse", target: "c-lacroix", isDotted: true },
  { source: "cp-bubly-cherry", target: "c-lacroix", isDotted: true },
  { source: "cp-bubly-mango", target: "c-lacroix", isDotted: true },
  { source: "cp-poppi-strawberry", target: "c-poppi", isDotted: true },
  { source: "cp-olipop-vintage", target: "c-olipop", isDotted: true },
  { source: "cp-spindrift-lemon", target: "c-topo", isDotted: true },
  { source: "cp-topo-mineral", target: "c-topo", isDotted: true },
  // Concepts micro to main
  { source: "con-crowdfunding", target: "con-shania", isDotted: true },
  { source: "con-nostalgia-90s", target: "seg-genx", isDotted: true },
  { source: "con-tariff-tensions", target: "con-buy-canadian", isDotted: true },
  { source: "con-clean-label", target: "p-essence", isDotted: true },
  { source: "con-maple-extract", target: "cc-maple", isDotted: true },
  { source: "con-zero-sugar-trend", target: "p-zero-sugar", isDotted: true },
  { source: "con-celebrity-collab", target: "con-shania", isDotted: true },
  { source: "con-glass-premium", target: "p-glass-bottle", isDotted: true },
  // Bar specifics
  { source: "bar-old-fashioned", target: "seg-bartenders", isDotted: true },
  { source: "bar-maple-gin", target: "seg-bartenders", isDotted: true },
  { source: "bar-mocktail", target: "seg-sober", isDotted: true },
  { source: "bar-spec", target: "ch-bars", isDotted: true },
  // Price
  { source: "price-comparison", target: "seg-household", isDotted: true },
  { source: "price-variety-pack", target: "ch-costco", isDotted: true },
  { source: "price-tourism-premium", target: "ch-tourist", isDotted: true },
  // Channels micro
  { source: "ch-airport", target: "ch-tourist", isDotted: true },
  { source: "ch-ski-resort", target: "m-banff", isDotted: true },
  { source: "ch-national-park", target: "ch-tourist", isDotted: true },
];

// ─── Simulation Agents (12 featured) ──────────────────────────────────────────

export const simulationAgents: SimAgent[] = [
  {
    id: "ethan", name: "Ethan", age: 31, location: "West End, Toronto",
    archetype: "The Craft Curator", segment: "Millennial",
    awareness_level: "aware",
    maple_stance: "If carbonation and sweetness are dialed in, this could save me prep time behind the bar.",
    persona_id: "ca_mill_loyal", handle: "@ethan_westend", avatar_color: "#3B82F6",
  },
  {
    id: "aisha", name: "Aisha", age: 21, location: "Atlanta, GA",
    archetype: "The Aesthetic Chaser", segment: "Gen Z",
    awareness_level: "never_heard",
    maple_stance: "Maple sparkling water? That's very specific but it's giving fall cabin vibes honestly.",
    persona_id: "ca_genz_potential", handle: "@aisha_atx", avatar_color: "#EC4899",
  },
  {
    id: "doug", name: "Doug", age: 38, location: "Kitchener-Waterloo, ON",
    archetype: "The Nostalgic Loyalist", segment: "Gen X",
    awareness_level: "loyal",
    maple_stance: "As long as they don't touch Mountain Blackberry, I'm cautiously optimistic.",
    persona_id: "ca_mill_loyal", handle: "@doug_kw", avatar_color: "#10B981",
  },
  {
    id: "marie", name: "Marie", age: 24, location: "Montréal, QC",
    archetype: "The Sober Curious Trendsetter", segment: "Gen Z",
    awareness_level: "vaguely_aware",
    maple_stance: "Un maple mocktail au lieu de mon Perrier? OUI. Finally something interesting.",
    persona_id: "ca_genz_sober_curious", handle: "@marie_mtl", avatar_color: "#F59E0B",
  },
  {
    id: "linda", name: "Linda", age: 52, location: "North Vancouver, BC",
    archetype: "The Proud Canadian", segment: "Gen X",
    awareness_level: "loyal",
    maple_stance: "Oh my goodness, maple! That is SO Canadian. I remember buying CC after school. I'm emotional.",
    persona_id: "ca_mill_loyal", handle: "@linda_van", avatar_color: "#8B5CF6",
  },
  {
    id: "tyler", name: "Tyler", age: 23, location: "Halifax, NS",
    archetype: "The Indifferent Impulse Buyer", segment: "Gen Z",
    awareness_level: "never_heard",
    maple_stance: "Maple sparkling water? Weird. If it's cold and cheap at 7-Eleven, sure whatever.",
    persona_id: "ca_genz_potential", handle: "@tyler_dal", avatar_color: "#6B7280",
  },
  {
    id: "sofia", name: "Sofia", age: 29, location: "Portland, OR",
    archetype: "The Ingredient Inspector", segment: "Millennial",
    awareness_level: "vaguely_aware",
    maple_stance: "If it's clean ingredients and actually natural maple — not 'natural flavors' — I'm interested.",
    persona_id: "ca_mill_potential", handle: "@sofia_pdx", avatar_color: "#14B8A6",
  },
  {
    id: "raj", name: "Raj", age: 34, location: "Toronto, ON",
    archetype: "The Premium Aesthete", segment: "Millennial",
    awareness_level: "aware",
    maple_stance: "CC Maple in the glass bottle on my bar cart? Genuinely refined. Would pair beautifully with bourbon.",
    persona_id: "ca_mill_potential", handle: "@raj_to", avatar_color: "#F97316",
  },
  {
    id: "karen-h", name: "Karen H.", age: 44, location: "Alpharetta, GA",
    archetype: "The Household Value Seeker", segment: "Gen X",
    awareness_level: "never_heard",
    maple_stance: "Could be fun for Thanksgiving, but will this be at Costco in a variety pack?",
    persona_id: "ca_mill_loyal", handle: "@karen_atl", avatar_color: "#EF4444",
  },
  {
    id: "jake", name: "Jake", age: 32, location: "Vancouver, BC",
    archetype: "The Design-First Millennial", segment: "Millennial",
    awareness_level: "aware",
    maple_stance: "Bringing CC Maple to Thanksgiving instead of wine. Very Canadian move. I'm in.",
    persona_id: "ca_mill_potential", handle: "@jake_to", avatar_color: "#06B6D4",
  },
  {
    id: "marcus", name: "Marcus", age: 35, location: "Chicago, IL",
    archetype: "The Rediscoverer", segment: "Millennial",
    awareness_level: "never_heard",
    maple_stance: "Wait, Clearly Canadian is still around? AND they have a maple flavor? Where do I buy this?",
    persona_id: "ca_mill_potential", handle: "@marcus_chi", avatar_color: "#A78BFA",
  },
  {
    id: "chloe", name: "Chloe", age: 22, location: "Toronto, ON",
    archetype: "The TikTok Native", segment: "Gen Z",
    awareness_level: "vaguely_aware",
    maple_stance: "My mom told me about this brand?? Apparently huge in the 90s and they have a maple one now. The comeback story is kinda cool.",
    persona_id: "ca_genz_potential", handle: "@chloe_uoft", avatar_color: "#FB7185",
  },
];

// ─── Swarm Segments ────────────────────────────────────────────────────────────

export const swarmSegments: SwarmSegment[] = [
  { name: "Gen Z", color: "#3B82F6", count: 350, persona_ids: ["aisha", "tyler", "marie", "chloe"] },
  { name: "Millennials", color: "#10B981", count: 300, persona_ids: ["ethan", "sofia", "raj", "jake", "marcus"] },
  { name: "Gen X", color: "#F59E0B", count: 250, persona_ids: ["doug", "linda", "karen-h"] },
  { name: "Sober Curious", color: "#8B5CF6", count: 150, persona_ids: ["marie", "sofia"] },
  { name: "Bartenders/Industry", color: "#EF4444", count: 100, persona_ids: ["ethan", "raj"] },
  { name: "Household/Parents", color: "#FBBF24", count: 97, persona_ids: ["karen-h", "linda"] },
];

// ─── Featured Social Posts ─────────────────────────────────────────────────────

export const featuredPosts: SimPost[] = [
  {
    id: "fp-1", type: "featured", platform: "twitter",
    persona_id: "ethan", persona_name: "Ethan", handle: "@ethan_westend",
    avatar_color: "#3B82F6",
    body: "Just got pitched a sparkling maple water as a cocktail base. Skeptical but... maple in an Old Fashioned already works. If the carbonation and sweetness levels are right, this could actually save me prep time. Sending a DM for samples.",
    likes: 47, replies: 12, timestamp_label: "2m ago",
    sentiment: "positive",
  },
  {
    id: "fp-2", type: "featured", platform: "twitter",
    persona_id: "aisha", persona_name: "Aisha", handle: "@aisha_atx",
    avatar_color: "#EC4899",
    body: "ok wait — maple sparkling water?? that's very specific but it's giving fall cabin vibes honestly. the glass bottle is kinda gorgeous too 👀",
    likes: 89, replies: 23, timestamp_label: "4m ago",
    sentiment: "positive",
  },
  {
    id: "fp-3", type: "featured", platform: "twitter",
    persona_id: "doug", persona_name: "Doug", handle: "@doug_kw",
    avatar_color: "#10B981",
    body: "Interesting to see CC expanding the lineup. As long as they don't touch Mountain Blackberry, I'm cautiously optimistic. But maple? That's a bold move. Need to taste it first.",
    likes: 34, replies: 8, timestamp_label: "6m ago",
    sentiment: "neutral",
  },
  {
    id: "fp-4", type: "featured", platform: "twitter",
    persona_id: "marie", persona_name: "Marie", handle: "@marie_mtl",
    avatar_color: "#F59E0B",
    body: "Un maple mocktail au lieu de mon Perrier ennuyeux au bar?? OUI. Finally a non-alcoholic option that actually sounds interesting. Where can I find this in Montréal?",
    likes: 112, replies: 31, timestamp_label: "8m ago",
    sentiment: "positive",
  },
  {
    id: "fp-5", type: "featured", platform: "twitter",
    persona_id: "linda", persona_name: "Linda", handle: "@linda_van",
    avatar_color: "#8B5CF6",
    body: "Oh my goodness, maple! That is SO Canadian. I remember buying CC at the corner store after school and now they're making a maple version? I'm emotional. 🍁💙",
    likes: 203, replies: 47, timestamp_label: "10m ago",
    sentiment: "positive",
  },
  {
    id: "fp-6", type: "featured", platform: "twitter",
    persona_id: "tyler", persona_name: "Tyler", handle: "@tyler_dal",
    avatar_color: "#6B7280",
    body: "maple sparkling water? weird. i mean if it's cold and in the cooler at 7-eleven for like $1.79 sure whatever",
    likes: 11, replies: 2, timestamp_label: "12m ago",
    sentiment: "neutral",
  },
  {
    id: "fp-7", type: "featured", platform: "twitter",
    persona_id: "sofia", persona_name: "Sofia", handle: "@sofia_pdx",
    avatar_color: "#14B8A6",
    body: "Ingredient check first — is there sugar? What's the sweetener? If it's clean ingredients and actually natural maple, I'm interested. Maple IS a natural sweetener after all.",
    likes: 67, replies: 15, timestamp_label: "14m ago",
    sentiment: "neutral",
  },
  {
    id: "fp-8", type: "featured", platform: "twitter",
    persona_id: "raj", persona_name: "Raj", handle: "@raj_to",
    avatar_color: "#F97316",
    body: "A maple sparkling water in CC's glass bottle on my bar cart? That's genuinely refined. Would pair beautifully with bourbon. The aesthetic alone sells it.",
    likes: 156, replies: 28, timestamp_label: "16m ago",
    sentiment: "positive",
  },
  {
    id: "fp-9", type: "featured", platform: "twitter",
    persona_id: "karen-h", persona_name: "Karen H.", handle: "@karen_atl",
    avatar_color: "#EF4444",
    body: "Maple could be fun for Thanksgiving dinner! But would the kids drink it? And what's the price vs our usual LaCroix 12-pack at Costco? That's the real question.",
    likes: 29, replies: 11, timestamp_label: "18m ago",
    sentiment: "neutral",
  },
  {
    id: "fp-10", type: "featured", platform: "twitter",
    persona_id: "jake", persona_name: "Jake", handle: "@jake_to",
    avatar_color: "#06B6D4",
    body: "Bringing CC Maple to Thanksgiving dinner instead of wine. Very Canadian move. My in-laws will either love it or look at me weird. I'm in either way.",
    likes: 88, replies: 19, timestamp_label: "20m ago",
    sentiment: "positive",
  },
  {
    id: "fp-11", type: "featured", platform: "twitter",
    persona_id: "marcus", persona_name: "Marcus", handle: "@marcus_chi",
    avatar_color: "#A78BFA",
    body: "Wait, Clearly Canadian is still around? AND they have a maple flavor now? Where do I buy this? Maple bourbon cocktail sounds amazing.",
    likes: 74, replies: 22, timestamp_label: "22m ago",
    sentiment: "positive",
  },
  {
    id: "fp-12", type: "featured", platform: "twitter",
    persona_id: "chloe", persona_name: "Chloe", handle: "@chloe_uoft",
    avatar_color: "#FB7185",
    body: "honestly my mom just told me about this brand?? apparently it was huge in the 90s and they have a maple one now. the crowdfunding comeback story is actually kinda cool lowkey",
    likes: 143, replies: 37, timestamp_label: "24m ago",
    sentiment: "positive",
  },
  // Replies
  {
    id: "fp-13", type: "featured", platform: "twitter",
    persona_id: "aisha", persona_name: "Aisha", handle: "@aisha_atx",
    avatar_color: "#EC4899",
    body: "replying to @chloe_uoft — the comeback story is literally content gold. a brand that fans brought back from the dead?? that's a whole tiktok series waiting to happen",
    likes: 91, replies: 14, timestamp_label: "26m ago",
    sentiment: "positive",
  },
  {
    id: "fp-14", type: "featured", platform: "twitter",
    persona_id: "ethan", persona_name: "Ethan", handle: "@ethan_westend",
    avatar_color: "#3B82F6",
    body: "replying to @raj_to — Agreed on the bourbon pairing. I'm thinking: 2oz bourbon, 4oz CC Maple, dash of bitters, orange peel. 'The Northern Old Fashioned.' Putting it on the menu this weekend.",
    likes: 178, replies: 44, timestamp_label: "28m ago",
    sentiment: "positive",
  },
  {
    id: "fp-15", type: "featured", platform: "twitter",
    persona_id: "doug", persona_name: "Doug", handle: "@doug_kw",
    avatar_color: "#10B981",
    body: "replying to @ethan_westend — Now THAT is how you launch a new flavor. Get it into cocktail bars first. Let the product speak for itself. Don't over-market it.",
    likes: 63, replies: 9, timestamp_label: "30m ago",
    sentiment: "positive",
  },
  // Reddit posts
  {
    id: "fp-16", type: "featured", platform: "reddit",
    persona_id: "ethan", persona_name: "ethan_westend", handle: "u/ethan_westend",
    avatar_color: "#3B82F6",
    body: "Bartender here. Maple as a sparkling mixer base is genuinely useful. I already use maple syrup in specs. A pre-carbonated version saves prep and adds consistency. Where can I order cases?",
    likes: 47, replies: 8, timestamp_label: "31m ago",
    sentiment: "positive", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-17", type: "featured", platform: "reddit",
    persona_id: "raj", persona_name: "raj_to", handle: "u/raj_to",
    avatar_color: "#F97316",
    body: "The glass bottle placement on a back bar would be beautiful. CC already has the best bottle in the sparkling water category. This is a premium move that'll work.",
    likes: 23, replies: 4, timestamp_label: "33m ago",
    sentiment: "positive", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-18", type: "featured", platform: "reddit",
    persona_id: "karen-h", persona_name: "karen_atl", handle: "u/karen_atl",
    avatar_color: "#EF4444",
    body: "Real question: will this be available at Costco in a variety pack? Because that's the only way my household is switching from LaCroix. We go through 2 cases a week.",
    likes: 31, replies: 12, timestamp_label: "35m ago",
    sentiment: "neutral", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-19", type: "featured", platform: "reddit",
    persona_id: "sofia", persona_name: "sofia_pdx", handle: "u/sofia_pdx",
    avatar_color: "#14B8A6",
    body: "If it's actually maple and not 'natural flavors' that taste nothing like maple, I'm genuinely interested. Need to see the nutrition label. Maple IS a natural sweetener, so this could work for me.",
    likes: 19, replies: 6, timestamp_label: "37m ago",
    sentiment: "neutral", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-20", type: "featured", platform: "reddit",
    persona_id: "tyler", persona_name: "tyler_dal", handle: "u/tyler_dal",
    avatar_color: "#6B7280",
    body: "I mean sure if it's at the gas station",
    likes: 8, replies: 1, timestamp_label: "39m ago",
    sentiment: "neutral", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-21", type: "featured", platform: "reddit",
    persona_id: "chloe", persona_name: "chloe_uoft", handle: "u/chloe_uoft",
    avatar_color: "#FB7185",
    body: "ngl the souvenir shop idea is smart. tourists already buy maple everything. why not maple sparkling water in that iconic glass bottle? it basically sells itself as a Canadian souvenir.",
    likes: 15, replies: 5, timestamp_label: "41m ago",
    sentiment: "positive", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-22", type: "featured", platform: "reddit",
    persona_id: "doug", persona_name: "doug_kw", handle: "u/doug_kw",
    avatar_color: "#10B981",
    body: "For what it's worth: CC Originals had zero marketing budget and still built a cult following. If the product is great, the community will carry it. Trust the formula, don't dilute the brand.",
    likes: 52, replies: 9, timestamp_label: "43m ago",
    sentiment: "positive", subreddit: "r/ClearlyCanadian",
  },
  {
    id: "fp-23", type: "featured", platform: "reddit",
    persona_id: "linda", persona_name: "linda_van", handle: "u/linda_van",
    avatar_color: "#8B5CF6",
    body: "My son showed me this thread. I was buying CC before he was born. The fact that fans brought it back and now they're launching maple? This is the most Canadian story. I'm buying a case.",
    likes: 87, replies: 21, timestamp_label: "45m ago",
    sentiment: "positive", subreddit: "r/ClearlyCanadian",
  },
];

// ─── Background Agent Posts (40+ one-liners) ──────────────────────────────────

export const backgroundPosts: SimPost[] = [
  { id: "bg-1", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0847", handle: "@Agent_0847", avatar_color: "#4B5563", body: "the glass bottle is so aesthetic", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0847", segment: "Gen Z", city: "Toronto" },
  { id: "bg-2", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0219", handle: "@Agent_0219", avatar_color: "#4B5563", body: "maple? I'd try it", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0219", segment: "Millennial", city: "Calgary" },
  { id: "bg-3", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0634", handle: "@Agent_0634", avatar_color: "#4B5563", body: "reminds me of the 90s CC bottles", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0634", segment: "Gen X", city: "Ottawa" },
  { id: "bg-4", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0412", handle: "@Agent_0412", avatar_color: "#4B5563", body: "need to see this on tiktok first", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0412", segment: "Gen Z", city: "Austin" },
  { id: "bg-5", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0891", handle: "@Agent_0891", avatar_color: "#4B5563", body: "would buy this for a dinner party", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0891", segment: "Millennial", city: "Vancouver" },
  { id: "bg-6", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0156", handle: "@Agent_0156", avatar_color: "#4B5563", body: "finally something other than LaCroix", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0156", segment: "Gen X", city: "Montreal" },
  { id: "bg-7", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #1043", handle: "@Agent_1043", avatar_color: "#4B5563", body: "is it actually zero sugar though?", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#1043", segment: "Gen Z", city: "Portland" },
  { id: "bg-8", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0728", handle: "@Agent_0728", avatar_color: "#4B5563", body: "wait CC is still around??", likes: 8, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0728", segment: "Millennial", city: "Chicago" },
  { id: "bg-9", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0367", handle: "@Agent_0367", avatar_color: "#4B5563", body: "tourists would love this", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0367", segment: "Gen X", city: "Niagara Falls" },
  { id: "bg-10", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0592", handle: "@Agent_0592", avatar_color: "#4B5563", body: "maple + gin could work", likes: 9, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0592", segment: "Bartender", city: "Montreal" },
  { id: "bg-11", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0981", handle: "@Agent_0981", avatar_color: "#4B5563", body: "would the kids drink it?", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0981", segment: "Parent", city: "Suburban ON" },
  { id: "bg-12", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0445", handle: "@Agent_0445", avatar_color: "#4B5563", body: "the comeback story is cool ngl", likes: 7, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0445", segment: "Gen Z", city: "Waterloo" },
  { id: "bg-13", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0773", handle: "@Agent_0773", avatar_color: "#4B5563", body: "bring this to the Jays game", likes: 12, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0773", segment: "Millennial", city: "Toronto" },
  { id: "bg-14", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0234", handle: "@Agent_0234", avatar_color: "#4B5563", body: "better than boring soda water at bars", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0234", segment: "Sober Curious", city: "Vancouver" },
  { id: "bg-15", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0688", handle: "@Agent_0688", avatar_color: "#4B5563", body: "I'd buy this as a souvenir over maple candy honestly", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0688", segment: "Tourist", city: "International" },
  { id: "bg-16", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0321", handle: "@Agent_0321", avatar_color: "#4B5563", body: "hard pass, maple is not a flavor for water", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0321", segment: "Gen X", city: "Edmonton" },
  { id: "bg-17", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0543", handle: "@Agent_0543", avatar_color: "#4B5563", body: "maple syrup everything is getting old tbh", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0543", segment: "Millennial", city: "Seattle" },
  { id: "bg-18", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0102", handle: "@Agent_0102", avatar_color: "#4B5563", body: "need this for a mocktail menu update", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0102", segment: "Bartender", city: "Toronto" },
  { id: "bg-19", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0756", handle: "@Agent_0756", avatar_color: "#4B5563", body: "my daughter would go crazy for this packaging", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0756", segment: "Gen X", city: "Mississauga" },
  { id: "bg-20", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0498", handle: "@Agent_0498", avatar_color: "#4B5563", body: "price check before I get excited", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0498", segment: "Gen Z", city: "Hamilton" },
  { id: "bg-21", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0834", handle: "@Agent_0834", avatar_color: "#4B5563", body: "saw this at the CN Tower shop. bought three", likes: 14, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0834", segment: "Tourist", city: "New York" },
  { id: "bg-22", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0267", handle: "@Agent_0267", avatar_color: "#4B5563", body: "maple + sparkling water is such a Canadian brand move. love it", likes: 8, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0267", segment: "Millennial", city: "Ottawa" },
  { id: "bg-23", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0619", handle: "@Agent_0619", avatar_color: "#4B5563", body: "asking my bar manager to stock this tomorrow", likes: 11, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0619", segment: "Bartender", city: "Calgary" },
  { id: "bg-24", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0185", handle: "@Agent_0185", avatar_color: "#4B5563", body: "would stock up at Costco if the price is right", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0185", segment: "Parent", city: "Barrie" },
  { id: "bg-25", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0943", handle: "@Agent_0943", avatar_color: "#4B5563", body: "the Shania x CC collab is so perfectly on brand", likes: 17, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0943", segment: "Gen X", city: "Timmins" },
  { id: "bg-26", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0371", handle: "@Agent_0371", avatar_color: "#4B5563", body: "I don't drink alcohol. this would be my bar option", likes: 7, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0371", segment: "Sober Curious", city: "Edmonton" },
  { id: "bg-27", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0822", handle: "@Agent_0822", avatar_color: "#4B5563", body: "the 90s nostalgia angle is overdone but CC earns it", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0822", segment: "Millennial", city: "Kingston" },
  { id: "bg-28", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0474", handle: "@Agent_0474", avatar_color: "#4B5563", body: "can we get this at the Banff Springs hotel bar", likes: 9, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0474", segment: "Tourist", city: "Calgary" },
  { id: "bg-29", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0138", handle: "@Agent_0138", avatar_color: "#4B5563", body: "if this doesn't taste like real maple I'm going back to pellegrino", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0138", segment: "Gen X", city: "Toronto" },
  { id: "bg-30", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0667", handle: "@Agent_0667", avatar_color: "#4B5563", body: "posting this on my cottagecore account immediately", likes: 21, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0667", segment: "Gen Z", city: "Muskoka" },
  { id: "bg-31", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0289", handle: "@Agent_0289", avatar_color: "#4B5563", body: "three of my friends asked where I got this in one night", likes: 13, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0289", segment: "Millennial", city: "Toronto" },
  { id: "bg-32", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0512", handle: "@Agent_0512", avatar_color: "#4B5563", body: "maple flavored water sounds like a gimmick but the brand history makes it work", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0512", segment: "Gen X", city: "London ON" },
  { id: "bg-33", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0748", handle: "@Agent_0748", avatar_color: "#4B5563", body: "picked this up at the airport. best impulse buy", likes: 10, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0748", segment: "Millennial", city: "YYZ" },
  { id: "bg-34", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0394", handle: "@Agent_0394", avatar_color: "#4B5563", body: "this brand collabing with maple syrup category is genius distribution play", likes: 8, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0394", segment: "Millennial", city: "Vancouver" },
  { id: "bg-35", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0856", handle: "@Agent_0856", avatar_color: "#4B5563", body: "hard to justify $3+ for sparkling water but the bottle is beautiful", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0856", segment: "Gen Z", city: "Kingston" },
  { id: "bg-36", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0123", handle: "@Agent_0123", avatar_color: "#4B5563", body: "putting this in a cocktail tonight", likes: 7, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0123", segment: "Bartender", city: "Halifax" },
  { id: "bg-37", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0965", handle: "@Agent_0965", avatar_color: "#4B5563", body: "my partner is obsessed with anything maple. this is a birthday gift idea", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0965", segment: "Millennial", city: "Waterloo" },
  { id: "bg-38", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0407", handle: "@Agent_0407", avatar_color: "#4B5563", body: "if I find this in a Whistler gift shop I'm buying the whole shelf", likes: 9, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0407", segment: "Tourist", city: "Vancouver" },
  { id: "bg-39", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0631", handle: "@Agent_0631", avatar_color: "#4B5563", body: "buy canadian is not just a hashtag anymore, it's how I shop now", likes: 15, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0631", segment: "Gen X", city: "Ottawa" },
  { id: "bg-40", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0278", handle: "@Agent_0278", avatar_color: "#4B5563", body: "this would be perfect on a charcuterie board at the cottage", likes: 18, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0278", segment: "Gen X", city: "Muskoka" },
  { id: "bg-41", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0549", handle: "@Agent_0549", avatar_color: "#4B5563", body: "zero sugar is a must for me. checking the label before buying", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0549", segment: "Millennial", city: "Toronto" },
  { id: "bg-42", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0814", handle: "@Agent_0814", avatar_color: "#4B5563", body: "maple water sounds weird but I said the same about matcha water and now I drink it daily", likes: 11, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0814", segment: "Gen Z", city: "Montreal" },
  { id: "bg-43", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0162", handle: "@Agent_0162", avatar_color: "#4B5563", body: "not a fan of flavored water in general but respect the brand", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0162", segment: "Boomer", city: "Calgary" },
  { id: "bg-44", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0736", handle: "@Agent_0736", avatar_color: "#4B5563", body: "literally just added this to my shoppers list", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0736", segment: "Millennial", city: "Hamilton" },
  { id: "bg-45", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0389", handle: "@Agent_0389", avatar_color: "#4B5563", body: "took me back to 1994 just seeing the bottle", likes: 16, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0389", segment: "Gen X", city: "Windsor" },
];

// ─── Interleaved Post Sequence ─────────────────────────────────────────────────
// Build the full sequence: featured posts interspersed with background posts

function buildPostSequence(): SimPost[] {
  const sequence: SimPost[] = [];
  const bgPool = [...backgroundPosts];
  let bgIdx = 0;

  featuredPosts.forEach((post, i) => {
    sequence.push(post);
    // Add 3-4 background posts after each featured post
    const count = (i < 5) ? 4 : 3;
    for (let j = 0; j < count && bgIdx < bgPool.length; j++, bgIdx++) {
      sequence.push(bgPool[bgIdx]);
    }
  });

  return sequence;
}

export const allPosts: SimPost[] = buildPostSequence();

// ─── Sentiment Timeline ────────────────────────────────────────────────────────

export const sentimentTimeline: SentimentPoint[] = [
  { t: 0, positive: 89, neutral: 31, friction: 19 },
  { t: 10, positive: 187, neutral: 58, friction: 31 },
  { t: 20, positive: 312, neutral: 91, friction: 48 },
  { t: 30, positive: 445, neutral: 118, friction: 67 },
  { t: 40, positive: 567, neutral: 148, friction: 89 },
  { t: 50, positive: 672, neutral: 178, friction: 112 },
  { t: 60, positive: 749, neutral: 205, friction: 139 },
  { t: 70, positive: 847, neutral: 231, friction: 169 },
];

// ─── Report Text ───────────────────────────────────────────────────────────────

export const reportText = `## CC Maple Zero Sugar — Swarm Intelligence Report

**Based on analysis of 1,247 simulated consumer agents across 6 demographic segments**

---

### Executive Summary

CC Maple Zero Sugar generates strong positive reception across consumer segments, with 847 of 1,247 agents (68%) expressing positive purchase intent. The strongest consensus emerged among the 350 Gen Z agents, 73% of whom indicated they would try CC Maple if discovered through social media or a peer recommendation. Among 300 Millennial agents, 71% expressed strong interest — particularly those who discovered CC through the premium glass bottle format.

The tourist retail channel emerged as a surprise consensus point — even skeptical personas acknowledged the logic of placing maple sparkling water alongside Canada's #1 souvenir category. Key tension: price-sensitive household buyers need a Costco-format offering to convert, while premium buyers are ready to purchase immediately at current pricing.

---

### Sentiment Distribution

- **Strong Positive** (847 agents / 68%): Ethan, Raj, Marie, Linda, Jake and their segment clusters
- **Neutral / Conditional** (231 agents / 19%): Sofia, Karen — ingredient verification and price format needed
- **Friction** (169 agents / 13%): Doug (brand dilution risk), Tyler (pure indifference)

---

### Key Themes (by agent mention frequency)

- "Cocktail & Mixer Potential" — cited by 7 of 12 featured agents; 52% of bartender segment
- "Canadian Identity" — cited by 6 of 12; strongest among Gen X (78% of segment)
- "Tourist Channel Opportunity" — cited by 5 of 12; near-universal in international tourist segment
- "Price vs LaCroix" — cited by 4 of 12; primary decision gate for household segment
- "Glass Bottle Aesthetic" — cited by 4 of 12; highest among Millennial premium cluster
- "Nostalgia Trigger" — cited by 3 of 12 named agents; 61% of Gen X segment

---

### Strategic Recommendations

1. **Lead launch through bartender seeding** — Ethan-type personas are highest-conviction, fastest-converting. Bar placement creates word-of-mouth flywheel into Gen Z and Millennial segments.

2. **Position in tourist retail alongside maple syrup** — Zero sparkling water competition in this channel. Price tolerance is 40% higher in tourist contexts. Niagara Falls and Banff are the priority markets.

3. **Create Costco-format variety pack** — Karen-type household buyers represent 97 agents (8% of swarm) but are high-volume purchasers. A 12-pack variety format removes the primary objection.

4. **Leverage the comeback story as content** — Multiple agents cited the Indiegogo comeback and Shania Twain campaign as compelling. Aisha and Chloe represent a segment that won't buy without social proof — but will become advocates once they do.

---

### Risk Factors

1. **Brand dilution concern** — Doug segment (loyal Gen X base) worries about line extensions diluting the original. Launch as a clearly separate product line, not a replacement.

2. **Price barrier for value buyers** — $1.33/can vs. $0.42/can LaCroix is a 3x premium. Requires strong channel/context justification (tourist retail, bars) rather than grocery head-to-head.

3. **Gen Z trial barrier** — 73% intent is conditional on social proof. Won't pick off shelf without TikTok presence or friend recommendation first.

---

### Suggested Follow-Ups

Ask Ethan: What specific cocktails would you build with CC Maple?
Ask Karen: What price point makes you switch from LaCroix?
Ask Aisha: What would the packaging need to look like for you to post it?
Run scenario: CC Maple at Niagara Falls souvenir shops`;

// ─── Follow-Up Pill Responses ──────────────────────────────────────────────────

export const followUpResponses: Record<string, string> = {
  "Ask Ethan: What specific cocktails would you build?": `**Ethan (@ethan_westend):**\n\n"Okay, I've been thinking about this since the sample arrived. Here's my starting three-drink menu:\n\n**The Northern Old Fashioned** — 2oz rye whisky, 4oz CC Maple, dash Angostura, orange peel. The maple carbonation adds a texture dimension you don't get with flat maple syrup. Clean, interesting, definitely Canadian.\n\n**Maple Gin Fizz** — 1.5oz London Dry, 4oz CC Maple, squeeze of lime, sprig of thyme. The earthiness of the gin plays against the maple sweetness. This one writes itself on a cocktail menu.\n\n**The Sober Cabin** (NA) — CC Maple, fresh ginger juice, lemon, muddled rosemary. Absolutely would put this on the NA menu. Marie-type customers would order this over any other option we currently have.\n\nI'm running these as specials this weekend. Will report back."`,

  "Ask Karen: What price point makes you switch from LaCroix?": `**Karen H. (@karen_atl):**\n\n"Okay, let me be real with you. I buy LaCroix in the Costco 35-can pack. My per-can cost is about $0.42. My family goes through two of those a month. That's our baseline.\n\nFor me to switch, even partially:\n\n— If it's $1.29 or under per can at Costco in a 12-pack variety, I'd try it for a special occasion or dinner party. Maple is different enough to justify a premium if I'm entertaining.\n\n— If it's $1.99+ I'm not buying it as an everyday beverage. That's a restaurant price, not a household staple price.\n\nHonestly? The smart play is a 6-pack sampler at Shoppers for $7.99. Let me try it before I commit to 12. If the kids like it, I'll buy more.\n\nThe maple thing could actually work for Thanksgiving. I'd pay a holiday premium for that context. Just don't ask me to replace my weekly LaCroix run."`,

  "Ask Aisha: What would the packaging need to look like for you to post it?": `**Aisha (@aisha_atx):**\n\n"okay so here's what would actually make me post this without being paid:\n\nthe glass bottle already has it. like that shape is already content. if I put that on my kitchen counter next to my matcha setup it fits. the maple-colored label would have to be warm toned not like, aggressively orange. think amber, not halloween.\n\nalso the cap matters more than people think. if it has a gold or brass colored twist-off cap? that's shelf aesthetic content right there.\n\nfor the post itself I need: a vibe photo in natural light, ideally at a bar or a cozy cabin window or a farmers market. and then a 'wait what is this??' hook. the 90s comeback story would be my caption because that's genuinely interesting. brands that fans BROUGHT BACK??? that's already a tiktok.\n\nI would not post an unboxing. I would post 'this is what I'm drinking at [event/occasion] and here's the weird history behind it.' that's the format that works for this brand."`,

  "Run scenario: CC Maple at Niagara Falls souvenir shops": `**Scenario: CC Maple Zero Sugar — Niagara Falls Tourist Retail**\n\nChannel analysis across 1,247 agents for the tourist retail placement:\n\n**Key Finding:** Of the 13M annual Niagara Falls visitors, this agent set models them as price-inelastic (tourist premium tolerance: +40% vs. grocery context). This means $2.99–$3.49/unit is the viable price range — premium to grocery but appropriate for a Canadian souvenir purchase.\n\n**Competitive Position:** LaCroix, Poppi, and Olipop have zero distribution in tourist souvenir shops. The only sparkling water competitor in this channel is Perrier and San Pellegrino in hotel minibars. CC Maple would be the only sparkling beverage positioned as a Canadian souvenir experience.\n\n**Adjacent Product Context:** Maple syrup is Canada's #1 purchased souvenir. CC Maple physically placed adjacent to maple syrup products creates a natural purchase association — "maple to drink AND maple to cook with."\n\n**Recommended Retail Format:** Glass bottle 4-packs or gift sets. A "Taste of Canada" bundle (1x CC Maple + 1x CC Original + maple syrup) priced at $22–$26 CAD would perform in gift/impulse context.\n\n**Segment Response:** 91% of tourist segment agents expressed purchase intent in this context. Even Tyler — the most indifferent agent — said "yeah if it's in the shop I'd grab one." That's a remarkable consensus for a product in early launch.`,
};
