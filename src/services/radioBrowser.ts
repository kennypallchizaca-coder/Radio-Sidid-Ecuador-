interface RadioBrowserStation {
  name?: string;
  url?: string;
  url_resolved?: string;
  codec?: string;
  tags?: string;
  votes?: number;
}

interface ResolveRadioOptions {
  baseUrl: string;
  countryCode: string;
  preferredStations?: readonly string[];
  genreKeywords?: readonly string[];
  excludedKeywords?: readonly string[];
  limit?: number;
}

interface ResolvedRadioStream {
  streamUrl: string;
  stationName: string;
}

const PLAYABLE_CODECS = new Set(["mp3", "aac", "aac+", "ogg", "opus"]);
const URL_BLOCKLIST = [".m3u", ".m3u8", ".pls"];

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isBlockedPlaylist(value: string): boolean {
  const lower = value.toLowerCase();
  return URL_BLOCKLIST.some((ext) => lower.includes(ext));
}

function upgradeToHttps(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

function pickStreamUrl(station: RadioBrowserStation): string | null {
  const candidate = (station.url_resolved ?? station.url ?? "").trim();
  if (!candidate || !isHttpUrl(candidate) || isBlockedPlaylist(candidate)) return null;
  return upgradeToHttps(candidate);
}

function isPlayableStation(station: RadioBrowserStation): boolean {
  const stream = pickStreamUrl(station);
  if (!stream) return false;

  const codec = (station.codec ?? "").trim().toLowerCase();
  if (!codec) return true;
  return PLAYABLE_CODECS.has(codec);
}

function selectPreferredStation(
  stations: RadioBrowserStation[],
  preferredStations: readonly string[],
): RadioBrowserStation | null {
  if (preferredStations.length === 0) return null;

  const normalized = preferredStations.map(normalizeName);
  for (const preferred of normalized) {
    const match = stations.find((station) => normalizeName(station.name ?? "").includes(preferred));
    if (match) return match;
  }
  return null;
}

function stationSearchText(station: RadioBrowserStation): string {
  return normalizeText(`${station.name ?? ""} ${station.tags ?? ""}`);
}

function hasAnyKeyword(text: string, keywords: readonly string[]): boolean {
  const normalizedKeywords = keywords.map(normalizeText).filter(Boolean);
  if (normalizedKeywords.length === 0) return true;
  return normalizedKeywords.some((keyword) => text.includes(keyword));
}

function hasExcludedKeyword(text: string, keywords: readonly string[]): boolean {
  const normalizedKeywords = keywords.map(normalizeText).filter(Boolean);
  if (normalizedKeywords.length === 0) return false;
  return normalizedKeywords.some((keyword) => text.includes(keyword));
}

export async function resolveEcuadorRadioStream(
  options: ResolveRadioOptions,
): Promise<ResolvedRadioStream | null> {
  const base = options.baseUrl.replace(/\/+$/, "");
  const countryCode = options.countryCode.trim().toUpperCase();
  if (!base || !countryCode) return null;

  const params = new URLSearchParams({
    hidebroken: "true",
    order: "votes",
    reverse: "true",
    limit: String(options.limit ?? 50),
  });

  const endpoint = `${base}/stations/bycountrycodeexact/${encodeURIComponent(countryCode)}?${params.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  let response: Response;
  try {
    response = await fetch(endpoint, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) return null;

  const data = (await response.json()) as RadioBrowserStation[];
  if (!Array.isArray(data) || data.length === 0) return null;

  const playable = data.filter(isPlayableStation);
  if (playable.length === 0) return null;

  const withoutExcluded = playable.filter((station) =>
    !hasExcludedKeyword(stationSearchText(station), options.excludedKeywords ?? []),
  );
  const pool = withoutExcluded.length > 0 ? withoutExcluded : playable;

  const genreKeywords = options.genreKeywords ?? [];
  if (genreKeywords.length === 0) return null;

  const byGenre = pool.filter((station) =>
    hasAnyKeyword(stationSearchText(station), genreKeywords),
  );
  // Forzar: solo estaciones que coincidan con keywords. Sin fallback.
  if (byGenre.length === 0) return null;
  const genrePool = byGenre;

  const preferred = selectPreferredStation(genrePool, options.preferredStations ?? []);
  const picked = preferred ?? genrePool[0];
  const streamUrl = pickStreamUrl(picked);
  if (!streamUrl) return null;

  return {
    streamUrl,
    stationName: (picked.name ?? "Radio Ecuador").trim() || "Radio Ecuador",
  };
}
