const API_KEY = process.env.GOOGLE_CSE_API_KEY;
const CX = process.env.GOOGLE_CSE_CX;
const MAX_RESULTS = Number(process.env.MAX_SEARCH_RESULTS ?? 5);
const CACHE_TTL = Number(process.env.SEARCH_CACHE_TTL_MS ?? 10 * 60 * 1000);
const RPM = Number(process.env.SEARCH_RPM_LIMIT ?? 60);
const cache = new Map();
let lastWindowStart = Date.now();
let callsThisMinute = 0;
function rpmGuard() {
    const now = Date.now();
    if (now - lastWindowStart >= 60_000) {
        lastWindowStart = now;
        callsThisMinute = 0;
    }
    if (callsThisMinute >= RPM)
        throw new Error("Search rate limit reached");
    callsThisMinute++;
}
export async function googleSearch(query) {
    if (!API_KEY || !CX)
        throw new Error("Missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX");
    const key = query.trim().toLowerCase();
    const cached = cache.get(key);
    const now = Date.now();
    if (cached && cached.expires > now)
        return cached.data;
    rpmGuard();
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(API_KEY)}&cx=${encodeURIComponent(CX)}&q=${encodeURIComponent(query)}`;
    const r = await fetch(url);
    if (!r.ok)
        throw new Error(`Google search failed: ${r.status}`);
    const data = (await r.json());
    const items = (data.items ?? [])
        .slice(0, MAX_RESULTS)
        .map((i) => ({ title: i.title, link: i.link, snippet: i.snippet }));
    cache.set(key, { expires: now + CACHE_TTL, data: items });
    return items;
}
