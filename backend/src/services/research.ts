import { googleSearch, SearchHit } from "./googleSearch.js";

export type WebContext = {
  compactContext: string;
  citations: { title?: string; url: string; snippet?: string }[];
};

export async function maybeResearchForPersona(opts: {
  enabled: boolean;
  meetingObjective: string;
  lastUserAsk?: string;
}): Promise<WebContext | null> {
  if (!opts.enabled) {
    console.log("[Research] Search disabled via config");
    return null;
  }

  const queries = [opts.lastUserAsk?.slice(0, 140), `${opts.meetingObjective} latest`].filter(Boolean) as string[];
  console.log(`[Research] Generated queries: ${JSON.stringify(queries)}`);

  const hits: SearchHit[] = [];
  for (const q of queries) {
    try {
      console.log(`[Research] Executing search for: "${q}"`);
      const h = await googleSearch(q);
      console.log(`[Research] Found ${h.length} hits for "${q}"`);
      hits.push(...h);
    } catch (err) {
      console.error(`[Research] Search failed for "${q}":`, err);
    }
  }

  if (!hits.length) {
    console.log("[Research] No hits found for any query");
    return null;
  }

  const dedup = new Map<string, SearchHit>();
  for (const h of hits) if (!dedup.has(h.link)) dedup.set(h.link, h);
  const top = Array.from(dedup.values()).slice(0, 5);

  console.log(`[Research] Returning ${top.length} unique citations`);

  const compact = top
    .map((h, i) => `[${i + 1}] ${h.title} — ${h.link}\n${h.snippet ?? ""}`)
    .join("\n\n");

  return {
    compactContext: compact,
    citations: top.map((h) => ({ title: h.title, url: h.link, snippet: h.snippet })),
  };
}
