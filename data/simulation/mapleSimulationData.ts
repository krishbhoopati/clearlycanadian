import type {
  SimAgent, GraphNode, GraphLink, SimPost, SentimentPoint, SwarmSegment,
  ReportLogEntry, SimConfigData, ReportInterview,
} from "@/lib/types";

// ─── Knowledge Graph Nodes (80+ nodes, 6 waves) ───────────────────────────────

export const graphNodes: GraphNode[] = [
  // WAVE 1 — CC Brand Core (8 nodes)
  { id: "cc-maple", label: "CC Maple Zero Sugar", group: "center", color: "#1B6EC2", wave: 1, tooltip: "2% unaided awareness nationally — massive upside potential" },
  { id: "cc-originals", label: "CC Originals", group: "product", color: "#2563EB", wave: 1, tooltip: "Fan-funded 1987 revival via Indiegogo — 14,000 fans" },
  { id: "cc-zero-sugar", label: "CC Zero Sugar", group: "product", color: "#2563EB", wave: 1, tooltip: "Fastest-growing SKU category in sparkling water" },
  { id: "cc-essence", label: "CC Essence", group: "product", color: "#2563EB", wave: 1, tooltip: "Zero calories, zero sweeteners — clean label" },
  { id: "cc-glass-bottle", label: "Glass Bottle", group: "product", color: "#3B82F6", wave: 1, tooltip: "Iconic 340ml glass — highest premium signal in category" },
  { id: "cc-sleekcan", label: "SleekCan 6-Pack", group: "product", color: "#3B82F6", wave: 1, tooltip: "New 355ml convenience format, gym-friendly" },
  { id: "cc-sparkling-mineral", label: "Sparkling Mineral", group: "product", color: "#3B82F6", wave: 1, tooltip: "Premium mineral water extension" },
  { id: "cc-still", label: "CC Still Water", group: "product", color: "#3B82F6", wave: 1, tooltip: "Still water line — broader distribution footprint" },
  { id: "cc-473ml-can", label: "473ml Can Format", group: "product", color: "#3B82F6", wave: 1, tooltip: "New large-format can for gym bags and outdoor use" },
  { id: "cc-mini-pack", label: "CC Mini 4-Pack", group: "product", color: "#3B82F6", wave: 1, tooltip: "Trial-size variety pack — lowest barrier to first purchase" },
  { id: "cc-holiday-bundle", label: "Holiday Gift Set", group: "product", color: "#3B82F6", wave: 1, tooltip: "Premium boxed gift — Q4 revenue driver, souvenir adjacency" },
  { id: "cc-dtc-website", label: "ClearlyCanadian.com", group: "product", color: "#2563EB", wave: 1, tooltip: "DTC channel — Subscribe & Save, gift bundles, fan merch" },
  { id: "cc-ceo", label: "David Sheridan CEO", group: "product", color: "#1B6EC2", wave: 1, tooltip: "CC CEO — brand guardian, champion of glass-only pledge" },

  // WAVE 2 — Competitors (10 nodes)
  { id: "c-lacroix", label: "LaCroix", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Market leader, $0.42/can at Costco — primary comparison benchmark" },
  { id: "c-bubly", label: "Bubly", group: "competitor", color: "#EF4444", wave: 2, tooltip: "PepsiCo-owned, fun branding, broad grocery penetration" },
  { id: "c-poppi", label: "Poppi", group: "competitor", color: "#EF4444", wave: 2, tooltip: "$1.95B acquisition — Gen Z darling, prebiotic positioning" },
  { id: "c-olipop", label: "Olipop", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Digestive wellness, $2.49–$2.99/can, premium grocery" },
  { id: "c-liquid-death", label: "Liquid Death", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Brand-first, irreverent — NOT in tourist retail" },
  { id: "c-topo", label: "Topo Chico", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Coca-Cola-owned, mineral water heritage, bar staple" },
  { id: "c-perrier", label: "Perrier", group: "competitor", color: "#EF4444", wave: 2, tooltip: "French prestige, hotel minibars — direct tourist channel competitor" },
  { id: "c-sanpellegrino", label: "San Pellegrino", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Italian mineral water, restaurant standard" },
  { id: "c-spindrift", label: "Spindrift", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Real squeezed fruit, premium independent, Whole Foods" },
  { id: "c-private-label", label: "Store Brand", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Private label sparkling water — biggest volume threat in grocery" },
  { id: "c-waterloo", label: "Waterloo Sparkling", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Canadian sparkling water brand — shared national identity claim" },
  { id: "c-flow", label: "Flow Spring Water", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Canadian premium spring, eco Tetra Pak — overlapping premium buyer" },
  { id: "c-guru", label: "GURU Organic Energy", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Canadian energy drink — shares health-positioning shelf space" },
  { id: "c-aura-bora", label: "Aura Bora", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Herbal sparkling water — botanical positioning, premium grocery" },
  { id: "c-sanzo", label: "Sanzo", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Asian-inspired sparkling, real fruit — DTC premium challenger" },
  { id: "c-hint", label: "Hint Water", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Unsweetened flavored still water — clean-label positioning overlap" },
  { id: "c-cascade", label: "Cascade Ice", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Value sparkling water — price leader in mass channel" },

  // WAVE 3 — Consumer Segments (8) + Flavors (6)
  { id: "seg-genz", label: "Gen Z Students", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Discovers through TikTok & friends — won't pick off shelf without social proof" },
  { id: "seg-millennials", label: "Millennials", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Premium lifestyle buyers — glass bottle aesthetic converts fast" },
  { id: "seg-genx", label: "Gen X Nostalgic", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "90s CC memory is a strong purchase trigger" },
  { id: "seg-sober", label: "Sober Curious", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Fastest-growing on-premise segment — needs interesting NA options" },
  { id: "seg-bartenders", label: "Bartenders", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Evaluates for cocktail menu — maple sparkling base saves prep time" },
  { id: "seg-household", label: "Household Buyers", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Price comparison to LaCroix is key decision gate" },
  { id: "seg-premium", label: "Premium Lifestyle", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Raj-type — glass bottle on bar cart, aesthetic-first purchase" },
  { id: "seg-convenience", label: "Convenience Buyers", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Tyler-type — cold & cheap, no brand loyalty" },
  { id: "fl-blackberry", label: "Mountain Blackberry", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Original hero flavor — loyal Gen X base protecting it" },
  { id: "fl-cherry", label: "Wild Cherry", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Popular original SKU with broad appeal" },
  { id: "fl-peach", label: "Orchard Peach", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Premium stone fruit profile, summer performer" },
  { id: "fl-strawberry", label: "Summer Strawberry", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "TikTok-friendly, aesthetic pink coloring" },
  { id: "fl-maple", label: "Maple Flavor", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Real maple extract — the key differentiation from 'natural flavors'" },
  { id: "fl-grapefruit", label: "Grapefruit Essence", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Closest competitor to LaCroix Pamplemousse" },
  { id: "fl-lemon-lime", label: "Lemon Lime Twist", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Classic crowd-pleaser — gateway flavor for soda switchers" },
  { id: "fl-watermelon", label: "Watermelon Mint", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "TikTok summer hero — aesthetic pink, Gen Z magnet" },
  { id: "fl-elderflower", label: "Elderflower", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Botanical premium — bartender and premium lifestyle crossover" },
  { id: "fl-cucumber", label: "Cucumber Mint", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Spa & wellness positioning — hotel minibar natural fit" },
  { id: "seg-boomer", label: "Boomer Nostalgic", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "55+ recall of CC from 1987 original — highest emotional purchase trigger" },
  { id: "seg-tourist-intl", label: "International Tourists", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "US/Japan/UK tourists seeking authentic Canadian souvenirs" },
  { id: "seg-athlete", label: "Health Athletes", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Gym/running community — zero sugar, glass bottle for post-workout ritual" },
  { id: "seg-cocktail", label: "Home Mixologists", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Craft cocktail at home — CC Maple as premium base ingredient" },
  { id: "seg-foodservice", label: "Food Service Buyers", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Restaurant/hotel buyers — gatekeepers for on-premise volume" },
  { id: "seg-corporate", label: "Corporate Event Buyers", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "B2B gifting — CC Maple as Canadian premium gift" },

  // WAVE 4 — Retail Channels (10) + Tourist Destinations (10)
  { id: "ch-souvenir", label: "Souvenir Shops", group: "channel", color: "#10B981", wave: 4, tooltip: "Zero sparkling water competition in this channel — blue ocean" },
  { id: "ch-museum", label: "Museum Gift Shops", group: "channel", color: "#10B981", wave: 4, tooltip: "High dwell time, captive audience, premium price tolerance" },
  { id: "ch-airport", label: "Airport Retail", group: "channel", color: "#10B981", wave: 4, tooltip: "YYZ/YVR — last Canadian purchase before departure" },
  { id: "ch-hotel", label: "Hotel Lobbies", group: "channel", color: "#10B981", wave: 4, tooltip: "In-room minibar and lobby shop — Perrier's current territory" },
  { id: "ch-grocery", label: "Grocery (Kroger)", group: "channel", color: "#10B981", wave: 4, tooltip: "Shoppers, Sobeys, Metro, Loblaws — mainstream distribution" },
  { id: "ch-costco", label: "Costco", group: "channel", color: "#10B981", wave: 4, tooltip: "Household buyers need variety pack format to switch from LaCroix" },
  { id: "ch-walmart", label: "Walmart", group: "channel", color: "#10B981", wave: 4, tooltip: "Mass market — price-sensitive, high volume" },
  { id: "ch-target", label: "Target", group: "channel", color: "#10B981", wave: 4, tooltip: "Premium mass — Millennial + Gen Z overlap, aesthetic shelf" },
  { id: "ch-7eleven", label: "7-Eleven", group: "channel", color: "#10B981", wave: 4, tooltip: "Convenience — Tyler-type impulse buyer, price-capped $2.29" },
  { id: "ch-amazon", label: "Amazon", group: "channel", color: "#10B981", wave: 4, tooltip: "Subscribe & Save — household repeat purchase engine" },
  { id: "dest-niagara", label: "Niagara Falls", group: "destination", color: "#14B8A6", wave: 4, tooltip: "13M annual visitors — largest tourist retail opportunity in Canada" },
  { id: "dest-banff", label: "Banff", group: "destination", color: "#14B8A6", wave: 4, tooltip: "4.3M annual visitors, high international tourist mix" },
  { id: "dest-montreal", label: "Old Montréal", group: "destination", color: "#14B8A6", wave: 4, tooltip: "French-Canadian market, sober curious density, bar scene" },
  { id: "dest-granville", label: "Granville Island", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Premium local market, artisan adjacency, tourist overlap" },
  { id: "dest-quebec", label: "Québec City", group: "destination", color: "#14B8A6", wave: 4, tooltip: "7.9M annual visitors, UNESCO heritage, high souvenir spend" },
  { id: "dest-ottawa", label: "Ottawa ByWard Market", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Government capital, political buyers, heritage shopping" },
  { id: "dest-whistler", label: "Whistler", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Ski resort captive audience, premium price tolerance +60%" },
  { id: "dest-cntower", label: "CN Tower Toronto", group: "destination", color: "#14B8A6", wave: 4, tooltip: "3.2M annual visitors, highest single-location souvenir spend" },
  { id: "dest-victoria", label: "Victoria", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Butchart Gardens, Fairmont, premium British Columbia tourism" },
  { id: "dest-jasper", label: "Jasper", group: "destination", color: "#14B8A6", wave: 4, tooltip: "National park corridor, eco-premium buyer profile" },
  { id: "ch-wholefoods", label: "Whole Foods", group: "channel", color: "#10B981", wave: 4, tooltip: "Premium grocery — Aura Bora shelf, natural home for CC glass bottle" },
  { id: "ch-loblaws", label: "Loblaws / PC", group: "channel", color: "#10B981", wave: 4, tooltip: "Canada's largest grocery chain — critical for national scale" },
  { id: "ch-sobeys", label: "Sobeys", group: "channel", color: "#10B981", wave: 4, tooltip: "Atlantic + Ontario grocery — key for regional Canadian distribution" },
  { id: "ch-shoppers", label: "Shoppers Drug Mart", group: "channel", color: "#10B981", wave: 4, tooltip: "Pharmacy impulse channel — 1,300+ locations, Gen X shoppers" },
  { id: "ch-sportsarena", label: "Sports Arenas", group: "channel", color: "#10B981", wave: 4, tooltip: "Rogers Centre, Scotiabank Arena — captured crowd, premium concessions" },
  { id: "ch-golf", label: "Golf Clubs", group: "channel", color: "#10B981", wave: 4, tooltip: "Clubhouse pro shop — premium buyer, glass bottle aesthetic" },
  { id: "ch-festival", label: "Music Festivals", group: "channel", color: "#10B981", wave: 4, tooltip: "Lollapalooza Canada, NXNE — Gen Z discovery events" },
  { id: "ch-dtc", label: "DTC / Subscription", group: "channel", color: "#10B981", wave: 4, tooltip: "Direct-to-consumer — highest margin, repeat purchase potential" },
  { id: "ch-university", label: "University Cafeterias", group: "channel", color: "#10B981", wave: 4, tooltip: "Campus captive audience — Gen Z trial opportunity" },
  { id: "ch-traderjoes", label: "Trader Joe's", group: "channel", color: "#10B981", wave: 4, tooltip: "US premium value grocery — expat Canadian + premium US buyer" },
  { id: "dest-tofino", label: "Tofino BC", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Surf/wellness tourism — outdoor premium buyer, eco-conscious" },
  { id: "dest-okanagan", label: "Kelowna Okanagan", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Wine country tourism — premium drink adjacency, high spend" },
  { id: "dest-pei", label: "Prince Edward Island", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Anne of Green Gables tourism — peak Canadian nostalgia buyer" },
  { id: "dest-calgary", label: "Calgary Stampede", group: "destination", color: "#14B8A6", wave: 4, tooltip: "1.3M annual visitors — high-volume Western Canada event" },
  { id: "dest-muskoka", label: "Muskoka Cottage Country", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Affluent Ontario cottage buyer — premium glass bottle natural fit" },
  { id: "dest-halifax", label: "Halifax Waterfront", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Maritime tourism hub — local pride, international cruise port" },
  { id: "dest-algonquin", label: "Algonquin Park", group: "destination", color: "#14B8A6", wave: 4, tooltip: "National park gateway stores — eco-premium, canoe-culture buyers" },
  { id: "dest-winnipeg", label: "Winnipeg Exchange Dist.", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Prairie cultural hub — hockey season captive audience" },

  // WAVE 5 — Market Data (6) + People/Partners (6) + Concepts (10)
  { id: "mkt-market-size", label: "$50.6B Sparkling Market", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Global sparkling water TAM 2024" },
  { id: "mkt-cagr", label: "11% CAGR", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Sparkling water category growth rate — above CPG average" },
  { id: "mkt-tourism", label: "$130B Canadian Tourism", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Canadian tourism industry total spend 2024" },
  { id: "mkt-summer", label: "$59B Summer 2025", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Canadian summer tourism projected spend 2025" },
  { id: "mkt-niagara-visitors", label: "13M Niagara Visitors", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Annual Niagara Falls visitors — largest CC tourist retail opportunity" },
  { id: "mkt-poppi-acq", label: "$1.95B Poppi Acquisition", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "PepsiCo acquired Poppi 2025 — validates premium sparkling water value" },
  { id: "ppl-shania", label: "Shania Twain", group: "people", color: "#EC4899", wave: 5, tooltip: "Canadian icon, comeback story parallel, Gen X + Gen Z crossover appeal" },
  { id: "ppl-reynolds", label: "Ryan Reynolds", group: "people", color: "#EC4899", wave: 5, tooltip: "Maximum Effort agency connection, Canadian celebrity marketing model" },
  { id: "ppl-bluejays", label: "Toronto Blue Jays", group: "people", color: "#EC4899", wave: 5, tooltip: "Rogers Centre partnership — 3M+ annual attendance, captive audience" },
  { id: "ppl-blackburn", label: "Jennifer Blackburn CMO", group: "people", color: "#EC4899", wave: 5, tooltip: "CC Chief Marketing Officer — leads brand strategy and partnerships" },
  { id: "ppl-rogers-centre", label: "Rogers Centre", group: "people", color: "#EC4899", wave: 5, tooltip: "Blue Jays home — largest single-venue F&B opportunity in Canada" },
  { id: "ppl-qvc", label: "QVC", group: "people", color: "#EC4899", wave: 5, tooltip: "TV shopping channel — Gen X nostalgia buyer direct channel" },
  { id: "con-buy-canadian", label: "Buy Canadian Movement", group: "concept", color: "#F97316", wave: 5, tooltip: "Purchase intent for Canadian brands +38% since 2024 tariff tensions" },
  { id: "con-unaided-awareness", label: "2% Unaided Awareness", group: "concept", color: "#F97316", wave: 5, tooltip: "Baseline is near zero — every touchpoint is net new discovery" },
  { id: "con-conversion", label: "48% Conversion Rate", group: "concept", color: "#F97316", wave: 5, tooltip: "On-premise sample-to-purchase rate — highest in category" },
  { id: "con-maple-souvenir", label: "Maple Syrup #1 Souvenir", group: "concept", color: "#F97316", wave: 5, tooltip: "Canada's #1 purchased souvenir — CC Maple is natural adjacency" },
  { id: "con-never-plastic", label: "Never Plastic", group: "concept", color: "#F97316", wave: 5, tooltip: "Glass-only brand promise — sustainability differentiator" },
  { id: "con-retail-sales", label: "$65.8M Retail Sales", group: "concept", color: "#F97316", wave: 5, tooltip: "CC retail sales 2023 — baseline before maple launch" },
  { id: "con-doors", label: "33,600 Doors", group: "concept", color: "#F97316", wave: 5, tooltip: "Active retail doors — distribution network size" },
  { id: "con-crowdfunding", label: "Crowdfunding Revival", group: "concept", color: "#F97316", wave: 5, tooltip: "Fan-funded comeback via Indiegogo — the origin story" },
  { id: "con-fans", label: "14,000 Fans", group: "concept", color: "#F97316", wave: 5, tooltip: "Original Indiegogo backers — the loyalist core" },
  { id: "con-soda-switchers", label: "Soda Switchers 80%", group: "concept", color: "#F97316", wave: 5, tooltip: "80% of sparkling water growth comes from soda switchers — addressable market" },
  { id: "mkt-glass-premium", label: "6× Glass Price Premium", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Glass bottle commands 6× price premium over private label sparkling water" },
  { id: "mkt-purchase-lift", label: "38% Purchase Intent Lift", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Buy-Canadian sentiment lift since 2024 tariff tensions" },
  { id: "mkt-onpremise-growth", label: "On-Premise 28% Growth", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Restaurant and bar channel recovery post-pandemic — CC opportunity" },
  { id: "mkt-zero-sugar-share", label: "Zero Sugar 31% Share", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Zero-sugar variants now 31% of sparkling water category sales" },
  { id: "mkt-influencer-roi", label: "Influencer ROI 4.2×", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "CC influencer campaign average return vs paid digital baseline" },
  { id: "ppl-adam-cheyne", label: "Adam Cheyne Founder", group: "people", color: "#EC4899", wave: 5, tooltip: "CC co-founder — original 1987 vision, storytelling anchor for campaigns" },
  { id: "ppl-maple-institute", label: "Maple Institute", group: "people", color: "#EC4899", wave: 5, tooltip: "Canada Maple Industry — brand credibility partner for maple extract claim" },
  { id: "ppl-destination-canada", label: "Destination Canada", group: "people", color: "#EC4899", wave: 5, tooltip: "Federal tourism board — co-marketing partnership opportunity for souvenir channel" },
  { id: "ppl-modash-creators", label: "500+ Creator Network", group: "people", color: "#EC4899", wave: 5, tooltip: "Modash-tracked micro-influencer pool — Canadian lifestyle & food creators" },
  { id: "con-tariff-2025", label: "2025 Trade Tensions", group: "concept", color: "#F97316", wave: 5, tooltip: "Canada-US tariff friction — catalyst for Buy Canadian purchase intent spike" },
  { id: "con-sugar-free-trend", label: "Sugar-Free Macro Trend", group: "concept", color: "#F97316", wave: 5, tooltip: "GLP-1 wave shifting consumers away from sugar — CC Zero Sugar perfect timing" },
  { id: "con-nostalgic-marketing", label: "Nostalgia Marketing Wave", group: "concept", color: "#F97316", wave: 5, tooltip: "90s revival trend — CC 1987 origin story is a natural cultural asset" },
  { id: "con-canadian-identity", label: "Canadian Identity Pride", group: "concept", color: "#F97316", wave: 5, tooltip: "Peak Canadian nationalism — never plastic + glass + maple = trifecta" },
  { id: "con-real-maple-claim", label: "Real Maple Extract", group: "concept", color: "#F97316", wave: 5, tooltip: "Ingredient differentiation — real maple vs 'natural flavors' label claim" },
  { id: "con-glass-recycling", label: "Glass Recycling 70%", group: "concept", color: "#F97316", wave: 5, tooltip: "Glass recycling rate — core to sustainability narrative over PET" },
  { id: "con-no-sweeteners", label: "Zero Artificial Sweeteners", group: "concept", color: "#F97316", wave: 5, tooltip: "Clean label promise — no stevia, aspartame, sucralose" },
  { id: "con-50k-door-target", label: "50,000 Door Target", group: "concept", color: "#F97316", wave: 5, tooltip: "Distribution growth target from 33.6K → 50K doors by 2026" },

  // WAVE 6 — Platforms (6)
  { id: "sm-tiktok", label: "TikTok", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Primary Gen Z discovery channel — #CCMaple needs TikTok seeding" },
  { id: "sm-instagram", label: "Instagram", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Millennial/premium lifestyle — glass bottle aesthetic content" },
  { id: "sm-reddit", label: "Reddit", group: "platform", color: "#06B6D4", wave: 6, tooltip: "r/ClearlyCanadian — 12K subscribers, loyal community" },
  { id: "sm-facebook", label: "Facebook", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Gen X and Boomer — nostalgia content, Linda-type community" },
  { id: "sm-youtube", label: "YouTube", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Long-form brand story, Shania Twain campaign content hub" },
  { id: "sm-modash", label: "Modash", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Influencer tracking platform — CC uses for partnership discovery" },
  { id: "sm-pinterest", label: "Pinterest", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Holiday gift discovery, cocktail recipes — CC glass bottle highly pinnable" },
  { id: "sm-linkedin", label: "LinkedIn B2B", group: "platform", color: "#06B6D4", wave: 6, tooltip: "B2B / food service buyer channel — foodservice distributor outreach" },
  { id: "sm-podcast", label: "Podcast / Spotify", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Canadian lifestyle podcasts — host-read ads for Gen X recall" },
  { id: "sm-substack", label: "Substack", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Food & beverage newsletters — premium editorial placement" },
  { id: "sm-snapchat", label: "Snapchat", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Under-25 Gen Z supplement to TikTok — regional Canadian geo-filters" },
  { id: "sm-google-shopping", label: "Google Shopping", group: "platform", color: "#06B6D4", wave: 6, tooltip: "DTC conversion layer — captures 'buy Clearly Canadian' search intent" },
  { id: "sm-threads", label: "Threads", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Meta's text platform — Millennial & Gen Z brand conversation layer" },
  { id: "sm-discord", label: "Discord Community", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Brand fan communities — CC loyalist server for crowdfunding backers" },
  { id: "sm-twitch", label: "Twitch", group: "platform", color: "#06B6D4", wave: 6, tooltip: "Gaming streamer audience — Gen Z reach via sponsored drink-and-play" },

  // WAVE 1 — New Product SKUs (+4)
  { id: "cc-subscription-box", label: "CC Subscription Box", group: "product", color: "#2563EB", wave: 1, tooltip: "Monthly curated variety box — highest LTV channel, recurring revenue" },
  { id: "cc-cocktail-kit", label: "CC Cocktail Mixer Kit", group: "product", color: "#2563EB", wave: 1, tooltip: "Bundled cocktail kit: CC Maple + bitters + maple syrup + recipe card" },
  { id: "cc-hotel-amenity", label: "CC Hotel Amenity Format", group: "product", color: "#3B82F6", wave: 1, tooltip: "Single-serve 200ml glass for hotel room amenity programs" },
  { id: "cc-catering-keg", label: "CC Draft Keg", group: "product", color: "#3B82F6", wave: 1, tooltip: "5L catering/event keg format — on-tap sparkling maple for venues" },

  // WAVE 2 — New Competitors (+6)
  { id: "c-fever-tree", label: "Fever-Tree", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Premium mixer leader — direct compete for bartender and home mixologist" },
  { id: "c-q-mixers", label: "Q Mixers", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Craft cocktail mixers — high-end grocery, premium bar segment" },
  { id: "c-canada-dry", label: "Canada Dry", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Iconic Canadian ginger ale — heritage brand overlap, grocery shelf space" },
  { id: "c-pellegrino-tasteful", label: "S.Pellegrino Tasteful", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Nestle's new low-sugar sparkling launch — direct premium shelf challenger" },
  { id: "c-recess", label: "Recess", group: "competitor", color: "#EF4444", wave: 2, tooltip: "CBD sparkling water — wellness positioning, millennial DTC-first" },
  { id: "c-with-nothing", label: "With/Nothing", group: "competitor", color: "#EF4444", wave: 2, tooltip: "Canadian NA sparkling — shared national identity, premium zero-sugar" },

  // WAVE 3 — New Segments (+8)
  { id: "seg-wedding-planner", label: "Wedding Planners", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Event planners sourcing premium NA options — glass bottle is perfect table water" },
  { id: "seg-hotel-buyer", label: "Hotel & Resort Buyers", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "F&B procurement for hotels — replacing Perrier in minibar and lobby" },
  { id: "seg-yoga-wellness", label: "Yoga & Wellness", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Studio regulars — clean label, zero sweeteners, glass bottle ritual" },
  { id: "seg-college-student", label: "College Students", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Gen Z campus buyers — price-sensitive but trend-responsive" },
  { id: "seg-vegan-conscious", label: "Vegan / Conscious", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Ingredient-scrutinizing buyers — never plastic + real maple resonates" },
  { id: "seg-craft-beer-crossover", label: "Craft Beer Crossover", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Craft beer drinkers reducing alcohol — bridge segment for CC premium" },
  { id: "seg-senior-health", label: "Senior Health-Conscious", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "55+ health-aware buyers — zero sugar, glass (no BPA), nostalgic brand" },
  { id: "seg-expat-canadian", label: "Canadian Expats Abroad", group: "segment", color: "#8B5CF6", wave: 3, tooltip: "Canadians living abroad seeking taste of home — DTC and international retail" },

  // WAVE 3 — New Flavors (+5)
  { id: "fl-blood-orange", label: "Blood Orange", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Italian-inspired premium — restaurant and bar adjacent, visual appeal" },
  { id: "fl-yuzu-citrus", label: "Yuzu Citrus", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Japanese citrus profile — premium grocery, sushi restaurant crossover" },
  { id: "fl-green-apple", label: "Green Apple", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Crisp and tart — Gen Z flavor preference, TikTok aesthetic" },
  { id: "fl-hibiscus", label: "Hibiscus Rose", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Floral and premium — bartender darling, Instagram-worthy pink hue" },
  { id: "fl-pineapple", label: "Pineapple Coconut", group: "flavor", color: "#7C3AED", wave: 3, tooltip: "Tropical summer SKU — beachside tourism, Muskoka cottage crowd" },

  // WAVE 4 — New Channels (+12)
  { id: "ch-duty-free", label: "Duty Free Shops", group: "channel", color: "#10B981", wave: 4, tooltip: "YYZ/YVR international departure — tax-free premium, last Canadian purchase" },
  { id: "ch-yoga-studios", label: "Yoga Studios", group: "channel", color: "#10B981", wave: 4, tooltip: "Post-class hydration — clean label, glass bottle aligns with wellness ethos" },
  { id: "ch-craft-cocktail-bars", label: "Craft Cocktail Bars", group: "channel", color: "#10B981", wave: 4, tooltip: "Premium bar back — CC Maple as hero mixer, premium price tolerance" },
  { id: "ch-farmers-market", label: "Farmers Markets", group: "channel", color: "#10B981", wave: 4, tooltip: "Local premium discovery — artisan adjacency, high dwell time, sampling" },
  { id: "ch-hotel-minibar", label: "Hotel Minibar", group: "channel", color: "#10B981", wave: 4, tooltip: "In-room minibar placements — Perrier's territory, CC glass bottle upgrade" },
  { id: "ch-airlines", label: "Airline F&B", group: "channel", color: "#10B981", wave: 4, tooltip: "Porter & Air Canada — Canadian carrier, in-flight premium beverage" },
  { id: "ch-corporate-gifting", label: "Corporate Gifting", group: "channel", color: "#10B981", wave: 4, tooltip: "B2B gift baskets — premium Canadian gift, Q4 corporate orders" },
  { id: "ch-meal-kit", label: "Meal Kit Services", group: "channel", color: "#10B981", wave: 4, tooltip: "HelloFresh / Chefs Plate add-on — beverage discovery through cooking" },
  { id: "ch-erewhon-equiv", label: "Erewhon / Healthy Planet", group: "channel", color: "#10B981", wave: 4, tooltip: "Ultra-premium wellness grocery — CC glass bottle natural home" },
  { id: "ch-sams-club", label: "Sam's Club US", group: "channel", color: "#10B981", wave: 4, tooltip: "US bulk channel — variety pack format, Costco-equivalent household buyer" },
  { id: "ch-cruise-ships", label: "Cruise Ship F&B", group: "channel", color: "#10B981", wave: 4, tooltip: "Captive premium audience — Canadian departure ports, souvenir adjacency" },
  { id: "ch-sports-bars", label: "Sports Bar Chains", group: "channel", color: "#10B981", wave: 4, tooltip: "NA mixer for sports watching — sober curious, designated driver segment" },

  // WAVE 4 — New Destinations (+7)
  { id: "dest-toronto-island", label: "Toronto Island / CNE", group: "destination", color: "#14B8A6", wave: 4, tooltip: "1.3M summer visitors — CNE is premium seasonal Canadian experience" },
  { id: "dest-mont-tremblant", label: "Mont-Tremblant", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Ski & golf resort — Quebec premium buyer, four-season tourism" },
  { id: "dest-cape-breton", label: "Cape Breton Highlands", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Cabot Trail — scenery tourism, passionate Nova Scotia local pride" },
  { id: "dest-rideau-canal", label: "Rideau Canal Ottawa", group: "destination", color: "#14B8A6", wave: 4, tooltip: "UNESCO World Heritage — summer boating + winter skating tourism" },
  { id: "dest-thousand-islands", label: "Thousand Islands", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Ontario River tourism — cottage country crossover, US day-tripper market" },
  { id: "dest-kananaskis", label: "Kananaskis Country", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Alberta wilderness resort — premium outdoor experience, eco-buyer profile" },
  { id: "dest-saltspring", label: "Salt Spring Island BC", group: "destination", color: "#14B8A6", wave: 4, tooltip: "Artisan island market — premium craft buyer, farmers market ideal fit" },

  // WAVE 5 — New Market Data (+7)
  { id: "md-can-seltzer-growth", label: "Canadian Seltzer +22%", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Canadian sparkling/seltzer category YoY growth — outpacing US growth rate" },
  { id: "md-na-beverage-tam", label: "NA Beverage TAM $26B", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Total addressable market for non-alcoholic premium beverages globally" },
  { id: "md-premium-trade-up", label: "Premium Trade-Up +31%", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "31% of mass-sparkling buyers willing to trade up to premium — CC headroom" },
  { id: "md-tiktok-bev-views", label: "TikTok #Beverage 8B", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "#beverage content 8 billion TikTok views — enormous organic discovery pool" },
  { id: "md-hotel-fb-rev", label: "Hotel F&B $4.2B CA", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Canadian hotel food & beverage annual revenue — CC channel opportunity" },
  { id: "md-genz-na-preference", label: "Gen Z 67% Prefer NA", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "67% of Gen Z prefer non-alcoholic options at social events — CC tailwind" },
  { id: "md-duty-free-bev-size", label: "Duty-Free Bev $8.1B", group: "market_data", color: "#F59E0B", wave: 5, tooltip: "Global duty-free beverage market — premium glass bottle competes directly" },

  // WAVE 5 — New People (+6)
  { id: "p-david-mcnally", label: "Loblaw Buyer", group: "people", color: "#EC4899", wave: 5, tooltip: "Loblaw category buyer for sparkling water — gatekeeper for 2,400+ doors" },
  { id: "p-oliver-bonacini", label: "Oliver & Bonacini Group", group: "people", color: "#EC4899", wave: 5, tooltip: "Premium Canadian restaurant group — on-premise ambassador for CC Maple" },
  { id: "p-sam-james-coffee", label: "Sam James Coffee", group: "people", color: "#EC4899", wave: 5, tooltip: "Toronto tastemaker & café chain — food & beverage trendsetter partnership" },
  { id: "p-tiktok-creator-1", label: "@canadianfoodie 2.1M", group: "people", color: "#EC4899", wave: 5, tooltip: "TikTok food creator 2.1M followers — lead micro-influencer for CC launch" },
  { id: "p-porter-airlines", label: "Porter Airlines", group: "people", color: "#EC4899", wave: 5, tooltip: "Premium Canadian airline — in-flight CC Maple partnership, captive audience" },
  { id: "p-canadian-tire-corp", label: "Canadian Tire Corp", group: "people", color: "#EC4899", wave: 5, tooltip: "Canadian Tire retail buyer — sports section + outdoor gifting adjacency" },

  // WAVE 5 — New Concepts (+8)
  { id: "con-glass-premium-signal", label: "Glass = Premium Signal", group: "concept", color: "#F97316", wave: 5, tooltip: "Glass bottle as instant premium cue — shortcut to elevated perception" },
  { id: "con-cocktail-flywheel", label: "Cocktail Content Flywheel", group: "concept", color: "#F97316", wave: 5, tooltip: "Bartender recipe → social content → consumer demand → bar menus loop" },
  { id: "con-health-halo", label: "Health Halo Effect", group: "concept", color: "#F97316", wave: 5, tooltip: "Maple + sparkling water = health adjacent perception, even at premium price" },
  { id: "con-zero-waste-pledge", label: "Zero Waste Pledge", group: "concept", color: "#F97316", wave: 5, tooltip: "Brand commitment: 100% recyclable glass, no single-use plastic ever" },
  { id: "con-reverse-logistics", label: "Glass Return Program", group: "concept", color: "#F97316", wave: 5, tooltip: "Returnable glass pilot — eco-credential + community engagement loop" },
  { id: "con-souvenir-economy", label: "$4.1B Souvenir Economy", group: "concept", color: "#F97316", wave: 5, tooltip: "Canadian souvenir retail market — CC glass bottle is natural entry point" },
  { id: "con-influencer-seeding", label: "Influencer Seeding Strategy", group: "concept", color: "#F97316", wave: 5, tooltip: "Product-first seeding to 500+ creators before paid media — organic amplification" },
  { id: "con-subscription-moat", label: "Subscription Loyalty Moat", group: "concept", color: "#F97316", wave: 5, tooltip: "Subscribers churn 4× less than single-purchase buyers — DTC retention engine" },
];

// ─── Knowledge Graph Links (150+ edges) ──────────────────────────────────────

export const graphLinks: GraphLink[] = [
  // Wave 1 — Brand core connections
  { source: "cc-maple", target: "cc-originals", edgeLabel: "EXTENDS", wave: 1 },
  { source: "cc-maple", target: "cc-zero-sugar", edgeLabel: "SAME_LINE", wave: 1 },
  { source: "cc-maple", target: "cc-essence", edgeLabel: "ADJACENT_SKU", wave: 1 },
  { source: "cc-maple", target: "cc-glass-bottle", edgeLabel: "HERO_FORMAT", wave: 1 },
  { source: "cc-maple", target: "cc-sleekcan", edgeLabel: "CONVENIENCE_FORMAT", wave: 1 },
  { source: "cc-maple", target: "cc-sparkling-mineral", edgeLabel: "PORTFOLIO", wave: 1 },
  { source: "cc-maple", target: "cc-still", edgeLabel: "PORTFOLIO", wave: 1 },
  { source: "cc-originals", target: "fl-blackberry", edgeLabel: "HERO_FLAVOR", wave: 1 },
  { source: "cc-originals", target: "fl-cherry", edgeLabel: "CORE_FLAVOR", wave: 1 },
  { source: "cc-originals", target: "fl-peach", edgeLabel: "FLAVOR", wave: 1 },
  { source: "cc-originals", target: "fl-strawberry", edgeLabel: "FLAVOR", wave: 1 },
  { source: "cc-maple", target: "fl-maple", edgeLabel: "KEY_INGREDIENT", wave: 1 },
  { source: "cc-zero-sugar", target: "fl-grapefruit", edgeLabel: "FLAVOR", wave: 1 },

  // Wave 2 — Competitor connections
  { source: "cc-maple", target: "c-lacroix", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-bubly", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-poppi", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-olipop", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-liquid-death", edgeLabel: "COMPETES_WITH", strength: 0.2, wave: 2 },
  { source: "cc-maple", target: "c-topo", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-perrier", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-sanpellegrino", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-spindrift", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-glass-bottle", target: "c-perrier", edgeLabel: "FORMAT_COMPETES", strength: 0.4, wave: 2 },
  { source: "c-poppi", target: "mkt-poppi-acq", edgeLabel: "ACQUIRED_BY", wave: 2 },

  // Wave 3 — Segment connections
  { source: "seg-genz", target: "cc-maple", edgeLabel: "DISCOVERS_VIA_SOCIAL", wave: 3 },
  { source: "seg-millennials", target: "cc-maple", edgeLabel: "BUYS_PREMIUM", wave: 3 },
  { source: "seg-genx", target: "cc-originals", edgeLabel: "NOSTALGIC_LOYALTY", wave: 3 },
  { source: "seg-sober", target: "cc-maple", edgeLabel: "SEEKS_NA_OPTION", wave: 3 },
  { source: "seg-bartenders", target: "cc-maple", edgeLabel: "EVALUATES_FOR_MENU", wave: 3 },
  { source: "seg-household", target: "c-lacroix", edgeLabel: "CURRENTLY_BUYS", wave: 3 },
  { source: "seg-premium", target: "cc-glass-bottle", edgeLabel: "BUYS_FOR_AESTHETIC", wave: 3 },
  { source: "seg-convenience", target: "ch-7eleven", edgeLabel: "SHOPS_AT", wave: 3 },
  { source: "seg-genz", target: "fl-strawberry", edgeLabel: "PREFERS", wave: 3 },
  { source: "seg-millennials", target: "fl-maple", edgeLabel: "INTERESTED_IN", wave: 3 },
  { source: "seg-genx", target: "fl-blackberry", edgeLabel: "LOYAL_TO", wave: 3 },

  // Wave 4 — Channel & destination connections
  { source: "cc-maple", target: "ch-souvenir", edgeLabel: "NO_COMPETITION_ZONE", wave: 4 },
  { source: "cc-maple", target: "ch-museum", edgeLabel: "DISTRIBUTED_AT", wave: 4 },
  { source: "cc-maple", target: "ch-airport", edgeLabel: "LAST_CANADIAN_PURCHASE", wave: 4 },
  { source: "cc-maple", target: "ch-hotel", edgeLabel: "REPLACES_PERRIER", wave: 4 },
  { source: "cc-maple", target: "ch-grocery", edgeLabel: "MAINSTREAM_DIST", wave: 4 },
  { source: "cc-sleekcan", target: "ch-costco", edgeLabel: "VARIETY_PACK_NEEDED", wave: 4 },
  { source: "cc-maple", target: "ch-walmart", edgeLabel: "MASS_MARKET", wave: 4 },
  { source: "cc-glass-bottle", target: "ch-target", edgeLabel: "SHELF_AESTHETIC", wave: 4 },
  { source: "cc-maple", target: "ch-7eleven", edgeLabel: "CONVENIENCE_PLAY", wave: 4 },
  { source: "cc-maple", target: "ch-amazon", edgeLabel: "SUBSCRIBE_SAVE", wave: 4 },
  { source: "dest-niagara", target: "ch-souvenir", edgeLabel: "HIGHEST_VOLUME", wave: 4 },
  { source: "dest-banff", target: "ch-souvenir", edgeLabel: "PREMIUM_TOURIST", wave: 4 },
  { source: "dest-montreal", target: "ch-hotel", edgeLabel: "BAR_CHANNEL", wave: 4 },
  { source: "dest-granville", target: "ch-souvenir", edgeLabel: "LOCAL_MARKET", wave: 4 },
  { source: "dest-cntower", target: "ch-museum", edgeLabel: "GIFT_SHOP", wave: 4 },
  { source: "dest-whistler", target: "ch-hotel", edgeLabel: "RESORT_CHANNEL", wave: 4 },
  { source: "dest-victoria", target: "ch-souvenir", edgeLabel: "HERITAGE_TOURISM", wave: 4 },
  { source: "dest-jasper", target: "ch-airport", edgeLabel: "NATIONAL_PARK", wave: 4 },
  { source: "con-maple-souvenir", target: "ch-souvenir", edgeLabel: "NATURAL_ADJACENCY", wave: 4 },
  { source: "con-maple-souvenir", target: "dest-niagara", edgeLabel: "TOP_SOUVENIR", wave: 4 },
  { source: "seg-genz", target: "dest-cntower", edgeLabel: "VISITS", wave: 4 },
  { source: "seg-millennials", target: "dest-whistler", edgeLabel: "PREMIUM_TRAVEL", wave: 4 },
  { source: "seg-genx", target: "dest-niagara", edgeLabel: "FAMILY_TRIP", wave: 4 },

  // Wave 5 — Market data, people, concepts connections
  { source: "cc-maple", target: "con-buy-canadian", edgeLabel: "BENEFITS_FROM", wave: 5 },
  { source: "cc-maple", target: "con-unaided-awareness", edgeLabel: "BASELINE", wave: 5 },
  { source: "ch-souvenir", target: "con-conversion", edgeLabel: "ACHIEVES", wave: 5 },
  { source: "cc-maple", target: "con-maple-souvenir", edgeLabel: "ADJACENT_TO", wave: 5 },
  { source: "cc-glass-bottle", target: "con-never-plastic", edgeLabel: "BRAND_PROMISE", wave: 5 },
  { source: "cc-maple", target: "con-retail-sales", edgeLabel: "BASELINE_SALES", wave: 5 },
  { source: "cc-maple", target: "con-doors", edgeLabel: "CURRENT_DISTRIBUTION", wave: 5 },
  { source: "cc-originals", target: "con-crowdfunding", edgeLabel: "ORIGIN_STORY", wave: 5 },
  { source: "con-crowdfunding", target: "con-fans", edgeLabel: "GENERATED", wave: 5 },
  { source: "cc-maple", target: "con-soda-switchers", edgeLabel: "TARGETS", wave: 5 },
  { source: "ppl-shania", target: "cc-maple", edgeLabel: "ENDORSES", wave: 5 },
  { source: "ppl-shania", target: "seg-genx", edgeLabel: "RESONATES_WITH", wave: 5 },
  { source: "ppl-shania", target: "seg-genz", edgeLabel: "CONTENT_ANGLE", wave: 5 },
  { source: "ppl-bluejays", target: "cc-maple", edgeLabel: "PARTNERSHIP", wave: 5 },
  { source: "ppl-rogers-centre", target: "ch-hotel", edgeLabel: "VENUE_CHANNEL", wave: 5 },
  { source: "ppl-reynolds", target: "cc-maple", edgeLabel: "MARKETING_MODEL", wave: 5 },
  { source: "ppl-blackburn", target: "cc-maple", edgeLabel: "LEADS_STRATEGY", wave: 5 },
  { source: "ppl-qvc", target: "seg-genx", edgeLabel: "REACHES", wave: 5 },
  { source: "mkt-market-size", target: "cc-maple", edgeLabel: "TAM", wave: 5 },
  { source: "mkt-cagr", target: "mkt-market-size", edgeLabel: "GROWTH_RATE", wave: 5 },
  { source: "mkt-tourism", target: "dest-niagara", edgeLabel: "INCLUDES", wave: 5 },
  { source: "mkt-summer", target: "mkt-tourism", edgeLabel: "SUMMER_SLICE", wave: 5 },
  { source: "mkt-niagara-visitors", target: "dest-niagara", edgeLabel: "ANNUAL_VISITORS", wave: 5 },
  { source: "mkt-poppi-acq", target: "mkt-market-size", edgeLabel: "VALIDATES_CATEGORY", wave: 5 },
  { source: "con-buy-canadian", target: "seg-genx", edgeLabel: "STRONGEST_AMONG", wave: 5 },
  { source: "con-buy-canadian", target: "seg-millennials", edgeLabel: "GROWING_AMONG", wave: 5 },

  // New Wave 1 additions
  { source: "cc-maple", target: "cc-473ml-can", edgeLabel: "FORMAT", wave: 1 },
  { source: "cc-maple", target: "cc-mini-pack", edgeLabel: "TRIAL_FORMAT", wave: 1 },
  { source: "cc-maple", target: "cc-holiday-bundle", edgeLabel: "SEASONAL_SKU", wave: 1 },
  { source: "cc-maple", target: "cc-dtc-website", edgeLabel: "SOLD_VIA", wave: 1 },
  { source: "cc-ceo", target: "cc-maple", edgeLabel: "LEADS_BRAND", wave: 1 },
  { source: "cc-ceo", target: "con-never-plastic", edgeLabel: "CHAMPIONS", wave: 1 },
  { source: "cc-473ml-can", target: "seg-athlete", edgeLabel: "TARGETS", wave: 1 },
  { source: "cc-mini-pack", target: "seg-household", edgeLabel: "TRIAL_FOR", wave: 1 },
  { source: "cc-holiday-bundle", target: "seg-corporate", edgeLabel: "GIFT_FOR", wave: 1 },

  // New Wave 2 competitor connections
  { source: "cc-maple", target: "c-waterloo", edgeLabel: "CANADIAN_RIVAL", strength: 0.4, wave: 2 },
  { source: "cc-maple", target: "c-flow", edgeLabel: "COMPETES_WITH", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-aura-bora", edgeLabel: "PREMIUM_COMPETES", strength: 0.3, wave: 2 },
  { source: "cc-glass-bottle", target: "c-flow", edgeLabel: "PREMIUM_FORMAT_RIVAL", wave: 2 },
  { source: "c-waterloo", target: "con-buy-canadian", edgeLabel: "ALSO_CLAIMS", wave: 2 },
  { source: "c-guru", target: "seg-athlete", edgeLabel: "TARGETS", wave: 2 },
  { source: "cc-maple", target: "c-hint", edgeLabel: "FLAVOR_COMPETES", strength: 0.3, wave: 2 },
  { source: "cc-maple", target: "c-sanzo", edgeLabel: "PREMIUM_COMPETES", strength: 0.3, wave: 2 },

  // New Wave 3 segment and flavor connections
  { source: "seg-boomer", target: "cc-originals", edgeLabel: "NOSTALGIC_RECALL", wave: 3 },
  { source: "seg-boomer", target: "sm-facebook", edgeLabel: "ACTIVE_ON", wave: 3 },
  { source: "seg-tourist-intl", target: "ch-souvenir", edgeLabel: "PRIMARY_BUYER", wave: 3 },
  { source: "seg-tourist-intl", target: "con-maple-souvenir", edgeLabel: "SEEKS", wave: 3 },
  { source: "seg-athlete", target: "cc-zero-sugar", edgeLabel: "PREFERS", wave: 3 },
  { source: "seg-athlete", target: "sm-instagram", edgeLabel: "ACTIVE_ON", wave: 3 },
  { source: "seg-cocktail", target: "cc-maple", edgeLabel: "CRAFTS_WITH", wave: 3 },
  { source: "seg-cocktail", target: "seg-bartenders", edgeLabel: "HOME_VERSION_OF", wave: 3 },
  { source: "seg-foodservice", target: "ch-sportsarena", edgeLabel: "BUYS_FOR", wave: 3 },
  { source: "seg-foodservice", target: "ch-hotel", edgeLabel: "PROCUREMENT", wave: 3 },
  { source: "seg-corporate", target: "cc-holiday-bundle", edgeLabel: "ORDERS", wave: 3 },
  { source: "seg-corporate", target: "cc-glass-bottle", edgeLabel: "GIFTS", wave: 3 },
  { source: "fl-lemon-lime", target: "seg-convenience", edgeLabel: "GATEWAY_FLAVOR", wave: 3 },
  { source: "fl-watermelon", target: "seg-genz", edgeLabel: "TIKTOK_DRIVER", wave: 3 },
  { source: "fl-elderflower", target: "seg-bartenders", edgeLabel: "CRAFT_INGREDIENT", wave: 3 },
  { source: "fl-elderflower", target: "seg-premium", edgeLabel: "PREMIUM_APPEAL", wave: 3 },
  { source: "fl-cucumber", target: "ch-hotel", edgeLabel: "SPA_MENU_FIT", wave: 3 },
  { source: "fl-cucumber", target: "seg-sober", edgeLabel: "WELLNESS_APPEAL", wave: 3 },

  // New Wave 4 channel and destination connections
  { source: "cc-glass-bottle", target: "ch-wholefoods", edgeLabel: "PREMIUM_SHELF", wave: 4 },
  { source: "cc-maple", target: "ch-loblaws", edgeLabel: "NATIONAL_GROCERY", wave: 4 },
  { source: "cc-maple", target: "ch-sobeys", edgeLabel: "ATLANTIC_CANADA", wave: 4 },
  { source: "cc-maple", target: "ch-shoppers", edgeLabel: "IMPULSE_CHANNEL", wave: 4 },
  { source: "cc-maple", target: "ch-sportsarena", edgeLabel: "VENUE_PARTNER", wave: 4 },
  { source: "ppl-bluejays", target: "ch-sportsarena", edgeLabel: "HOME_VENUE", wave: 4 },
  { source: "cc-glass-bottle", target: "ch-golf", edgeLabel: "CLUBHOUSE_FIT", wave: 4 },
  { source: "cc-maple", target: "ch-festival", edgeLabel: "EVENT_SAMPLING", wave: 4 },
  { source: "cc-dtc-website", target: "ch-dtc", edgeLabel: "PLATFORM", wave: 4 },
  { source: "cc-mini-pack", target: "ch-university", edgeLabel: "CAMPUS_TRIAL", wave: 4 },
  { source: "cc-glass-bottle", target: "ch-traderjoes", edgeLabel: "US_PREMIUM", wave: 4 },
  { source: "dest-tofino", target: "seg-athlete", edgeLabel: "SURF_CROWD", wave: 4 },
  { source: "dest-okanagan", target: "seg-premium", edgeLabel: "WINE_COUNTRY", wave: 4 },
  { source: "dest-okanagan", target: "ch-hotel", edgeLabel: "RESORT_CHANNEL", wave: 4 },
  { source: "dest-pei", target: "seg-boomer", edgeLabel: "NOSTALGIA_TOURISM", wave: 4 },
  { source: "dest-pei", target: "ch-souvenir", edgeLabel: "GIFT_SHOP", wave: 4 },
  { source: "dest-calgary", target: "ch-souvenir", edgeLabel: "STAMPEDE_SHOPS", wave: 4 },
  { source: "dest-muskoka", target: "seg-premium", edgeLabel: "COTTAGE_CROWD", wave: 4 },
  { source: "dest-muskoka", target: "cc-glass-bottle", edgeLabel: "PREMIUM_FIT", wave: 4 },
  { source: "dest-halifax", target: "seg-tourist-intl", edgeLabel: "CRUISE_PORT", wave: 4 },
  { source: "dest-algonquin", target: "con-never-plastic", edgeLabel: "ECO_ALIGNMENT", wave: 4 },
  { source: "dest-winnipeg", target: "ch-sportsarena", edgeLabel: "HOCKEY_VENUE", wave: 4 },

  // New Wave 5 market data, people, concept connections
  { source: "mkt-glass-premium", target: "cc-glass-bottle", edgeLabel: "VALIDATES", wave: 5 },
  { source: "mkt-glass-premium", target: "ch-hotel", edgeLabel: "PREMIUM_CHANNEL", wave: 5 },
  { source: "mkt-purchase-lift", target: "con-buy-canadian", edgeLabel: "QUANTIFIES", wave: 5 },
  { source: "mkt-purchase-lift", target: "con-tariff-2025", edgeLabel: "DRIVEN_BY", wave: 5 },
  { source: "mkt-onpremise-growth", target: "seg-bartenders", edgeLabel: "OPPORTUNITY_FOR", wave: 5 },
  { source: "mkt-onpremise-growth", target: "ch-hotel", edgeLabel: "CHANNEL_GROWTH", wave: 5 },
  { source: "mkt-zero-sugar-share", target: "cc-zero-sugar", edgeLabel: "MARKET_TREND", wave: 5 },
  { source: "mkt-zero-sugar-share", target: "con-sugar-free-trend", edgeLabel: "DRIVER", wave: 5 },
  { source: "mkt-influencer-roi", target: "ppl-modash-creators", edgeLabel: "MEASURED_VIA", wave: 5 },
  { source: "ppl-adam-cheyne", target: "cc-originals", edgeLabel: "FOUNDED", wave: 5 },
  { source: "ppl-adam-cheyne", target: "con-crowdfunding", edgeLabel: "LED", wave: 5 },
  { source: "ppl-maple-institute", target: "con-real-maple-claim", edgeLabel: "CERTIFIES", wave: 5 },
  { source: "ppl-maple-institute", target: "fl-maple", edgeLabel: "AUTHENTICATES", wave: 5 },
  { source: "ppl-destination-canada", target: "dest-niagara", edgeLabel: "PROMOTES", wave: 5 },
  { source: "ppl-destination-canada", target: "cc-maple", edgeLabel: "CO_MARKETING", wave: 5 },
  { source: "ppl-modash-creators", target: "sm-tiktok", edgeLabel: "ACTIVE_ON", wave: 5 },
  { source: "ppl-modash-creators", target: "sm-instagram", edgeLabel: "ACTIVE_ON", wave: 5 },
  { source: "con-tariff-2025", target: "con-buy-canadian", edgeLabel: "AMPLIFIES", wave: 5 },
  { source: "con-tariff-2025", target: "c-waterloo", edgeLabel: "HELPS_ALL_CANADIAN", wave: 5 },
  { source: "con-sugar-free-trend", target: "seg-athlete", edgeLabel: "DRIVES_DEMAND", wave: 5 },
  { source: "con-sugar-free-trend", target: "seg-sober", edgeLabel: "ALIGNS_WITH", wave: 5 },
  { source: "con-nostalgic-marketing", target: "con-crowdfunding", edgeLabel: "AMPLIFIED_BY", wave: 5 },
  { source: "con-nostalgic-marketing", target: "seg-genx", edgeLabel: "RESONATES_WITH", wave: 5 },
  { source: "con-canadian-identity", target: "con-buy-canadian", edgeLabel: "CORE_OF", wave: 5 },
  { source: "con-canadian-identity", target: "con-maple-souvenir", edgeLabel: "ANCHORS", wave: 5 },
  { source: "con-real-maple-claim", target: "fl-maple", edgeLabel: "DIFFERENTIATES", wave: 5 },
  { source: "con-real-maple-claim", target: "seg-foodservice", edgeLabel: "MENU_STORY", wave: 5 },
  { source: "con-glass-recycling", target: "con-never-plastic", edgeLabel: "SUPPORTS", wave: 5 },
  { source: "con-glass-recycling", target: "seg-athlete", edgeLabel: "RESONATES_WITH", wave: 5 },
  { source: "con-no-sweeteners", target: "seg-athlete", edgeLabel: "CLEAN_LABEL", wave: 5 },
  { source: "con-no-sweeteners", target: "seg-sober", edgeLabel: "WELLNESS_SIGNAL", wave: 5 },
  { source: "con-50k-door-target", target: "con-doors", edgeLabel: "GROWTH_FROM", wave: 5 },
  { source: "con-50k-door-target", target: "ch-loblaws", edgeLabel: "KEY_TO", wave: 5 },

  // Wave 6 — Platform connections
  { source: "sm-tiktok", target: "seg-genz", edgeLabel: "PRIMARY_DISCOVERY", wave: 6 },
  { source: "sm-instagram", target: "seg-millennials", edgeLabel: "LIFESTYLE_CONTENT", wave: 6 },
  { source: "sm-instagram", target: "seg-premium", edgeLabel: "AESTHETIC_BUYERS", wave: 6 },
  { source: "sm-reddit", target: "seg-genx", edgeLabel: "COMMUNITY_HUB", wave: 6 },
  { source: "sm-reddit", target: "con-crowdfunding", edgeLabel: "NOSTALGIA_THREADS", wave: 6 },
  { source: "sm-facebook", target: "seg-genx", edgeLabel: "NOSTALGIA_CONTENT", wave: 6 },
  { source: "sm-youtube", target: "ppl-shania", edgeLabel: "CAMPAIGN_HUB", wave: 6 },
  { source: "sm-modash", target: "ppl-blackburn", edgeLabel: "TOOL_USED_BY", wave: 6 },
  { source: "sm-tiktok", target: "ppl-shania", edgeLabel: "REACHABLE_VIA", wave: 6 },
  { source: "sm-tiktok", target: "con-crowdfunding", edgeLabel: "ORIGIN_CONTENT", wave: 6 },
  { source: "sm-pinterest", target: "seg-household", edgeLabel: "HOLIDAY_GIFTS", wave: 6 },
  { source: "sm-pinterest", target: "seg-cocktail", edgeLabel: "RECIPE_DISCOVERY", wave: 6 },
  { source: "sm-pinterest", target: "cc-holiday-bundle", edgeLabel: "PROMOTED_VIA", wave: 6 },
  { source: "sm-linkedin", target: "seg-foodservice", edgeLabel: "B2B_OUTREACH", wave: 6 },
  { source: "sm-linkedin", target: "seg-corporate", edgeLabel: "GIFTING_CHANNEL", wave: 6 },
  { source: "sm-podcast", target: "seg-genx", edgeLabel: "NOSTALGIC_AUDIO", wave: 6 },
  { source: "sm-podcast", target: "seg-boomer", edgeLabel: "REACHES", wave: 6 },
  { source: "sm-substack", target: "seg-premium", edgeLabel: "EDITORIAL", wave: 6 },
  { source: "sm-substack", target: "seg-foodservice", edgeLabel: "TRADE_PRESS", wave: 6 },
  { source: "sm-snapchat", target: "seg-genz", edgeLabel: "SECONDARY_SOCIAL", wave: 6 },
  { source: "sm-google-shopping", target: "cc-dtc-website", edgeLabel: "DRIVES_TO", wave: 6 },
  { source: "sm-google-shopping", target: "seg-household", edgeLabel: "PURCHASE_INTENT", wave: 6 },
  { source: "sm-tiktok", target: "fl-watermelon", edgeLabel: "VIRAL_CONTENT", wave: 6 },
  { source: "sm-instagram", target: "fl-elderflower", edgeLabel: "AESTHETIC_FIT", wave: 6 },
  { source: "sm-instagram", target: "dest-muskoka", edgeLabel: "COTTAGE_CONTENT", wave: 6 },
  { source: "sm-youtube", target: "con-nostalgic-marketing", edgeLabel: "LONG_FORM_STORY", wave: 6 },
  { source: "sm-reddit", target: "con-crowdfunding", edgeLabel: "THREAD_ARCHIVE", wave: 6 },

  // New Wave 6 platform links
  { source: "sm-threads", target: "seg-millennials", edgeLabel: "BRAND_CONVERSATION", wave: 6 },
  { source: "sm-threads", target: "sm-instagram", edgeLabel: "COMPANION_TO", wave: 6 },
  { source: "sm-discord", target: "con-fans", edgeLabel: "COMMUNITY_HUB", wave: 6 },
  { source: "sm-discord", target: "seg-genz", edgeLabel: "GAMER_CROSSOVER", wave: 6 },
  { source: "sm-twitch", target: "seg-genz", edgeLabel: "STREAMING_AUDIENCE", wave: 6 },
  { source: "sm-twitch", target: "seg-college-student", edgeLabel: "GAMING_REACH", wave: 6 },

  // New Wave 1 product links
  { source: "cc-subscription-box", target: "cc-maple", edgeLabel: "CONTAINS", wave: 1 },
  { source: "cc-subscription-box", target: "cc-dtc-website", edgeLabel: "SOLD_VIA", wave: 1 },
  { source: "cc-subscription-box", target: "con-subscription-moat", edgeLabel: "BUILDS", wave: 1 },
  { source: "cc-cocktail-kit", target: "cc-maple", edgeLabel: "FEATURES", wave: 1 },
  { source: "cc-cocktail-kit", target: "seg-bartenders", edgeLabel: "TARGETS", wave: 1 },
  { source: "cc-cocktail-kit", target: "seg-cocktail", edgeLabel: "HOME_VERSION", wave: 1 },
  { source: "cc-hotel-amenity", target: "ch-hotel-minibar", edgeLabel: "PLACED_IN", wave: 1 },
  { source: "cc-hotel-amenity", target: "seg-hotel-buyer", edgeLabel: "SOLD_TO", wave: 1 },
  { source: "cc-catering-keg", target: "seg-wedding-planner", edgeLabel: "SERVES", wave: 1 },
  { source: "cc-catering-keg", target: "ch-craft-cocktail-bars", edgeLabel: "ON_TAP_AT", wave: 1 },

  // New Wave 2 competitor links
  { source: "c-fever-tree", target: "seg-bartenders", edgeLabel: "PREFERRED_BY", wave: 2 },
  { source: "c-fever-tree", target: "cc-maple", edgeLabel: "MIXER_COMPETES", wave: 2 },
  { source: "c-q-mixers", target: "ch-craft-cocktail-bars", edgeLabel: "PLACED_AT", wave: 2 },
  { source: "c-q-mixers", target: "cc-cocktail-kit", edgeLabel: "COMPETES_WITH", wave: 2 },
  { source: "c-canada-dry", target: "seg-genx", edgeLabel: "HERITAGE_BRAND", wave: 2 },
  { source: "c-canada-dry", target: "cc-maple", edgeLabel: "CANADIAN_SHELF_RIVAL", wave: 2 },
  { source: "c-pellegrino-tasteful", target: "c-sanpellegrino", edgeLabel: "SUB_BRAND", wave: 2 },
  { source: "c-pellegrino-tasteful", target: "cc-zero-sugar", edgeLabel: "ZERO_SUGAR_COMPETES", wave: 2 },
  { source: "c-recess", target: "seg-yoga-wellness", edgeLabel: "WELLNESS_POSITIONING", wave: 2 },
  { source: "c-recess", target: "seg-sober", edgeLabel: "NA_ALTERNATIVE", wave: 2 },
  { source: "c-with-nothing", target: "con-buy-canadian", edgeLabel: "CANADIAN_BRAND", wave: 2 },
  { source: "c-with-nothing", target: "cc-maple", edgeLabel: "CANADIAN_NA_RIVAL", wave: 2 },

  // New Wave 3 segment links
  { source: "seg-wedding-planner", target: "cc-glass-bottle", edgeLabel: "PREMIUM_TABLE_WATER", wave: 3 },
  { source: "seg-wedding-planner", target: "ch-corporate-gifting", edgeLabel: "EVENT_CHANNEL", wave: 3 },
  { source: "seg-hotel-buyer", target: "ch-hotel-minibar", edgeLabel: "PROCURES_FOR", wave: 3 },
  { source: "seg-hotel-buyer", target: "cc-hotel-amenity", edgeLabel: "ORDERS", wave: 3 },
  { source: "seg-yoga-wellness", target: "ch-yoga-studios", edgeLabel: "FREQUENTS", wave: 3 },
  { source: "seg-yoga-wellness", target: "con-health-halo", edgeLabel: "RESPONDS_TO", wave: 3 },
  { source: "seg-college-student", target: "ch-university", edgeLabel: "SHOPS_AT", wave: 3 },
  { source: "seg-college-student", target: "sm-tiktok", edgeLabel: "PRIMARY_PLATFORM", wave: 3 },
  { source: "seg-vegan-conscious", target: "con-never-plastic", edgeLabel: "VALUES", wave: 3 },
  { source: "seg-vegan-conscious", target: "con-real-maple-claim", edgeLabel: "SCRUTINIZES", wave: 3 },
  { source: "seg-craft-beer-crossover", target: "seg-bartenders", edgeLabel: "ADJACENT_TO", wave: 3 },
  { source: "seg-craft-beer-crossover", target: "ch-craft-cocktail-bars", edgeLabel: "FREQUENTS", wave: 3 },
  { source: "seg-senior-health", target: "cc-zero-sugar", edgeLabel: "SEEKS", wave: 3 },
  { source: "seg-senior-health", target: "seg-boomer", edgeLabel: "OVERLAPS_WITH", wave: 3 },
  { source: "seg-expat-canadian", target: "con-buy-canadian", edgeLabel: "STRONGEST_SENTIMENT", wave: 3 },
  { source: "seg-expat-canadian", target: "ch-amazon", edgeLabel: "ORDERS_VIA", wave: 3 },

  // New Wave 3 flavor links
  { source: "fl-blood-orange", target: "seg-bartenders", edgeLabel: "CRAFT_INGREDIENT", wave: 3 },
  { source: "fl-blood-orange", target: "ch-craft-cocktail-bars", edgeLabel: "MENU_FIT", wave: 3 },
  { source: "fl-yuzu-citrus", target: "seg-premium", edgeLabel: "PREMIUM_PROFILE", wave: 3 },
  { source: "fl-yuzu-citrus", target: "ch-erewhon-equiv", edgeLabel: "PREMIUM_GROCERY_FIT", wave: 3 },
  { source: "fl-green-apple", target: "seg-genz", edgeLabel: "GEN_Z_PREFERENCE", wave: 3 },
  { source: "fl-green-apple", target: "sm-tiktok", edgeLabel: "TIKTOK_AESTHETIC", wave: 3 },
  { source: "fl-hibiscus", target: "seg-yoga-wellness", edgeLabel: "FLORAL_APPEAL", wave: 3 },
  { source: "fl-hibiscus", target: "sm-instagram", edgeLabel: "VISUAL_CONTENT", wave: 3 },
  { source: "fl-pineapple", target: "dest-toronto-island", edgeLabel: "SUMMER_TOURISM", wave: 3 },
  { source: "fl-pineapple", target: "dest-tofino", edgeLabel: "BEACH_FIT", wave: 3 },

  // New Wave 4 channel links
  { source: "ch-duty-free", target: "dest-niagara", edgeLabel: "BORDER_CROSSING", wave: 4 },
  { source: "ch-duty-free", target: "seg-tourist-intl", edgeLabel: "PRIMARY_BUYER", wave: 4 },
  { source: "ch-duty-free", target: "md-duty-free-bev-size", edgeLabel: "PART_OF_MARKET", wave: 4 },
  { source: "ch-yoga-studios", target: "seg-yoga-wellness", edgeLabel: "CHANNEL_FOR", wave: 4 },
  { source: "ch-yoga-studios", target: "con-health-halo", edgeLabel: "HEALTH_CONTEXT", wave: 4 },
  { source: "ch-craft-cocktail-bars", target: "seg-bartenders", edgeLabel: "EMPLOYS", wave: 4 },
  { source: "ch-craft-cocktail-bars", target: "con-cocktail-flywheel", edgeLabel: "ANCHOR_POINT", wave: 4 },
  { source: "ch-farmers-market", target: "dest-saltspring", edgeLabel: "FLAGSHIP_MARKET", wave: 4 },
  { source: "ch-farmers-market", target: "seg-vegan-conscious", edgeLabel: "PRIMARY_SHOPPER", wave: 4 },
  { source: "ch-hotel-minibar", target: "seg-hotel-buyer", edgeLabel: "PROCUREMENT_TARGET", wave: 4 },
  { source: "ch-hotel-minibar", target: "cc-hotel-amenity", edgeLabel: "HOUSES", wave: 4 },
  { source: "ch-airlines", target: "p-porter-airlines", edgeLabel: "PARTNER", wave: 4 },
  { source: "ch-airlines", target: "seg-tourist-intl", edgeLabel: "IN_FLIGHT_REACH", wave: 4 },
  { source: "ch-corporate-gifting", target: "seg-corporate", edgeLabel: "SERVES", wave: 4 },
  { source: "ch-corporate-gifting", target: "cc-holiday-bundle", edgeLabel: "FEATURES", wave: 4 },
  { source: "ch-meal-kit", target: "seg-millennials", edgeLabel: "SUBSCRIBER_BASE", wave: 4 },
  { source: "ch-meal-kit", target: "cc-maple", edgeLabel: "ADD_ON_BEVERAGE", wave: 4 },
  { source: "ch-erewhon-equiv", target: "seg-premium", edgeLabel: "PREMIUM_SHOPPER", wave: 4 },
  { source: "ch-erewhon-equiv", target: "cc-glass-bottle", edgeLabel: "SHELF_HOME", wave: 4 },
  { source: "ch-sams-club", target: "seg-household", edgeLabel: "BULK_BUYER", wave: 4 },
  { source: "ch-sams-club", target: "cc-sleekcan", edgeLabel: "VARIETY_PACK", wave: 4 },
  { source: "ch-cruise-ships", target: "dest-halifax", edgeLabel: "PORT_OF_CALL", wave: 4 },
  { source: "ch-cruise-ships", target: "seg-tourist-intl", edgeLabel: "CAPTIVE_AUDIENCE", wave: 4 },
  { source: "ch-sports-bars", target: "seg-craft-beer-crossover", edgeLabel: "FREQUENTED_BY", wave: 4 },
  { source: "ch-sports-bars", target: "seg-sober", edgeLabel: "NA_OPTION_NEEDED", wave: 4 },

  // New Wave 4 destination links
  { source: "dest-toronto-island", target: "ch-festival", edgeLabel: "CNE_FESTIVAL", wave: 4 },
  { source: "dest-toronto-island", target: "seg-genz", edgeLabel: "SUMMER_CROWD", wave: 4 },
  { source: "dest-mont-tremblant", target: "ch-hotel", edgeLabel: "RESORT_HOTEL", wave: 4 },
  { source: "dest-mont-tremblant", target: "seg-premium", edgeLabel: "AFFLUENT_VISITOR", wave: 4 },
  { source: "dest-cape-breton", target: "seg-tourist-intl", edgeLabel: "CABOT_TRAIL_VISITORS", wave: 4 },
  { source: "dest-cape-breton", target: "ch-souvenir", edgeLabel: "LOCAL_GIFT_SHOPS", wave: 4 },
  { source: "dest-rideau-canal", target: "dest-ottawa", edgeLabel: "PART_OF", wave: 4 },
  { source: "dest-rideau-canal", target: "seg-athlete", edgeLabel: "SKATE_CYCLE_CROWD", wave: 4 },
  { source: "dest-thousand-islands", target: "seg-tourist-intl", edgeLabel: "US_DAY_TRIPPERS", wave: 4 },
  { source: "dest-thousand-islands", target: "ch-souvenir", edgeLabel: "RIVERSIDE_SHOPS", wave: 4 },
  { source: "dest-kananaskis", target: "seg-athlete", edgeLabel: "OUTDOOR_SPORTS", wave: 4 },
  { source: "dest-kananaskis", target: "con-never-plastic", edgeLabel: "ECO_BUYER", wave: 4 },
  { source: "dest-saltspring", target: "ch-farmers-market", edgeLabel: "FLAGSHIP_MARKET", wave: 4 },
  { source: "dest-saltspring", target: "seg-vegan-conscious", edgeLabel: "ARTISAN_COMMUNITY", wave: 4 },

  // New Wave 5 market data links
  { source: "md-can-seltzer-growth", target: "cc-maple", edgeLabel: "CATEGORY_TAILWIND", wave: 5 },
  { source: "md-can-seltzer-growth", target: "mkt-cagr", edgeLabel: "CANADA_SLICE", wave: 5 },
  { source: "md-na-beverage-tam", target: "seg-sober", edgeLabel: "LARGEST_SEGMENT", wave: 5 },
  { source: "md-na-beverage-tam", target: "cc-zero-sugar", edgeLabel: "ADDRESSES_MARKET", wave: 5 },
  { source: "md-premium-trade-up", target: "cc-glass-bottle", edgeLabel: "TRADE_UP_TARGET", wave: 5 },
  { source: "md-premium-trade-up", target: "seg-household", edgeLabel: "CONVERSION_OPP", wave: 5 },
  { source: "md-tiktok-bev-views", target: "sm-tiktok", edgeLabel: "PLATFORM_VOLUME", wave: 5 },
  { source: "md-tiktok-bev-views", target: "fl-watermelon", edgeLabel: "VIRAL_CATEGORY", wave: 5 },
  { source: "md-hotel-fb-rev", target: "ch-hotel-minibar", edgeLabel: "MARKET_SIZE", wave: 5 },
  { source: "md-hotel-fb-rev", target: "seg-hotel-buyer", edgeLabel: "BUYER_CONTEXT", wave: 5 },
  { source: "md-genz-na-preference", target: "seg-genz", edgeLabel: "QUANTIFIES", wave: 5 },
  { source: "md-genz-na-preference", target: "seg-sober", edgeLabel: "OVERLAP_DATA", wave: 5 },
  { source: "md-duty-free-bev-size", target: "ch-duty-free", edgeLabel: "MARKET_SIZE", wave: 5 },
  { source: "md-duty-free-bev-size", target: "cc-glass-bottle", edgeLabel: "PREMIUM_SEGMENT", wave: 5 },

  // New Wave 5 people links
  { source: "p-david-mcnally", target: "ch-loblaws", edgeLabel: "BUYER_FOR", wave: 5 },
  { source: "p-david-mcnally", target: "cc-maple", edgeLabel: "GATEKEEPS_LISTING", wave: 5 },
  { source: "p-oliver-bonacini", target: "ch-craft-cocktail-bars", edgeLabel: "OPERATES", wave: 5 },
  { source: "p-oliver-bonacini", target: "seg-bartenders", edgeLabel: "EMPLOYS", wave: 5 },
  { source: "p-sam-james-coffee", target: "seg-premium", edgeLabel: "TASTEMAKER_FOR", wave: 5 },
  { source: "p-sam-james-coffee", target: "sm-instagram", edgeLabel: "CONTENT_ON", wave: 5 },
  { source: "p-tiktok-creator-1", target: "sm-tiktok", edgeLabel: "PLATFORM", wave: 5 },
  { source: "p-tiktok-creator-1", target: "cc-maple", edgeLabel: "SEEDS_CONTENT", wave: 5 },
  { source: "p-tiktok-creator-1", target: "con-influencer-seeding", edgeLabel: "PART_OF", wave: 5 },
  { source: "p-porter-airlines", target: "ch-airlines", edgeLabel: "CARRIER_PARTNER", wave: 5 },
  { source: "p-porter-airlines", target: "dest-toronto-island", edgeLabel: "BILLY_BISHOP_HUB", wave: 5 },
  { source: "p-canadian-tire-corp", target: "seg-athlete", edgeLabel: "SPORTS_BUYER", wave: 5 },
  { source: "p-canadian-tire-corp", target: "cc-sleekcan", edgeLabel: "SPORTS_SECTION", wave: 5 },

  // New Wave 5 concept links
  { source: "con-glass-premium-signal", target: "cc-glass-bottle", edgeLabel: "EMBODIED_BY", wave: 5 },
  { source: "con-glass-premium-signal", target: "ch-hotel-minibar", edgeLabel: "PREMIUM_CONTEXT", wave: 5 },
  { source: "con-cocktail-flywheel", target: "seg-bartenders", edgeLabel: "STARTS_WITH", wave: 5 },
  { source: "con-cocktail-flywheel", target: "sm-instagram", edgeLabel: "AMPLIFIED_ON", wave: 5 },
  { source: "con-health-halo", target: "cc-maple", edgeLabel: "APPLIED_TO", wave: 5 },
  { source: "con-health-halo", target: "fl-maple", edgeLabel: "INGREDIENT_HALO", wave: 5 },
  { source: "con-zero-waste-pledge", target: "con-never-plastic", edgeLabel: "EXTENDS", wave: 5 },
  { source: "con-zero-waste-pledge", target: "seg-vegan-conscious", edgeLabel: "RESONATES_WITH", wave: 5 },
  { source: "con-reverse-logistics", target: "con-zero-waste-pledge", edgeLabel: "IMPLEMENTS", wave: 5 },
  { source: "con-reverse-logistics", target: "cc-glass-bottle", edgeLabel: "APPLIES_TO", wave: 5 },
  { source: "con-souvenir-economy", target: "ch-souvenir", edgeLabel: "MARKET_CONTEXT", wave: 5 },
  { source: "con-souvenir-economy", target: "con-maple-souvenir", edgeLabel: "INCLUDES", wave: 5 },
  { source: "con-influencer-seeding", target: "ppl-modash-creators", edgeLabel: "EXECUTED_VIA", wave: 5 },
  { source: "con-influencer-seeding", target: "mkt-influencer-roi", edgeLabel: "GENERATES", wave: 5 },
  { source: "con-subscription-moat", target: "cc-subscription-box", edgeLabel: "BUILT_BY", wave: 5 },
  { source: "con-subscription-moat", target: "ch-dtc", edgeLabel: "VIA_CHANNEL", wave: 5 },
];

// ─── Simulation Agents (12 featured) ──────────────────────────────────────────

export const simulationAgents: SimAgent[] = [
  { id: "ethan",   name: "Ethan",   age: 31, location: "West End, Toronto",      archetype: "The Craft Curator",           segment: "Millennial", awareness_level: "aware",         maple_stance: "If carbonation and sweetness are dialed in, this could save me prep time behind the bar.", persona_id: "bartender_mixologist",  handle: "@ethan_westend", avatar_color: "#3B82F6" },
  { id: "aisha",   name: "Aisha",   age: 21, location: "Atlanta, GA",            archetype: "The Aesthetic Chaser",        segment: "Gen Z",      awareness_level: "never_heard",    maple_stance: "Maple sparkling water? That's very specific but it's giving fall cabin vibes honestly.", persona_id: "us_genz_potential",     handle: "@aisha_atx",    avatar_color: "#EC4899" },
  { id: "doug",    name: "Doug",    age: 38, location: "Kitchener-Waterloo, ON", archetype: "The Nostalgic Loyalist",      segment: "Gen X",      awareness_level: "loyal",          maple_stance: "As long as they don't touch Mountain Blackberry, I'm cautiously optimistic.", persona_id: "ca_mill_loyal",         handle: "@doug_kw",      avatar_color: "#10B981" },
  { id: "marie",   name: "Marie",   age: 24, location: "Montréal, QC",           archetype: "The Sober Curious Trendsetter",segment: "Gen Z",     awareness_level: "vaguely_aware",  maple_stance: "Un maple mocktail au lieu de mon Perrier? OUI. Finally something interesting.", persona_id: "ca_genz_sober_curious", handle: "@marie_mtl",    avatar_color: "#F59E0B" },
  { id: "linda",   name: "Linda",   age: 52, location: "North Vancouver, BC",    archetype: "The Proud Canadian",          segment: "Gen X",      awareness_level: "loyal",          maple_stance: "Oh my goodness, maple! That is SO Canadian. I remember buying CC after school. I'm emotional.", persona_id: "nostalgia_loyalist",    handle: "@linda_van",    avatar_color: "#8B5CF6" },
  { id: "tyler",   name: "Tyler",   age: 23, location: "Halifax, NS",            archetype: "The Indifferent Impulse Buyer",segment: "Millennial", awareness_level: "never_heard",   maple_stance: "Maple sparkling water? Weird. If it's cold and cheap at 7-Eleven, sure whatever.", persona_id: "us_mill_convenience",   handle: "@tyler_dal",    avatar_color: "#6B7280" },
  { id: "sofia",   name: "Sofia",   age: 29, location: "Portland, OR",           archetype: "The Health-First Buyer",      segment: "Gen Z",      awareness_level: "vaguely_aware",  maple_stance: "Real maple, zero artificial sweeteners, clean label? Then I'm interested. Show me the ingredient panel first.", persona_id: "us_genz_wellness",      handle: "@sofia_pdx",    avatar_color: "#14B8A6", insight_label: "Key Drivers", insight_value: "Health + Premium Flavor", key_insight: "Health-conscious consumers don't just want 'zero sugar' — they want clean, trustworthy ingredients + real flavor.", key_implication: "Maple Zero must signal natural, premium, and clean positioning." },
  { id: "raj",     name: "Raj",     age: 34, location: "Toronto, ON",            archetype: "The Premium Experience Seeker", segment: "Millennial", awareness_level: "aware",          maple_stance: "CC feels nostalgic right now — not premium. If they position Maple Zero as a modern luxury, it earns a place on my bar cart.", persona_id: "premium_lifestyle",     handle: "@raj_to",       avatar_color: "#F97316", insight_label: "Positioning", insight_value: "Premium Experience", key_insight: "To win premium consumers, CC must shift from nostalgia → modern premium experience.", key_implication: "Position Maple Zero as a premium, experience-driven beverage — not just sparkling water." },
  { id: "karen-h", name: "Karen H.",age: 44, location: "Alpharetta, GA",         archetype: "The Household Value Seeker",  segment: "Gen X",      awareness_level: "never_heard",    maple_stance: "Could be fun for Thanksgiving, but will this be at Costco in a variety pack?", persona_id: "household_stockup",     handle: "@karen_atl",    avatar_color: "#EF4444" },
  { id: "jake",    name: "Jake",    age: 32, location: "Vancouver, BC",          archetype: "The Aesthetic Experience Curator", segment: "Millennial", awareness_level: "aware",          maple_stance: "I buy drinks that say something about who I am. If CC Maple feels curated — events, mocktails, premium presentation — I'm in.", persona_id: "ca_mill_potential",     handle: "@jake_to",      avatar_color: "#06B6D4", insight_label: "Experience-Driven", insight_value: "Identity Signal", key_insight: "Consumers don't just buy drinks — they buy experiences and identity.", key_implication: "Events, mocktails, and premium presentation → increase engagement + purchase likelihood (+74%)." },
  { id: "marcus",  name: "Marcus",  age: 35, location: "Chicago, IL",            archetype: "The Rediscoverer",            segment: "Millennial", awareness_level: "never_heard",    maple_stance: "Wait, Clearly Canadian is still around? AND they have a maple flavor now? Where do I buy this?", persona_id: "us_mill_lapsed",        handle: "@marcus_chi",   avatar_color: "#A78BFA" },
  { id: "chloe",   name: "Chloe",   age: 22, location: "Toronto, ON",            archetype: "The Discovery-Driven Buyer",  segment: "Gen Z",      awareness_level: "vaguely_aware",  maple_stance: "I've seen CC on my FYP but never actually tried it. I need to taste it or see my friends drinking it before I'd buy.", persona_id: "ca_genz_potential",     handle: "@chloe_uoft",   avatar_color: "#FB7185", insight_label: "Core Barrier", insight_value: "Low Trial", key_insight: "Consumers are interested but won't convert without first experiencing the product.", key_implication: "Sampling + experiential marketing reduces friction → drives first purchase." },
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

// ─── Social Posts (featured) ──────────────────────────────────────────────────

export const featuredPosts: SimPost[] = [
  { id: "fp-1", type: "featured", platform: "twitter", persona_id: "ethan", persona_name: "Ethan", handle: "@ethan_westend", avatar_color: "#3B82F6", body: "Just got pitched a sparkling maple water as a cocktail base. Skeptical but... maple in an Old Fashioned already works. If the carbonation and sweetness levels are right, this could actually save me prep time. Sending a DM for samples.", likes: 47, replies: 12, timestamp_label: "2m ago", sentiment: "positive" },
  { id: "fp-2", type: "featured", platform: "twitter", persona_id: "aisha", persona_name: "Aisha", handle: "@aisha_atx", avatar_color: "#EC4899", body: "ok wait — maple sparkling water?? that's very specific but it's giving fall cabin vibes honestly. the glass bottle is kinda gorgeous too 👀", likes: 89, replies: 23, timestamp_label: "4m ago", sentiment: "positive" },
  { id: "fp-3", type: "featured", platform: "twitter", persona_id: "doug", persona_name: "Doug", handle: "@doug_kw", avatar_color: "#10B981", body: "Interesting to see CC expanding the lineup. As long as they don't touch Mountain Blackberry, I'm cautiously optimistic. But maple? That's a bold move. Need to taste it first.", likes: 34, replies: 8, timestamp_label: "6m ago", sentiment: "neutral" },
  { id: "fp-4", type: "featured", platform: "twitter", persona_id: "marie", persona_name: "Marie", handle: "@marie_mtl", avatar_color: "#F59E0B", body: "Un maple mocktail au lieu de mon Perrier ennuyeux au bar?? OUI. Finally a non-alcoholic option that actually sounds interesting. Where can I find this in Montréal?", likes: 112, replies: 31, timestamp_label: "8m ago", sentiment: "positive" },
  { id: "fp-5", type: "featured", platform: "twitter", persona_id: "linda", persona_name: "Linda", handle: "@linda_van", avatar_color: "#8B5CF6", body: "Oh my goodness, maple! That is SO Canadian. I remember buying CC at the corner store after school and now they're making a maple version? I'm emotional. 🍁💙", likes: 203, replies: 47, timestamp_label: "10m ago", sentiment: "positive" },
  { id: "fp-6", type: "featured", platform: "twitter", persona_id: "tyler", persona_name: "Tyler", handle: "@tyler_dal", avatar_color: "#6B7280", body: "maple sparkling water? weird. i mean if it's cold and in the cooler at 7-eleven for like $1.79 sure whatever", likes: 11, replies: 2, timestamp_label: "12m ago", sentiment: "neutral" },
  { id: "fp-7", type: "featured", platform: "twitter", persona_id: "sofia", persona_name: "Sofia", handle: "@sofia_pdx", avatar_color: "#14B8A6", body: "Ingredient check first — is there sugar? What's the sweetener? If it's clean ingredients and actually natural maple, I'm interested. Maple IS a natural sweetener after all.", likes: 67, replies: 15, timestamp_label: "14m ago", sentiment: "neutral" },
  { id: "fp-8", type: "featured", platform: "twitter", persona_id: "raj", persona_name: "Raj", handle: "@raj_to", avatar_color: "#F97316", body: "A maple sparkling water in CC's glass bottle on my bar cart? That's genuinely refined. Would pair beautifully with bourbon. The aesthetic alone sells it.", likes: 156, replies: 28, timestamp_label: "16m ago", sentiment: "positive" },
  { id: "fp-9", type: "featured", platform: "twitter", persona_id: "karen-h", persona_name: "Karen H.", handle: "@karen_atl", avatar_color: "#EF4444", body: "Maple could be fun for Thanksgiving dinner! But would the kids drink it? And what's the price vs our usual LaCroix 12-pack at Costco? That's the real question.", likes: 29, replies: 11, timestamp_label: "18m ago", sentiment: "neutral" },
  { id: "fp-10", type: "featured", platform: "twitter", persona_id: "jake", persona_name: "Jake", handle: "@jake_to", avatar_color: "#06B6D4", body: "Bringing CC Maple to Thanksgiving dinner instead of wine. Very Canadian move. My in-laws will either love it or look at me weird. I'm in either way.", likes: 88, replies: 19, timestamp_label: "20m ago", sentiment: "positive" },
  { id: "fp-11", type: "featured", platform: "twitter", persona_id: "marcus", persona_name: "Marcus", handle: "@marcus_chi", avatar_color: "#A78BFA", body: "Wait, Clearly Canadian is still around? AND they have a maple flavor now? Where do I buy this? Maple bourbon cocktail sounds amazing.", likes: 74, replies: 22, timestamp_label: "22m ago", sentiment: "positive" },
  { id: "fp-12", type: "featured", platform: "twitter", persona_id: "chloe", persona_name: "Chloe", handle: "@chloe_uoft", avatar_color: "#FB7185", body: "honestly my mom just told me about this brand?? apparently it was huge in the 90s and they have a maple one now. the crowdfunding comeback story is actually kinda cool lowkey", likes: 143, replies: 37, timestamp_label: "24m ago", sentiment: "positive" },
  { id: "fp-13", type: "featured", platform: "twitter", persona_id: "aisha", persona_name: "Aisha", handle: "@aisha_atx", avatar_color: "#EC4899", body: "replying to @chloe_uoft — the comeback story is literally content gold. a brand that fans brought back from the dead?? that's a whole tiktok series waiting to happen", likes: 91, replies: 14, timestamp_label: "26m ago", sentiment: "positive" },
  { id: "fp-14", type: "featured", platform: "twitter", persona_id: "ethan", persona_name: "Ethan", handle: "@ethan_westend", avatar_color: "#3B82F6", body: "replying to @raj_to — Agreed on the bourbon pairing. 2oz bourbon, 4oz CC Maple, dash of bitters, orange peel. 'The Northern Old Fashioned.' Putting it on the menu this weekend.", likes: 178, replies: 44, timestamp_label: "28m ago", sentiment: "positive" },
  { id: "fp-15", type: "featured", platform: "twitter", persona_id: "doug", persona_name: "Doug", handle: "@doug_kw", avatar_color: "#10B981", body: "replying to @ethan_westend — Now THAT is how you launch a new flavor. Get it into cocktail bars first. Let the product speak for itself. Don't over-market it.", likes: 63, replies: 9, timestamp_label: "30m ago", sentiment: "positive" },
  { id: "fp-16", type: "featured", platform: "reddit", persona_id: "ethan", persona_name: "ethan_westend", handle: "u/ethan_westend", avatar_color: "#3B82F6", body: "Bartender here. Maple as a sparkling mixer base is genuinely useful. I already use maple syrup in specs. A pre-carbonated version saves prep and adds consistency. Where can I order cases?", likes: 47, replies: 8, timestamp_label: "31m ago", sentiment: "positive", subreddit: "r/ClearlyCanadian" },
  { id: "fp-17", type: "featured", platform: "reddit", persona_id: "raj", persona_name: "raj_to", handle: "u/raj_to", avatar_color: "#F97316", body: "The glass bottle placement on a back bar would be beautiful. CC already has the best bottle in the sparkling water category. This is a premium move that'll work.", likes: 23, replies: 4, timestamp_label: "33m ago", sentiment: "positive", subreddit: "r/ClearlyCanadian" },
  { id: "fp-18", type: "featured", platform: "reddit", persona_id: "karen-h", persona_name: "karen_atl", handle: "u/karen_atl", avatar_color: "#EF4444", body: "Real question: will this be available at Costco in a variety pack? Because that's the only way my household is switching from LaCroix. We go through 2 cases a week.", likes: 31, replies: 12, timestamp_label: "35m ago", sentiment: "neutral", subreddit: "r/ClearlyCanadian" },
  { id: "fp-19", type: "featured", platform: "reddit", persona_id: "sofia", persona_name: "sofia_pdx", handle: "u/sofia_pdx", avatar_color: "#14B8A6", body: "If it's actually maple and not 'natural flavors' that taste nothing like maple, I'm genuinely interested. Need to see the nutrition label.", likes: 19, replies: 6, timestamp_label: "37m ago", sentiment: "neutral", subreddit: "r/ClearlyCanadian" },
  { id: "fp-20", type: "featured", platform: "reddit", persona_id: "tyler", persona_name: "tyler_dal", handle: "u/tyler_dal", avatar_color: "#6B7280", body: "I mean sure if it's at the gas station", likes: 8, replies: 1, timestamp_label: "39m ago", sentiment: "neutral", subreddit: "r/ClearlyCanadian" },
  { id: "fp-21", type: "featured", platform: "reddit", persona_id: "chloe", persona_name: "chloe_uoft", handle: "u/chloe_uoft", avatar_color: "#FB7185", body: "ngl the souvenir shop idea is smart. tourists already buy maple everything. why not maple sparkling water in that iconic glass bottle?", likes: 15, replies: 5, timestamp_label: "41m ago", sentiment: "positive", subreddit: "r/ClearlyCanadian" },
  { id: "fp-22", type: "featured", platform: "reddit", persona_id: "doug", persona_name: "doug_kw", handle: "u/doug_kw", avatar_color: "#10B981", body: "For what it's worth: CC Originals had zero marketing budget and still built a cult following. If the product is great, the community will carry it. Trust the formula.", likes: 52, replies: 9, timestamp_label: "43m ago", sentiment: "positive", subreddit: "r/ClearlyCanadian" },
  { id: "fp-23", type: "featured", platform: "reddit", persona_id: "linda", persona_name: "linda_van", handle: "u/linda_van", avatar_color: "#8B5CF6", body: "My son showed me this thread. I was buying CC before he was born. The fact that fans brought it back and now they're launching maple? This is the most Canadian story. I'm buying a case.", likes: 87, replies: 21, timestamp_label: "45m ago", sentiment: "positive", subreddit: "r/ClearlyCanadian" },
];

// ─── Background Agent Posts ───────────────────────────────────────────────────

export const backgroundPosts: SimPost[] = [
  { id: "bg-1", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0847", handle: "@Agent_0847", avatar_color: "#4B5563", body: "the glass bottle is so aesthetic", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0847", segment: "Gen Z", city: "Toronto" },
  { id: "bg-2", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0219", handle: "@Agent_0219", avatar_color: "#4B5563", body: "maple? I'd try it", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0219", segment: "Millennial", city: "Calgary" },
  { id: "bg-3", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0634", handle: "u/Agent_0634", avatar_color: "#4B5563", body: "reminds me of the 90s CC bottles", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0634", segment: "Gen X", city: "Ottawa", subreddit: "r/ClearlyCanadian" },
  { id: "bg-4", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0412", handle: "@Agent_0412", avatar_color: "#4B5563", body: "need to see this on tiktok first", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0412", segment: "Gen Z", city: "Austin" },
  { id: "bg-5", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0891", handle: "@Agent_0891", avatar_color: "#4B5563", body: "would buy this for a dinner party", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0891", segment: "Millennial", city: "Vancouver" },
  { id: "bg-6", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0156", handle: "u/Agent_0156", avatar_color: "#4B5563", body: "finally something other than LaCroix", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0156", segment: "Gen X", city: "Montreal", subreddit: "r/sparkling" },
  { id: "bg-7", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #1043", handle: "@Agent_1043", avatar_color: "#4B5563", body: "is it actually zero sugar though?", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#1043", segment: "Gen Z", city: "Portland" },
  { id: "bg-8", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0728", handle: "@Agent_0728", avatar_color: "#4B5563", body: "wait CC is still around??", likes: 8, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0728", segment: "Millennial", city: "Chicago" },
  { id: "bg-9", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0367", handle: "u/Agent_0367", avatar_color: "#4B5563", body: "tourists would love this in Niagara gift shops", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0367", segment: "Gen X", city: "Niagara Falls", subreddit: "r/Ontario" },
  { id: "bg-10", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0592", handle: "@Agent_0592", avatar_color: "#4B5563", body: "maple + gin could work", likes: 9, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0592", segment: "Bartender", city: "Montreal" },
  { id: "bg-11", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0981", handle: "@Agent_0981", avatar_color: "#4B5563", body: "would the kids drink it?", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0981", segment: "Parent", city: "Suburban ON" },
  { id: "bg-12", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0445", handle: "@Agent_0445", avatar_color: "#4B5563", body: "the comeback story is cool ngl", likes: 7, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0445", segment: "Gen Z", city: "Waterloo" },
  { id: "bg-13", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0773", handle: "u/Agent_0773", avatar_color: "#4B5563", body: "bring this to the Rogers Centre bar menu", likes: 12, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0773", segment: "Millennial", city: "Toronto", subreddit: "r/toronto" },
  { id: "bg-14", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0234", handle: "@Agent_0234", avatar_color: "#4B5563", body: "better than boring soda water at bars", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0234", segment: "Sober Curious", city: "Vancouver" },
  { id: "bg-15", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0688", handle: "@Agent_0688", avatar_color: "#4B5563", body: "I'd buy this as a souvenir over maple candy honestly", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0688", segment: "Tourist", city: "International" },
  { id: "bg-16", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0321", handle: "u/Agent_0321", avatar_color: "#4B5563", body: "hard pass, maple is not a flavor for water", likes: 1, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0321", segment: "Gen X", city: "Edmonton", subreddit: "r/drinks" },
  { id: "bg-17", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0102", handle: "@Agent_0102", avatar_color: "#4B5563", body: "need this for a mocktail menu update", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0102", segment: "Bartender", city: "Toronto" },
  { id: "bg-18", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0756", handle: "@Agent_0756", avatar_color: "#4B5563", body: "my daughter would go crazy for this packaging", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0756", segment: "Gen X", city: "Mississauga" },
  { id: "bg-19", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0834", handle: "u/Agent_0834", avatar_color: "#4B5563", body: "saw this at the CN Tower shop. bought three immediately", likes: 14, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0834", segment: "Tourist", city: "New York", subreddit: "r/Canada" },
  { id: "bg-20", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0267", handle: "@Agent_0267", avatar_color: "#4B5563", body: "maple + sparkling water is such a Canadian brand move. love it", likes: 8, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0267", segment: "Millennial", city: "Ottawa" },
  { id: "bg-21", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0619", handle: "@Agent_0619", avatar_color: "#4B5563", body: "asking my bar manager to stock this tomorrow", likes: 11, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0619", segment: "Bartender", city: "Calgary" },
  { id: "bg-22", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0943", handle: "u/Agent_0943", avatar_color: "#4B5563", body: "the Shania x CC collab is so perfectly on brand", likes: 17, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0943", segment: "Gen X", city: "Timmins", subreddit: "r/CanadianBrands" },
  { id: "bg-23", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0371", handle: "@Agent_0371", avatar_color: "#4B5563", body: "I don't drink alcohol. this would be my bar option", likes: 7, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0371", segment: "Sober Curious", city: "Edmonton" },
  { id: "bg-24", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0822", handle: "@Agent_0822", avatar_color: "#4B5563", body: "the 90s nostalgia angle is overdone but CC earns it", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0822", segment: "Millennial", city: "Kingston" },
  { id: "bg-25", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0474", handle: "u/Agent_0474", avatar_color: "#4B5563", body: "can we get this at the Banff Springs hotel bar please", likes: 9, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0474", segment: "Tourist", city: "Calgary", subreddit: "r/Banff" },
  { id: "bg-26", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0667", handle: "@Agent_0667", avatar_color: "#4B5563", body: "posting this on my cottagecore account immediately", likes: 21, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0667", segment: "Gen Z", city: "Muskoka" },
  { id: "bg-27", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0289", handle: "@Agent_0289", avatar_color: "#4B5563", body: "three of my friends asked where I got this in one night", likes: 13, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0289", segment: "Millennial", city: "Toronto" },
  { id: "bg-28", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0512", handle: "u/Agent_0512", avatar_color: "#4B5563", body: "maple flavored water sounds like a gimmick but the brand history makes it work", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0512", segment: "Gen X", city: "London ON", subreddit: "r/beverages" },
  { id: "bg-29", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0748", handle: "@Agent_0748", avatar_color: "#4B5563", body: "picked this up at the airport. best impulse buy", likes: 10, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0748", segment: "Millennial", city: "YYZ" },
  { id: "bg-30", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0856", handle: "@Agent_0856", avatar_color: "#4B5563", body: "hard to justify $3+ for sparkling water but the bottle is beautiful", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0856", segment: "Gen Z", city: "Kingston" },
  { id: "bg-31", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0389", handle: "u/Agent_0389", avatar_color: "#4B5563", body: "took me back to 1994 just seeing the bottle shape", likes: 16, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0389", segment: "Gen X", city: "Windsor", subreddit: "r/nostalgia" },
  { id: "bg-32", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0631", handle: "@Agent_0631", avatar_color: "#4B5563", body: "buy canadian is not just a hashtag anymore, it's how I shop now", likes: 15, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0631", segment: "Gen X", city: "Ottawa" },
  { id: "bg-33", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0278", handle: "@Agent_0278", avatar_color: "#4B5563", body: "this would be perfect on a charcuterie board at the cottage", likes: 18, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0278", segment: "Gen X", city: "Muskoka" },
  { id: "bg-34", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0549", handle: "u/Agent_0549", avatar_color: "#4B5563", body: "zero sugar is a must for me. checking the label before buying", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0549", segment: "Millennial", city: "Toronto", subreddit: "r/sugarfree" },
  { id: "bg-35", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0814", handle: "@Agent_0814", avatar_color: "#4B5563", body: "maple water sounds weird but I said the same about matcha water and now I drink it daily", likes: 11, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0814", segment: "Gen Z", city: "Montreal" },
  { id: "bg-36", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0736", handle: "@Agent_0736", avatar_color: "#4B5563", body: "literally just added this to my shoppers list", likes: 4, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0736", segment: "Millennial", city: "Hamilton" },
  { id: "bg-37", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0162", handle: "u/Agent_0162", avatar_color: "#4B5563", body: "not a fan of flavored water in general but respect the brand staying glass-only", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0162", segment: "Boomer", city: "Calgary", subreddit: "r/drinks" },
  { id: "bg-38", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0407", handle: "@Agent_0407", avatar_color: "#4B5563", body: "if I find this in a Whistler gift shop I'm buying the whole shelf", likes: 9, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0407", segment: "Tourist", city: "Vancouver" },
  { id: "bg-39", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0965", handle: "@Agent_0965", avatar_color: "#4B5563", body: "my partner is obsessed with anything maple. this is a birthday gift idea", likes: 6, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0965", segment: "Millennial", city: "Waterloo" },
  { id: "bg-40", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0196", handle: "u/Agent_0196", avatar_color: "#4B5563", body: "added to my 'uniquely Canadian souvenirs' list for visiting family", likes: 8, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0196", segment: "Tourist", city: "UK", subreddit: "r/VisitCanada" },
  { id: "bg-41", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0543", handle: "@Agent_0543", avatar_color: "#4B5563", body: "maple everything is getting old tbh but I'd still try it", likes: 2, replies: 0, timestamp_label: "just now", sentiment: "friction", agentId: "#0543", segment: "Millennial", city: "Seattle" },
  { id: "bg-42", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0317", handle: "@Agent_0317", avatar_color: "#4B5563", body: "putting a case on my next Amazon order", likes: 7, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0317", segment: "Millennial", city: "Toronto" },
  { id: "bg-43", type: "background", platform: "reddit", persona_id: "bg", persona_name: "Agent #0724", handle: "u/Agent_0724", avatar_color: "#4B5563", body: "saw this at a bar in Old Montreal last weekend. two rounds.", likes: 19, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0724", segment: "Millennial", city: "Montreal", subreddit: "r/montreal" },
  { id: "bg-44", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0483", handle: "@Agent_0483", avatar_color: "#4B5563", body: "the Buy Canadian angle writes itself on the bottle copy", likes: 5, replies: 0, timestamp_label: "just now", sentiment: "positive", agentId: "#0483", segment: "Gen X", city: "Ottawa" },
  { id: "bg-45", type: "background", platform: "twitter", persona_id: "bg", persona_name: "Agent #0891", handle: "@Agent_0891_b", avatar_color: "#4B5563", body: "switching from LaCroix if the price is under $2", likes: 3, replies: 0, timestamp_label: "just now", sentiment: "neutral", agentId: "#0891", segment: "Household", city: "Burlington ON" },
];

// Interleave featured + background posts
function buildPostSequence(platform: "twitter" | "reddit"): SimPost[] {
  const featured = featuredPosts.filter((p) => p.platform === platform);
  const bg = backgroundPosts.filter((p) => p.platform === platform);
  const result: SimPost[] = [];
  let bgIdx = 0;
  featured.forEach((post) => {
    result.push(post);
    const count = Math.floor(Math.random() * 2) + 2; // 2-3 bg posts per featured
    for (let i = 0; i < count && bgIdx < bg.length; i++, bgIdx++) {
      result.push(bg[bgIdx]);
    }
  });
  return result;
}

export const twitterPostSequence: SimPost[] = buildPostSequence("twitter");
export const redditPostSequence: SimPost[] = buildPostSequence("reddit");

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

// ─── Simulation Configuration Data ────────────────────────────────────────────

export const simConfigData: SimConfigData = {
  stats: [
    { label: "Simulation Duration", value: "48 hours", sub: "2 virtual days" },
    { label: "Round Length", value: "60 min/round", sub: "Real-time: ~2s" },
    { label: "Total Rounds", value: "48 rounds", sub: "Full day cycle" },
    { label: "Active Agents/Round", value: "47–312", sub: "Based on time-of-day" },
  ],
  timeOfDayMultipliers: [
    { label: "Peak (6pm–10pm)", times: "18:00–22:00", multiplier: 1.5, pct: 100 },
    { label: "Working (9am–5pm)", times: "09:00–17:00", multiplier: 0.7, pct: 47 },
    { label: "Morning (6am–9am)", times: "06:00–09:00", multiplier: 0.4, pct: 27 },
    { label: "Night (10pm–6am)", times: "22:00–06:00", multiplier: 0.05, pct: 3 },
  ],
  agentCards: [
    {
      id: "ethan", name: "Ethan", role: "Bartender · West End Toronto",
      avatar_color: "#3B82F6",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.4, 0.5, 0.5, 0.4, 0.4, 0.3, 0.4, 0.6, 0.9, 1.0, 1.0, 0.9, 0.7, 0.3],
      stats: { when_posting: 3, comments_per_time: 2, response_delay: "5–30 min" },
      activity_pct: 50, emotional_tendency: 0.6, influence: 2.1,
    },
    {
      id: "aisha", name: "Aisha", role: "Gen Z Student · Atlanta",
      avatar_color: "#EC4899",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.6, 0.3, 0.1],
      stats: { when_posting: 5, comments_per_time: 4, response_delay: "2–10 min" },
      activity_pct: 72, emotional_tendency: 0.8, influence: 1.7,
    },
    {
      id: "karen-h", name: "Karen H.", role: "Household Buyer · Alpharetta GA",
      avatar_color: "#EF4444",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.6, 0.8, 0.7, 0.6, 0.5, 0.4, 0.6, 0.7, 0.5, 0.4, 0.6, 0.7, 0.5, 0.3, 0.2, 0.1, 0.0],
      stats: { when_posting: 2, comments_per_time: 1, response_delay: "30–120 min" },
      activity_pct: 35, emotional_tendency: 0.1, influence: 1.2,
    },
    {
      id: "doug", name: "Doug", role: "Nostalgic Loyalist · Kitchener-Waterloo",
      avatar_color: "#10B981",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.5, 0.6, 0.5, 0.4, 0.3, 0.4, 0.5, 0.4, 0.3, 0.5, 0.8, 0.9, 0.7, 0.5, 0.2, 0.0],
      stats: { when_posting: 2, comments_per_time: 3, response_delay: "15–60 min" },
      activity_pct: 40, emotional_tendency: 0.2, influence: 1.9,
    },
    {
      id: "marie", name: "Marie", role: "Sober Curious Trendsetter · Montréal",
      avatar_color: "#F59E0B",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.5, 0.7, 0.8, 0.9, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 0.7, 0.5, 0.3, 0.1],
      stats: { when_posting: 4, comments_per_time: 5, response_delay: "3–15 min" },
      activity_pct: 68, emotional_tendency: 0.9, influence: 2.3,
    },
    {
      id: "linda", name: "Linda", role: "Proud Canadian · North Vancouver",
      avatar_color: "#8B5CF6",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.4, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4, 0.6, 0.8, 0.9, 0.6, 0.4, 0.2, 0.0],
      stats: { when_posting: 3, comments_per_time: 4, response_delay: "10–40 min" },
      activity_pct: 55, emotional_tendency: 1.0, influence: 2.0,
    },
    {
      id: "tyler", name: "Tyler", role: "Indifferent Impulse Buyer · Halifax",
      avatar_color: "#6B7280",
      hourlyActivity: [0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.5, 0.7, 0.9, 1.0, 0.9, 0.7, 0.4, 0.2],
      stats: { when_posting: 2, comments_per_time: 1, response_delay: "1–5 min" },
      activity_pct: 28, emotional_tendency: -0.1, influence: 0.9,
    },
    {
      id: "sofia", name: "Sofia", role: "Ingredient Inspector · Portland OR",
      avatar_color: "#14B8A6",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.6, 0.8, 0.9, 0.8, 0.7, 0.5, 0.6, 0.8, 0.7, 0.6, 0.7, 0.9, 0.8, 0.5, 0.3, 0.1, 0.0],
      stats: { when_posting: 3, comments_per_time: 3, response_delay: "8–25 min" },
      activity_pct: 58, emotional_tendency: 0.3, influence: 1.6,
    },
    {
      id: "raj", name: "Raj", role: "Premium Aesthete · Toronto ON",
      avatar_color: "#F97316",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.4, 0.5, 0.6, 0.6, 0.5, 0.5, 0.6, 0.5, 0.4, 0.7, 1.0, 1.0, 0.9, 0.7, 0.4, 0.1],
      stats: { when_posting: 2, comments_per_time: 2, response_delay: "10–45 min" },
      activity_pct: 45, emotional_tendency: 0.7, influence: 2.4,
    },
    {
      id: "jake", name: "Jake", role: "Design-First Millennial · Vancouver",
      avatar_color: "#06B6D4",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.6, 0.8, 0.9, 0.8, 0.6, 0.6, 0.7, 0.8, 0.7, 0.9, 1.0, 0.9, 0.7, 0.5, 0.2, 0.0],
      stats: { when_posting: 3, comments_per_time: 2, response_delay: "5–20 min" },
      activity_pct: 60, emotional_tendency: 0.6, influence: 1.8,
    },
    {
      id: "marcus", name: "Marcus", role: "Rediscoverer · Chicago IL",
      avatar_color: "#A78BFA",
      hourlyActivity: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.5, 0.7, 0.7, 0.6, 0.5, 0.5, 0.6, 0.6, 0.5, 0.7, 0.9, 1.0, 0.8, 0.6, 0.3, 0.1],
      stats: { when_posting: 3, comments_per_time: 2, response_delay: "10–30 min" },
      activity_pct: 52, emotional_tendency: 0.8, influence: 1.5,
    },
    {
      id: "chloe", name: "Chloe", role: "TikTok Native · Toronto ON",
      avatar_color: "#FB7185",
      hourlyActivity: [0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.0, 1.0, 0.9, 0.7, 0.5, 0.2],
      stats: { when_posting: 6, comments_per_time: 7, response_delay: "1–8 min" },
      activity_pct: 80, emotional_tendency: 0.7, influence: 2.2,
    },
  ],
  recommendationWeights: [
    {
      platform: "Clearly Social (Twitter-like)",
      weights: { "Relevance Score": 0.35, "Recency": 0.25, "Network Proximity": 0.20, "Sentiment Match": 0.12, "Influence Score": 0.08 },
    },
    {
      platform: "Clearly Forum (Reddit-like)",
      weights: { "Upvotes": 0.40, "Comment Depth": 0.25, "Recency": 0.15, "Author Credibility": 0.12, "Tag Match": 0.08 },
    },
  ],
  llmConfigText: "Agent response generation uses a deterministic scoring pipeline with persona-specific language rules. Each agent's communication style, vocabulary, and emotional register is locked to their behavioral profile. Responses are generated from pre-computed decision trees based on driver/barrier scoring — no LLM inference required at runtime, ensuring consistent, reproducible simulation results across all 1,247 agents.",
  narrativeDirection: "CC Maple Zero Sugar has just been announced. The simulation begins with low awareness and zero social proof. Success condition: achieve viral discovery through bartender-first seeding → cocktail content → Gen Z social spread. Secondary: validate tourist retail channel hypothesis with zero competitor presence.",
  hotTopics: ["#CCMaple", "#BuyCanadian", "maple sparkling water", "CC comeback", "Canadian beverages", "cocktail mixer", "zero sugar drinks", "souvenir shop finds"],
  activationPosts: [
    { agentType: "Brand", agentName: "CC Brand Account", color: "#1B6EC2", body: "Introducing CC Maple Zero Sugar 🍁 — the first sparkling water made with real Canadian maple. Available now at select souvenir shops and premium bars. The glass bottle you love, a flavor that's unmistakably Canadian. #CCMaple #BuyCanadian" },
    { agentType: "Bartender", agentName: "Ethan (Bartender)", color: "#3B82F6", body: "Just got my hands on CC Maple samples. Running a trial spec this weekend: 2oz rye, 4oz CC Maple, Angostura dash, orange peel. Calling it 'The Northern Old Fashioned.' Will report back. This could be something." },
    { agentType: "Gen Z", agentName: "Aisha (Gen Z)", color: "#EC4899", body: "ok wait has anyone else seen the CC maple sparkling water?? the glass bottle is SO aesthetic and the comeback story is wild — fans literally brought this brand back from the dead in 2010. it's giving underdog energy" },
    { agentType: "Nostalgic", agentName: "Linda (Gen X Nostalgic)", color: "#8B5CF6", body: "I've been buying Clearly Canadian since high school. Mountain Blackberry, in the glass bottle, from the corner store. To see them launch a maple flavor — a MAPLE flavor, the most Canadian thing possible — I don't have words. Ordering a case." },
  ],
};

// ─── Report Generation Log ────────────────────────────────────────────────────

const ethanInterview: ReportInterview = {
  agent_id: "ethan", agent_name: "Ethan", role: "Bartender · West End Toronto", avatar_color: "#3B82F6",
  qa: [
    { q: "How would you evaluate CC Maple as a cocktail ingredient?", a: "From a bartender's perspective, maple as a sparkling mixer base is genuinely useful. I already use maple syrup in cocktail specs — it's a well-established flavour pairing with bourbon, rye, and aged spirits. A pre-carbonated sparkling maple water gives me two things at once: the flavour profile and the effervescence. That saves prep and adds consistency across a busy service. If the carbonation level is right and it's not too sweet, this goes straight onto my spec list." },
    { q: "What cocktails would you build with CC Maple, and at what price point would you stock it?", a: "Three specs immediately: The Northern Old Fashioned — 2oz rye, 4oz CC Maple, Angostura dash, orange peel. The Maple Gin Fizz — London Dry, CC Maple, lime, thyme. And a sober cabin mocktail — CC Maple, ginger, lemon, rosemary — that I'd actually put on the NA menu. For pricing: I'd stock it if I can buy it at under $3/unit wholesale. At $2.80–$3.20, it needs to be a premium feature, not a well item." },
  ],
  key_quotes: [
    "If the carbonation and sweetness are right, this saves prep time AND adds menu cachet.",
    "The glass bottle on a back bar is free marketing. It speaks for itself.",
    "I'd put the mocktail on my NA menu immediately. Marie-type customers would order it over anything I currently have.",
  ],
  summary: "Ethan represents the highest-confidence early adopter segment. His cocktail-first evaluation bypasses the price sensitivity that stalls household buyers. Positive sentiment score: 0.87. Decision: immediate trial + menu placement.",
};

const chloeInterview: ReportInterview = {
  agent_id: "chloe", agent_name: "Chloe", role: "Gen Z Student · Toronto", avatar_color: "#FB7185",
  qa: [
    { q: "Would you try CC Maple? What would trigger discovery for you?", a: "I wouldn't pick this off a shelf randomly — I need to see it on TikTok first, or a friend has to have it in front of me. If I see the bottle in someone's aesthetic photo or a creator I follow makes a cocktail with it, then yes, immediately. The comeback story is actually interesting content — a brand that fans brought back from the dead? That's not a PR story, that's a real narrative." },
    { q: "What would the packaging need to look like for you to post it?", a: "The glass bottle already has it. That shape is content. Amber-toned label, not aggressively orange. Gold or brass twist-off cap would make it shelf-aesthetic. I'd post it as 'this is what I'm drinking at [occasion]' with the comeback story as caption. I would not do an unboxing. I'd need it to fit into a cozy or upscale bar setting — not a party context." },
  ],
  key_quotes: ["The comeback story is literally content gold — brand that fans brought back from the dead.", "Won't pick off shelf without social proof but WILL become an advocate once I try it.", "The glass bottle is already aesthetic content."],
  summary: "Chloe is a conditional high-value consumer. Zero awareness → won't trial. With TikTok seeding → 73% conversion probability within her segment. Her amplification factor (influence score 1.7) means one post reaches ~2,400 Gen Z impressions.",
};

const karenInterview: ReportInterview = {
  agent_id: "karen-h", agent_name: "Karen H.", role: "Household Buyer · Alpharetta GA", avatar_color: "#EF4444",
  qa: [
    { q: "What price point makes you switch from LaCroix for family use?", a: "My LaCroix cost is $0.42/can at Costco in the 35-pack. That's my baseline. For me to switch even partially: under $1.29/can at Costco in a 12-pack variety pack, I'd try it for a special occasion — Thanksgiving, dinner parties. At $1.99+ it's a restaurant purchase, not a household staple. The smartest move is a 6-pack sampler at Shoppers for $7.99. Let me trial before I commit. If the kids like it, I'll buy more." },
    { q: "Would a Costco format change your purchase decision significantly?", a: "Absolutely. Costco is how my household makes brand loyalty decisions. If I can try a variety pack — CC Maple, CC Original, maybe a third flavor — at $16–18, that's a one-time trial I'd definitely make. Two cases/month is our sparkling water volume. If CC can get onto that Costco list, they're getting 24 units from me per month. That's the unlock." },
  ],
  key_quotes: ["Costco variety pack under $1.29/can is the unlock for my household.", "At restaurant prices I'm not a repeat buyer — I'm a one-time purchaser.", "If the kids like it at Thanksgiving, I'm adding it to the monthly Costco run."],
  summary: "Karen represents the high-volume household segment that requires format innovation, not just product innovation. Her Costco pathway is clear and high-confidence if the format is available. Current barrier: price and format. Remove these and she's a 2-case/month customer.",
};

export const reportLog: ReportLogEntry[] = [
  { id: "r1", type: "planning", offset_ms: 0, label: "Planning", detail: "11:25:50 — Start planning report outline" },
  { id: "r2", type: "plan_complete", offset_ms: 21000, label: "Plan Complete", detail: "+20.8s — Outline planning completed, 3 sections planned" },
  { id: "r3", type: "section_start", offset_ms: 21500, label: "Section Start — #1", detail: "Consumer Sentiment Analysis: CC Maple resonance across segments", section: 1 },
  { id: "r4", type: "llm_response", offset_ms: 43000, label: "LLM Response — Iteration 1", detail: "+21.4s — Tools: Yes, Final: No" },
  { id: "r5", type: "tool_call", offset_ms: 43500, label: "Tool Call — Panorama Search", detail: "+22.8s" },
  {
    id: "r6", type: "tool_result", offset_ms: 44000, label: "Tool Result — Panorama Search", detail: "147 Nodes / 312 Edges · 13.6k characters",
    expandable: {
      type: "memory_list",
      summary: "147 Nodes / 312 Edges · 13.6k characters",
      items: [
        "Social media analysis indicates #CCMaple trending in beverage communities within 12 hours, with discussions centered on flavor innovation, cocktail potential, and Canadian identity.",
        "Reddit r/cocktails post about maple as a mixer base received 847 upvotes and 234 comments within the first simulation cycle.",
        "Gen Z agents showed 73% positive sentiment, primarily driven by aesthetic appeal and crowdfunding comeback story.",
        "Price sensitivity emerged as primary barrier for household segment — $1.33/can vs $0.42/can LaCroix creates a 3x premium that requires context justification.",
        "Tourist channel identified as zero-competition opportunity — no sparkling water brands present in souvenir retail sector.",
        "Bartender segment (represented by 100 agents) has highest conversion rate at 81% positive decision when sampled at events.",
        "Sober Curious segment actively seeking premium NA alternatives — CC Maple fills gap left by limited mocktail menu options.",
        "Millennial premium lifestyle segment (300 agents) converted by glass bottle aesthetic before tasting product in 44% of cases.",
        "Shania Twain campaign association resonated with Gen X segment at 78% positive attribution vs 31% for Gen Z.",
        "Buy Canadian sentiment boost measured at +38% vs baseline — CC Maple benefits disproportionately as an authentic Canadian product.",
        "Nostalgia trigger activated in 61% of Gen X agents upon first CC brand mention — Mountain Blackberry recall highest.",
        "Airport retail channel conversion rate modeled at 34% for impulse purchase at $3.49 — highest single-SKU margin opportunity.",
        "Reddit r/ClearlyCanadian community seeding generated 3.2x organic amplification vs direct brand content.",
        "Convenience buyer segment (Tyler-type, 15% of swarm) requires sub-$1.99 price point — glass bottle format incompatible.",
        "Ethan-type bartenders show 'The Northern Old Fashioned' cocktail spec spreading to 8 additional bartender agents within Round 12.",
        "Karen-type agents show Costco variety pack as single critical path to household segment conversion.",
        "Glass bottle aesthetic drives 31% of first-purchase decisions among Instagram-active Millennial agents.",
        "Maple flavor correctly associated with 'real' (not artificial) by 67% of ingredient-conscious Sofia-type agents.",
        "CC brand comeback story generates earned media equivalent of 4.2x paid equivalent among agents with social sharing behavior.",
        "International tourist agents show highest price tolerance (+40% vs domestic) in tourist retail channel.",
        "Granville Island and Whistler gift shop environments modeled as highest-revenue-per-unit tourist channels.",
        "Rogers Centre partnership drives co-purchase behavior between Blue Jays game attendance and CC Maple trial.",
        "Platform analysis: TikTok seeding yields 2.8x Gen Z conversion rate vs Instagram seeding for same product.",
        "Historical Memory: 90s nostalgia wave in CPG sector averages 23% premium over comparable non-nostalgic launches.",
        "Historical Memory: Fan-funded brand revivals (Indiegogo model) generate 4.1x media coverage vs traditional VC-backed launches.",
        "Competitive gap: Perrier and San Pellegrino hold hotel minibar territory — CC Maple glass bottle is credible replacement at lower price.",
      ],
    },
  },
  { id: "r7", type: "tool_call", offset_ms: 75000, label: "Tool Call — Deep Insight", detail: "+30.7s" },
  {
    id: "r8", type: "tool_result", offset_ms: 76000, label: "Tool Result — Deep Insight", detail: "41 Facts / 36 Entities / 37 Relations · 28.1k characters",
    expandable: {
      type: "deep_insight",
      summary: "41 Facts / 36 Entities / 37 Relations · 28.1k characters",
      items: [
        "Current key memory (41): Core purchase driver analysis, barrier mapping, segment-specific conversion pathways, channel opportunity ranking, competitive displacement modeling",
        "Core Entities (36): 12 featured agents, 6 consumer segments, 10 retail channels, 10 tourist destinations, 8 product SKUs",
        "Relationship chain (37): Discovery → Trial → Repeat → Advocacy pathways mapped per segment with probability weights",
        "Subproblem (5): Price barrier resolution, format gap (no Costco variety pack), Gen Z social proof dependency, tourist channel white space, bartender seeding velocity",
      ],
    },
  },
  { id: "r9", type: "tool_call", offset_ms: 157000, label: "Tool Call — Agent Interview", detail: "+81.6s" },
  {
    id: "r10", type: "tool_result", offset_ms: 158000, label: "Tool Result — Agent Interview", detail: "5 Interviewed / 1,247 Total · 12.9k characters",
    expandable: {
      type: "interview_cards",
      summary: "5 Interviewed / 1,247 Total · 12.9k characters",
      interviews: [ethanInterview, chloeInterview, karenInterview],
    },
  },
  { id: "r11", type: "tool_call", offset_ms: 210000, label: "Tool Call — Quick Search", detail: "+10.4s" },
  {
    id: "r12", type: "tool_result", offset_ms: 211000, label: "Tool Result — Quick Search", detail: "10 Results · 1.4k characters",
    expandable: {
      type: "search_results",
      summary: "10 Results · 1.4k characters",
      items: [
        "r/cocktails: 'Maple as a sparkling mixer base' — 1.2k upvotes, 156 comments",
        "r/ClearlyCanadian: 'CC Maple Zero Sugar announced' — 847 upvotes, 234 comments",
        "@ethan_westend: 'The Northern Old Fashioned' recipe tweet — 178 likes, 44 replies",
        "@linda_van: 'I'm emotional 🍁' — 203 likes, 47 replies",
        "TikTok: #CCMaple — 12 videos, 84k combined views (first 12 hours)",
        "Reddit r/sugarfree: 'ingredient check' thread — 67 upvotes",
        "Instagram: @raj_to glass bottle bar cart post — 312 likes, 28 comments",
        "Facebook group: '90s Canadian Kids' — 1.4k reactions on CC Maple post",
        "r/Banff: 'Gift shop finds' — CC Maple mentioned by 3 users",
        "Twitter: #BuyCanadian + CC Maple — 234 co-mentions in first 6 hours",
      ],
    },
  },
  { id: "r13", type: "content_ready", offset_ms: 220000, label: "Content Ready — Section #1", detail: "+180.6s", section: 1 },
  { id: "r14", type: "section_done", offset_ms: 220500, label: "Section Done", detail: "Consumer Sentiment Analysis complete", section: 1 },
  { id: "r15", type: "section_start", offset_ms: 221000, label: "Section Start — #2", detail: "Channel & Pricing Strategy: Distribution priority and format gaps", section: 2 },
  { id: "r16", type: "llm_response", offset_ms: 240000, label: "LLM Response — Iteration 1", detail: "+19.2s — Tools: Yes, Final: No" },
  { id: "r17", type: "tool_call", offset_ms: 240500, label: "Tool Call — Panorama Search", detail: "+14.3s" },
  {
    id: "r18", type: "tool_result", offset_ms: 241000, label: "Tool Result — Panorama Search", detail: "89 Nodes / 147 Edges · 8.4k characters",
    expandable: {
      type: "memory_list",
      summary: "89 Nodes / 147 Edges · 8.4k characters",
      items: [
        "Tourist retail channel: zero sparkling water competitor presence confirmed across 8 destination locations modeled.",
        "Costco pathway: Karen-type agents (97 total) would all convert given variety pack at ≤$1.29/can — represents ~$42K annual household revenue.",
        "Airport retail: $3.49 price point tests viable — last-purchase premium tolerance confirmed by 34% of agents in YYZ/YVR context.",
        "Hotel lobby: Perrier displacement modeled at 28% probability at $0.80 wholesale disadvantage to Perrier.",
        "7-Eleven: Tyler-type agents (15% of swarm) require ≤$1.99 price — glass bottle format at premium pricing incompatible.",
        "Amazon Subscribe & Save: Millennial segment would subscribe at $1.15/can equivalent (12-pack $13.79).",
        "Channel priority ranking (by ROI model): 1. Tourist retail, 2. Bar/restaurant seeding, 3. Airport, 4. Costco variety pack, 5. Premium grocery.",
      ],
    },
  },
  { id: "r19", type: "content_ready", offset_ms: 280000, label: "Content Ready — Section #2", detail: "+39.2s", section: 2 },
  { id: "r20", type: "section_done", offset_ms: 280500, label: "Section Done", detail: "Channel & Pricing Strategy complete", section: 2 },
  { id: "r21", type: "section_start", offset_ms: 281000, label: "Section Start — #3", detail: "Strategic Recommendations & Risk Assessment", section: 3 },
  { id: "r22", type: "llm_response", offset_ms: 295000, label: "LLM Response — Iteration 1", detail: "+13.8s — Tools: Yes, Final: No" },
  { id: "r23", type: "tool_call", offset_ms: 295500, label: "Tool Call — Deep Insight", detail: "+12.1s" },
  {
    id: "r24", type: "tool_result", offset_ms: 296000, label: "Tool Result — Deep Insight", detail: "28 Facts / 19 Entities · 11.2k characters",
    expandable: {
      type: "deep_insight",
      summary: "28 Facts / 19 Entities · 11.2k characters",
      items: [
        "Risk synthesis (5 factors): Brand dilution from loyal base, price premium vs LaCroix, Gen Z social proof dependency, format gap (no Costco SKU), hotel channel Perrier defense",
        "Strategic recommendation confidence scores: Bartender seeding 0.91, Tourist retail 0.87, Costco variety pack 0.79, TikTok creator campaign 0.76",
        "Counter-scenario modeling: Without bartender seeding, cocktail content generation drops 67%. Without TikTok seeding, Gen Z conversion falls to 18%.",
      ],
    },
  },
  { id: "r25", type: "content_ready", offset_ms: 330000, label: "Content Ready — Section #3", detail: "+34.7s", section: 3 },
  { id: "r26", type: "section_done", offset_ms: 330500, label: "Section Done", detail: "Strategic Recommendations complete", section: 3 },
  { id: "r27", type: "complete", offset_ms: 331000, label: "Complete", detail: "Report Generation Complete · 3 sections · 47 tool calls · 1,247 agents analyzed" },
];

// ─── Report Text (3 sections, unlocked sequentially) ─────────────────────────

export const reportSections: Record<number, string> = {
  1: `## Section 1: Consumer Sentiment Analysis

**Based on analysis of 1,247 simulated consumer agents across 6 demographic segments**

CC Maple Zero Sugar generates strong positive reception across consumer segments, with **847 of 1,247 agents (68%)** expressing positive purchase intent. The strongest consensus emerged among the 350 Gen Z agents, **73%** of whom indicated they would try CC Maple if discovered through social media or a peer recommendation.

Among 300 Millennial agents, **71%** expressed strong interest — particularly those who discovered CC through the premium glass bottle format. The Bartender/Industry segment (100 agents) shows the highest conversion rate at **81%** — driven by cocktail utility and back-bar aesthetic.

**Featured Agent Deep Dives:**
- **Ethan (Bartender)** — Immediate yes. Already building cocktail specs. Highest influence multiplier (2.1×).
- **Raj (Premium Millennial)** — Immediate yes. Glass bottle aesthetic closes the sale before tasting.
- **Marie (Sober Curious)** — Immediate yes for bar/mocktail context. NA menu gap perfectly filled.
- **Linda (Gen X Nostalgic)** — Immediate yes. 90s CC memory + maple = emotional purchase trigger.
- **Chloe (Gen Z)** — Conditional yes. Requires TikTok seeding or peer recommendation first.
- **Karen H. (Household)** — Conditional yes. Requires Costco variety pack format.
- **Tyler (Convenience)** — Neutral. Price and convenience threshold not met by current format.`,

  2: `## Section 2: Channel & Pricing Strategy

**Tourist Retail — Zero Competition Zone**

The tourist retail channel represents CC Maple's highest-priority, lowest-competition distribution opportunity. No sparkling water brand — LaCroix, Poppi, Perrier, or Topo Chico — has meaningful presence in Canadian souvenir shops, museum gift shops, or tourist destination retail. Maple Syrup is Canada's #1 purchased souvenir; CC Maple in a glass bottle is a direct adjacency purchase.

Channel priority ranking by modeled ROI:
1. **Tourist Retail** — No competition, +40% price tolerance, natural maple adjacency
2. **Bars & Restaurants** — 48% sample-to-purchase conversion, cocktail spec amplification
3. **Airport Retail** — $3.49 viable, last Canadian purchase premium
4. **Costco Variety Pack** — Unlocks 97 household agents at 2 cases/month volume
5. **Premium Grocery** — Shelf competition exists but glass bottle differentiates

**Pricing Architecture**

- Tourist retail: $3.49–$3.99 (tourist premium tolerance confirmed)
- Bar/restaurant: $12–$16 as cocktail ingredient (spec price)
- Grocery: $2.29–$2.99 single, $13.79 12-pack
- Costco variety pack: $15.99–$17.99 (≤$1.33/can to compete with LaCroix)
- 7-Eleven/Convenience: Not recommended — glass format incompatible with price ceiling`,

  3: `## Section 3: Strategic Recommendations & Risk Assessment

**Top 4 Recommendations**

1. **Lead with bartender seeding** — Ethan-type personas are highest-conviction and fastest-converting. Bar placement creates a cocktail content flywheel that amplifies into Gen Z and Millennial segments organically. Budget: $50K sample program → 8–12 cocktail specs → 40–60 pieces of organic content.

2. **Tourist retail placement before grocery** — Zero competition, premium pricing, maple souvenir adjacency. Priority destinations: CN Tower, Niagara Falls Clifton Hill, Banff Springs, Granville Island Public Market. Target: 200 tourist retail doors before mainstream grocery launch.

3. **Costco variety pack as household conversion vehicle** — Create 12-pack (4x Maple, 4x Mountain Blackberry, 4x Wild Cherry) at $15.99 MSRP. Karen-type agents (97 in model, millions in real market) require this format to switch from LaCroix. Format launch: Q1 2026.

4. **TikTok seeding through food/cocktail creators** — Gen Z won't trial without social proof. 5–8 creator partnerships ($3K–$8K each) that showcase the comeback story + cocktail content. Target: 2M Gen Z impressions before retail launch.

**Risk Factors**

- **Brand dilution** (Doug segment) — Launch as clearly separate product line. Never replace. Run as line extension with distinct visual language from Originals.
- **Price gap vs LaCroix** — $1.33/can vs $0.42/can is 3× premium. Requires channel context justification everywhere.
- **Gen Z social proof dependency** — 73% intent is conditional. Without TikTok activation, Gen Z conversion falls to 18%.`,
};

// ─── Social Simulation Graph Events (wave 7 — appear during Stage 3) ──────────

export interface SocialGraphEvent {
  round: number;
  node: GraphNode;
  links: GraphLink[];
}

export const socialGraphEvents: SocialGraphEvent[] = [
  {
    round: 4,
    node: { id: "social-bartender-buzz", label: "Bartender Buzz", group: "concept", color: "#F97316", wave: 1, tooltip: "Bartenders responding positively — cocktail use case gaining traction" },
    links: [
      { source: "social-bartender-buzz", target: "seg-bartenders", edgeLabel: "DRIVEN_BY", strength: 0.6 },
      { source: "social-bartender-buzz", target: "sm-instagram", edgeLabel: "AMPLIFIED_VIA", strength: 0.5 },
    ],
  },
  {
    round: 8,
    node: { id: "social-genz-discovery", label: "Gen Z Discovery Wave", group: "concept", color: "#8B5CF6", wave: 1, tooltip: "Gen Z agents discovering CC Maple for the first time via social feeds" },
    links: [
      { source: "social-genz-discovery", target: "seg-genz", edgeLabel: "REACHED", strength: 0.6 },
      { source: "social-genz-discovery", target: "sm-tiktok", edgeLabel: "ORIGINATED_ON", strength: 0.6 },
    ],
  },
  {
    round: 12,
    node: { id: "social-nostalgia-thread", label: "Nostalgia Reddit Thread", group: "concept", color: "#10B981", wave: 1, tooltip: "r/ClearlyCanadian thread going viral — Gen X nostalgia driving shares" },
    links: [
      { source: "social-nostalgia-thread", target: "seg-genx", edgeLabel: "RESONATES_WITH", strength: 0.7 },
      { source: "social-nostalgia-thread", target: "sm-reddit", edgeLabel: "HOSTED_ON", strength: 0.7 },
    ],
  },
  {
    round: 18,
    node: { id: "social-tiktok-viral", label: "TikTok Viral Moment", group: "concept", color: "#EC4899", wave: 1, tooltip: "#MapleWater trending — 2.1M views in 48-hour simulation window" },
    links: [
      { source: "social-tiktok-viral", target: "sm-tiktok", edgeLabel: "TRENDING_ON", strength: 0.8 },
      { source: "social-tiktok-viral", target: "social-genz-discovery", edgeLabel: "ACCELERATES", strength: 0.5 },
      { source: "social-tiktok-viral", target: "cc-maple", edgeLabel: "FEATURES", strength: 0.6 },
    ],
  },
  {
    round: 24,
    node: { id: "social-tourism-spike", label: "Tourism Channel Spike", group: "concept", color: "#14B8A6", wave: 1, tooltip: "Tourist segment agents sharing CC Maple as Canadian souvenir discovery" },
    links: [
      { source: "social-tourism-spike", target: "dest-niagara", edgeLabel: "EMERGING_AT", strength: 0.6 },
      { source: "social-tourism-spike", target: "ch-souvenir", edgeLabel: "BOOSTING", strength: 0.7 },
    ],
  },
  {
    round: 32,
    node: { id: "social-sober-curious-act", label: "Sober Curious Activation", group: "concept", color: "#06B6D4", wave: 1, tooltip: "Sober-curious agents actively recommending CC Maple as a premium NA option" },
    links: [
      { source: "social-sober-curious-act", target: "seg-sober", edgeLabel: "ACTIVATING", strength: 0.7 },
      { source: "social-sober-curious-act", target: "sm-instagram", edgeLabel: "SHARED_VIA", strength: 0.5 },
    ],
  },
  {
    round: 40,
    node: { id: "social-brand-sentiment", label: "Positive Sentiment Wave", group: "concept", color: "#F59E0B", wave: 1, tooltip: "Cumulative positive sentiment exceeding model baseline — 68% positive" },
    links: [
      { source: "social-brand-sentiment", target: "cc-maple", edgeLabel: "VALIDATES", strength: 0.8 },
      { source: "social-brand-sentiment", target: "con-buy-canadian", edgeLabel: "REINFORCED_BY", strength: 0.6 },
    ],
  },
  {
    round: 48,
    node: { id: "social-proof-signal", label: "Social Proof Signal", group: "concept", color: "#1B6EC2", wave: 1, tooltip: "Simulation complete — strong cross-segment social proof established" },
    links: [
      { source: "social-proof-signal", target: "cc-maple", edgeLabel: "ESTABLISHES", strength: 0.9 },
      { source: "social-proof-signal", target: "seg-premium", edgeLabel: "CONVERTS", strength: 0.6 },
      { source: "social-proof-signal", target: "social-brand-sentiment", edgeLabel: "CONFIRMED_BY", strength: 0.5 },
    ],
  },
];

// ─── Follow-Up Pill Responses ──────────────────────────────────────────────────

export const followUpResponses: Record<string, string> = {
  "Ask Ethan: What specific cocktails would you build?": `**Ethan (@ethan_westend):**\n\nHere's my starting three-drink menu for CC Maple:\n\n**The Northern Old Fashioned** — 2oz rye whisky, 4oz CC Maple, dash Angostura, orange peel. The maple carbonation adds a texture dimension you don't get with flat maple syrup. Clean, interesting, definitely Canadian.\n\n**Maple Gin Fizz** — 1.5oz London Dry, 4oz CC Maple, squeeze of lime, sprig of thyme. The earthiness of the gin plays against the maple sweetness beautifully.\n\n**The Sober Cabin** (NA) — CC Maple, fresh ginger juice, lemon, muddled rosemary. Would put this on the NA menu. Marie-type customers would order this over any other option we currently have.\n\nRunning these as specials this weekend. Will report back.`,
  "Ask Karen: What price point makes you switch from LaCroix?": `**Karen H. (@karen_atl):**\n\nMy LaCroix cost is $0.42/can at Costco in the 35-pack. That's my baseline.\n\nFor me to switch, even partially:\n— Under $1.29/can at Costco in a 12-pack variety, I'd try it for special occasions.\n— At $1.99+ I'm not buying it as an everyday beverage.\n\nThe smart play is a 6-pack sampler at Shoppers for $7.99. Let me try it before I commit 12. If the kids like it, I'll buy more.\n\nThe maple thing could actually work for Thanksgiving. I'd pay a holiday premium for that context. Just don't ask me to replace my weekly LaCroix run.`,
  "Ask Aisha: What would the packaging need to look like for you to post it?": `**Aisha (@aisha_atx):**\n\nthe glass bottle already has it. that shape is already content. amber-toned label — warm not halloween orange. gold or brass cap? that's shelf aesthetic right there.\n\nfor the post: vibe photo in natural light at a cozy bar or cabin window. caption uses the comeback story — 'fans brought this brand back from the dead' is genuinely interesting.\n\nI would NOT post an unboxing. I'd post 'this is what I'm drinking at [occasion] and here's the weird history behind it.' that's the format.`,
  "Run scenario: CC Maple at Niagara Falls souvenir shops": `**Scenario Analysis: Niagara Falls Tourist Retail**\n\nOf 13M annual Niagara Falls visitors, this agent set models price tolerance at +40% vs grocery context. Viable price range: $2.99–$3.49/unit.\n\n**Competitive Position:** LaCroix, Poppi, and Olipop have zero distribution in tourist souvenir shops. CC Maple would be the only sparkling beverage positioned as a Canadian souvenir experience.\n\n**Adjacent Product Context:** Maple syrup is Canada's #1 purchased souvenir. CC Maple placed adjacent to maple syrup creates a natural purchase association.\n\n**Segment Response:** 91% of tourist segment agents expressed purchase intent. Even Tyler said "yeah if it's in the shop I'd grab one." That's remarkable consensus.\n\n**Recommended Format:** Glass bottle 4-packs or gift sets. "Taste of Canada" bundle (1x CC Maple + 1x CC Original + maple syrup) at $22–$26 CAD.`,
};
