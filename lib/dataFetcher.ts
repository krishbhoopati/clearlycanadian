import { isPuterAvailable } from "./puterAI";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  subreddit: string;
  url: string;
  created_utc: number;
}

export interface NutritionData {
  product_name: string;
  brands: string;
  nutriments: {
    energy_kcal: number;
    sugars: number;
    fat: number;
    proteins: number;
    salt: number;
  };
  nova_group: number | null;
  ecoscore_grade: string | null;
}

export interface CocktailRecipe {
  name: string;
  instructions: string;
  ingredients: string[];
  glass: string;
}

export interface DataBundle {
  reddit: RedditPost[];
  nutrition: NutritionData[];
  wikipedia: string;
  cocktails: CocktailRecipe[];
  webSearchResults: string[];
  timestamp: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 5000;

function assertPuterNet(): void {
  if (!isPuterAvailable()) {
    throw new Error(
      "Puter is not available. The puter.js script may not have loaded yet."
    );
  }
}

async function puterFetch(url: string): Promise<Response> {
  assertPuterNet();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await window.puter.net.fetch(url, {
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// ─── Reddit ──────────────────────────────────────────────────────────────────

const DEFAULT_SUBREDDITS = ["water", "soda", "beverages", "Cooking"];

export async function fetchRedditPosts(
  query: string,
  subreddit?: string,
  limit: number = 5
): Promise<RedditPost[]> {
  try {
    const encoded = encodeURIComponent(query);

    if (subreddit) {
      return await fetchRedditFromSub(encoded, subreddit, limit);
    }

    const results = await Promise.all(
      DEFAULT_SUBREDDITS.map((sub) =>
        fetchRedditFromSub(encoded, sub, Math.ceil(limit / DEFAULT_SUBREDDITS.length))
      )
    );
    return results
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch {
    return [];
  }
}

async function fetchRedditFromSub(
  encodedQuery: string,
  sub: string,
  limit: number
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodedQuery}&limit=${limit}&sort=relevance&restrict_sr=on`;
    const res = await puterFetch(url);
    const json = await res.json();

    const children = json?.data?.children ?? [];
    return children.map((child: any) => ({
      title: child.data?.title ?? "",
      selftext: (child.data?.selftext ?? "").slice(0, 500),
      score: child.data?.score ?? 0,
      num_comments: child.data?.num_comments ?? 0,
      subreddit: child.data?.subreddit ?? sub,
      url: child.data?.url ?? "",
      created_utc: child.data?.created_utc ?? 0,
    }));
  } catch {
    return [];
  }
}

// ─── Open Food Facts ─────────────────────────────────────────────────────────

export async function fetchNutritionData(
  productName: string
): Promise<NutritionData[]> {
  try {
    const encoded = encodeURIComponent(productName);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&json=1&page_size=5`;
    const res = await puterFetch(url);
    const json = await res.json();

    const products = json?.products ?? [];
    return products.map((p: any) => ({
      product_name: p.product_name ?? "Unknown",
      brands: p.brands ?? "Unknown",
      nutriments: {
        energy_kcal: p.nutriments?.["energy-kcal_100g"] ?? 0,
        sugars: p.nutriments?.sugars_100g ?? 0,
        fat: p.nutriments?.fat_100g ?? 0,
        proteins: p.nutriments?.proteins_100g ?? 0,
        salt: p.nutriments?.salt_100g ?? 0,
      },
      nova_group: p.nova_group ?? null,
      ecoscore_grade: p.ecoscore_grade ?? null,
    }));
  } catch {
    return [];
  }
}

// ─── Wikipedia ───────────────────────────────────────────────────────────────

export async function fetchWikipediaSnippet(topic: string): Promise<string> {
  try {
    const encoded = encodeURIComponent(topic);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&srlimit=1&origin=*`;
    const res = await puterFetch(url);
    const json = await res.json();

    const results = json?.query?.search ?? [];
    if (results.length === 0) return "";
    return stripHtml(results[0].snippet ?? "");
  } catch {
    return "";
  }
}

// ─── CocktailDB ──────────────────────────────────────────────────────────────

export async function fetchCocktailRecipes(
  ingredient: string
): Promise<CocktailRecipe[]> {
  try {
    const encoded = encodeURIComponent(ingredient);
    const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encoded}`;
    const res = await puterFetch(url);
    const json = await res.json();

    const drinks = json?.drinks ?? [];
    return drinks.map((d: any) => {
      const ingredients: string[] = [];
      for (let i = 1; i <= 15; i++) {
        const ing = d[`strIngredient${i}`];
        const measure = d[`strMeasure${i}`];
        if (ing && ing.trim()) {
          ingredients.push(
            measure ? `${measure.trim()} ${ing.trim()}` : ing.trim()
          );
        }
      }
      return {
        name: d.strDrink ?? "Unknown",
        instructions: d.strInstructions ?? "",
        ingredients,
        glass: d.strGlass ?? "",
      };
    });
  } catch {
    return [];
  }
}

// ─── Web Search via Puter AI ─────────────────────────────────────────────────

const SEARCH_MODEL = "claude-sonnet-4-6";

export async function searchWeb(query: string): Promise<string> {
  assertPuterNet();
  try {
    const response = await window.puter.ai.chat(
      `Search the web and provide current, factual information about: ${query}`,
      { model: SEARCH_MODEL }
    );
    return response?.message?.content ?? response?.text ?? String(response);
  } catch {
    return "";
  }
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

const PRODUCT_CATEGORIES = [
  "product_innovation",
  "product_maple",
  "zero_sugar_formulation",
  "low_sugar_interest",
  "ingredient_sourcing",
  "packaging",
  "packaging_heritage",
];

const COMPETITIVE_CATEGORIES = [
  "competitive",
  "price_sensitivity",
  "sparkling_water_behavior",
  "beverage_buying_behavior",
];

const BAR_CATEGORIES = [
  "mixology_innovation",
  "on_premise_strategy",
  "sober_curious",
];

export async function fetchAllRelevantData(
  question: string,
  categories: string[]
): Promise<DataBundle> {
  assertPuterNet();

  const bundle: DataBundle = {
    reddit: [],
    nutrition: [],
    wikipedia: "",
    cocktails: [],
    webSearchResults: [],
    timestamp: Date.now(),
  };

  const tasks: Promise<void>[] = [];

  const needsProduct = categories.some((c) => PRODUCT_CATEGORIES.includes(c));
  const needsCompetitive = categories.some((c) =>
    COMPETITIVE_CATEGORIES.includes(c)
  );
  const needsBar = categories.some((c) => BAR_CATEGORIES.includes(c));

  if (needsProduct) {
    tasks.push(
      fetchNutritionData("Clearly Canadian").then((d) => {
        bundle.nutrition.push(...d);
      })
    );
    tasks.push(
      fetchNutritionData("LaCroix sparkling water").then((d) => {
        bundle.nutrition.push(...d);
      })
    );
  }

  if (needsCompetitive) {
    tasks.push(
      fetchRedditPosts("sparkling water brand recommendation", undefined, 5).then(
        (d) => {
          bundle.reddit.push(...d);
        }
      )
    );
  }

  if (needsBar) {
    tasks.push(
      fetchCocktailRecipes("sparkling water").then((d) => {
        bundle.cocktails = d;
      })
    );
  }

  tasks.push(
    searchWeb(
      `${question} sparkling water market Canada 2025 2026`
    ).then((r) => {
      if (r) bundle.webSearchResults.push(r);
    })
  );

  if (categories.length > 0) {
    tasks.push(
      searchWeb(
        `Clearly Canadian sparkling water ${categories[0].replace(/_/g, " ")} latest news`
      ).then((r) => {
        if (r) bundle.webSearchResults.push(r);
      })
    );
  }

  const wikiTopic = needsBar
    ? "sparkling water cocktail mixer"
    : "Clearly Canadian beverage";
  tasks.push(
    fetchWikipediaSnippet(wikiTopic).then((s) => {
      bundle.wikipedia = s;
    })
  );

  await Promise.all(tasks.map((t) => t.catch(() => {})));

  return bundle;
}
