import { Creator, CreatorStatus, Platform, PlatformProfile } from "./types";

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

export function calcCPM(spent: number, views: number): number {
  return views > 0 ? spent / (views / 1000) : 0;
}

export function cpmLabel(cpm: number): { text: string; className: string } {
  if (cpm === 0) return { text: "No data", className: "text-stone-400 dark:text-stone-500" };
  if (cpm <= 5) return { text: "Good deal", className: "text-teal-700 dark:text-teal-400" };
  if (cpm <= 8) return { text: "Fair", className: "text-amber-700 dark:text-amber-400" };
  return { text: "Expensive", className: "text-rose-700 dark:text-rose-400" };
}

export const STATUS_OPTIONS: { value: CreatorStatus | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Selected", label: "Selected" },
  { value: "Contacted", label: "Contacted" },
  { value: "Followed Up Contact", label: "Followed up" },
  { value: "Negotiating", label: "Negotiating" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
];

export const CREATOR_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (s): s is { value: CreatorStatus; label: string } => s.value !== "All"
);

export function statusStyle(status: CreatorStatus): string {
  const map: Record<CreatorStatus, string> = {
    Active: "bg-teal-50 text-teal-800 ring-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-800",
    Negotiating: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
    Contacted: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800",
    "Followed Up Contact": "bg-indigo-50 text-indigo-800 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-800",
    Selected: "bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700",
    Completed: "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-800",
  };
  return map[status];
}

export function platformStyle(platform: Platform): string {
  const map: Record<Platform, string> = {
    TikTok: "bg-stone-900 text-white ring-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:ring-stone-100",
    Instagram: "bg-pink-50 text-pink-800 ring-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:ring-pink-800",
    YouTube: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  };
  return map[platform];
}

export function shortStatus(status: CreatorStatus): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export function statusBarColor(status: CreatorStatus): string {
  const map: Record<CreatorStatus, string> = {
    Selected: "bg-stone-400 dark:bg-stone-500",
    Contacted: "bg-sky-500 dark:bg-sky-400",
    "Followed Up Contact": "bg-indigo-500 dark:bg-indigo-400",
    Negotiating: "bg-amber-500 dark:bg-amber-400",
    Active: "bg-teal-600 dark:bg-teal-400",
    Completed: "bg-violet-500 dark:bg-violet-400",
    Rejected: "bg-rose-400 dark:bg-rose-500",
  };
  return map[status];
}

export function hasResponded(status: CreatorStatus): boolean {
  return status !== "Selected" && status !== "Contacted" && status !== "Followed Up Contact";
}

export function budgetHealth(pct: number): { className: string; barClassName: string } {
  if (pct > 100) return { className: "text-rose-700 dark:text-rose-400", barClassName: "bg-rose-500 dark:bg-rose-500" };
  if (pct >= 80) return { className: "text-amber-700 dark:text-amber-400", barClassName: "bg-amber-500 dark:bg-amber-500" };
  return { className: "text-teal-700 dark:text-teal-400", barClassName: "bg-teal-600 dark:bg-teal-500" };
}

export const PLATFORM_CPM_BENCHMARKS: Record<
  Platform,
  { low: number; high: number }
> = {
  TikTok: { low: 3, high: 5.5 },
  Instagram: { low: 4.5, high: 7.5 },
  YouTube: { low: 8, high: 14.5 },
};

export interface SuggestedVideoPrice {
  low: number;
  high: number;
  mid: number;
  cpmLow: number;
  cpmHigh: number;
}

export function suggestedVideoPrice(
  platform: Platform,
  avgViews: number
): SuggestedVideoPrice | null {
  if (avgViews <= 0) return null;

  const { low: cpmLow, high: cpmHigh } = PLATFORM_CPM_BENCHMARKS[platform];
  const viewsInThousands = avgViews / 1000;

  return {
    low: Math.round(viewsInThousands * cpmLow),
    high: Math.round(viewsInThousands * cpmHigh),
    mid: Math.round(viewsInThousands * ((cpmLow + cpmHigh) / 2)),
    cpmLow,
    cpmHigh,
  };
}

export function suggestedVideoPriceForProfiles(
  profiles: PlatformProfile[]
): SuggestedVideoPrice | null {
  if (profiles.length === 0) return null;

  const prices = profiles
    .map((profile) => suggestedVideoPrice(profile.platform, profile.avgViews))
    .filter((price): price is SuggestedVideoPrice => price !== null);

  if (prices.length === 0) return null;

  const low = Math.min(...prices.map((price) => price.low));
  const high = Math.max(...prices.map((price) => price.high));

  return {
    low,
    high,
    mid: Math.round((low + high) / 2),
    cpmLow: Math.min(...prices.map((price) => price.cpmLow)),
    cpmHigh: Math.max(...prices.map((price) => price.cpmHigh)),
  };
}

/** @deprecated Use suggestedVideoPriceForProfiles */
export function suggestedVideoPriceForPlatforms(
  platforms: Platform[],
  avgViews: number
): SuggestedVideoPrice | null {
  return suggestedVideoPriceForProfiles(
    platforms.map((platform) => ({ platform, handle: "", followers: 0, avgViews }))
  );
}

export function primaryAvatarPlatform(platforms: Platform[]): Platform | null {
  if (platforms.includes("Instagram")) return "Instagram";
  if (platforms.includes("TikTok")) return "TikTok";
  return null;
}

export function creatorPlatforms(creator: Creator): Platform[] {
  return creator.platformProfiles.map((profile) => profile.platform);
}

export function primaryProfile(creator: Creator): PlatformProfile | undefined {
  if (creator.platformProfiles.length === 0) return undefined;
  const avatarPlatform = primaryAvatarPlatform(creatorPlatforms(creator));
  if (avatarPlatform) {
    return (
      creator.platformProfiles.find((profile) => profile.platform === avatarPlatform) ??
      creator.platformProfiles[0]
    );
  }
  return creator.platformProfiles[0];
}

export function creatorMaxAvgViews(creator: Creator): number {
  return Math.max(0, ...creator.platformProfiles.map((profile) => profile.avgViews));
}

export function creatorViewsRange(
  profiles: PlatformProfile[]
): { min: number; max: number } | null {
  const views = profiles.map((profile) => profile.avgViews).filter((value) => value > 0);
  if (views.length === 0) return null;
  return { min: Math.min(...views), max: Math.max(...views) };
}

export function formatViewsRange(profiles: PlatformProfile[]): string {
  const range = creatorViewsRange(profiles);
  if (!range) return "—";
  if (range.min === range.max) return formatCompact(range.min);
  return `${formatCompact(range.min)}–${formatCompact(range.max)}`;
}

export function formatCreatorHandles(creator: Creator): string {
  const handles = creator.platformProfiles
    .map((profile) => profile.handle)
    .filter(Boolean);
  return [...new Set(handles)].join(" · ");
}

export function creatorDisplayName(creator: Creator): string {
  const name = creator.name.trim();
  if (name) return name;
  const firstHandle = creator.platformProfiles.find((profile) => profile.handle.trim());
  if (firstHandle) return normalizeHandle(firstHandle.handle);
  return "Unnamed";
}

export function creatorInitials(creator: Creator): string {
  const display = creatorDisplayName(creator);
  if (display === "Unnamed") return "?";
  return display.slice(0, 2).toUpperCase();
}

const RESERVED_IG_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "direct",
  "tv",
]);

export function extractHandleFromInput(input: string, platform: Platform): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^(www\.)?(instagram|tiktok|youtube)\.com\b/i.test(trimmed);

  if (looksLikeUrl) {
    try {
      const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
      const pathParts = url.pathname.split("/").filter(Boolean);
      const host = url.hostname.replace(/^www\./, "");

      if (platform === "Instagram" && host === "instagram.com" && pathParts[0]) {
        const segment = pathParts[0].toLowerCase();
        if (!RESERVED_IG_PATHS.has(segment)) {
          return pathParts[0];
        }
      }

      if (platform === "TikTok" && host.includes("tiktok.com")) {
        const atPart = pathParts.find((part) => part.startsWith("@"));
        if (atPart) return atPart.replace(/^@+/, "");
        if (pathParts[0] && pathParts[0] !== "video") {
          return pathParts[0].replace(/^@+/, "");
        }
      }

      if (
        platform === "YouTube" &&
        (host.includes("youtube.com") || host === "youtu.be")
      ) {
        const atPart = pathParts.find((part) => part.startsWith("@"));
        if (atPart) return atPart.replace(/^@+/, "");
      }
    } catch {
      // Fall through to plain handle parsing.
    }
  }

  return normalizeHandle(trimmed);
}

export interface ParsedCreatorInput {
  platform: Platform;
  handle: string;
}

function detectPlatformFromInput(input: string): Platform | null {
  const trimmed = input.trim();
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^(www\.)?(instagram|tiktok|youtube)\.com\b/i.test(trimmed);

  if (!looksLikeUrl) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "instagram.com") return "Instagram";
    if (host.includes("tiktok.com")) return "TikTok";
    if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
  } catch {
    return null;
  }

  return null;
}

export function parseCreatorFromInput(input: string): ParsedCreatorInput | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const platform = detectPlatformFromInput(trimmed) ?? "Instagram";
  const handle = extractHandleFromInput(trimmed, platform);
  if (!handle) return null;

  return { platform, handle };
}

export function creatorHasPlatform(creator: Creator, platform: Platform | "All"): boolean {
  return platform === "All" || creator.platformProfiles.some((profile) => profile.platform === platform);
}

export function normalizeCreator(raw: Record<string, unknown>): Creator {
  if (Array.isArray(raw.platformProfiles) && raw.platformProfiles.length > 0) {
    const { handle: _h, platforms: _p, platform: _lp, followers: _f, avgViews: _v, ...rest } = raw;
    return {
      ...rest,
      platformProfiles: raw.platformProfiles as PlatformProfile[],
    } as Creator;
  }

  const handle = String(raw.handle || "");
  const followers = Number(raw.followers) || 0;
  const avgViews = Number(raw.avgViews) || 0;

  let platforms: Platform[] = [];
  if (Array.isArray(raw.platforms) && raw.platforms.length > 0) {
    platforms = raw.platforms as Platform[];
  } else if (raw.platform) {
    platforms = [raw.platform as Platform];
  } else {
    platforms = ["Instagram"];
  }

  const platformProfiles: PlatformProfile[] = platforms.map((platform) => ({
    platform,
    handle,
    followers,
    avgViews,
  }));

  const {
    handle: _handle,
    platforms: _platforms,
    platform: _platform,
    followers: _followers,
    avgViews: _avgViews,
    ...rest
  } = raw;

  return { ...rest, platformProfiles } as Creator;
}

export function formatPriceRange(low: number, high: number): string {
  return `${formatCurrency(low)} – ${formatCurrency(high)}`;
}

export type CreatorSortKey =
  | "recent"
  | "name-asc"
  | "name-desc"
  | "views-desc"
  | "views-asc"
  | "suggested-desc"
  | "suggested-asc"
  | "spent-desc"
  | "status";

export const CREATOR_SORT_OPTIONS: { value: CreatorSortKey; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "views-desc", label: "Avg views (high → low)" },
  { value: "views-asc", label: "Avg views (low → high)" },
  { value: "suggested-desc", label: "Suggested cost (high → low)" },
  { value: "suggested-asc", label: "Suggested cost (low → high)" },
  { value: "spent-desc", label: "Spent (high → low)" },
  { value: "status", label: "Status" },
];

const STATUS_SORT_ORDER: Record<CreatorStatus, number> = {
  Active: 0,
  Negotiating: 1,
  "Followed Up Contact": 2,
  Contacted: 3,
  Selected: 4,
  Completed: 5,
  Rejected: 6,
};

function suggestedMid(creator: Creator): number | null {
  return suggestedVideoPriceForProfiles(creator.platformProfiles)?.mid ?? null;
}

export function sortCreators<T extends Creator>(creators: T[], sortKey: CreatorSortKey): T[] {
  if (sortKey === "recent") return creators;

  const sorted = [...creators];

  switch (sortKey) {
    case "name-asc":
      return sorted.sort((a, b) => creatorDisplayName(a).localeCompare(creatorDisplayName(b)));
    case "name-desc":
      return sorted.sort((a, b) => creatorDisplayName(b).localeCompare(creatorDisplayName(a)));
    case "views-desc":
      return sorted.sort((a, b) => creatorMaxAvgViews(b) - creatorMaxAvgViews(a));
    case "views-asc":
      return sorted.sort((a, b) => creatorMaxAvgViews(a) - creatorMaxAvgViews(b));
    case "suggested-desc":
      return sorted.sort((a, b) => {
        const aMid = suggestedMid(a);
        const bMid = suggestedMid(b);
        if (aMid === null && bMid === null) return 0;
        if (aMid === null) return 1;
        if (bMid === null) return -1;
        return bMid - aMid;
      });
    case "suggested-asc":
      return sorted.sort((a, b) => {
        const aMid = suggestedMid(a);
        const bMid = suggestedMid(b);
        if (aMid === null && bMid === null) return 0;
        if (aMid === null) return 1;
        if (bMid === null) return -1;
        return aMid - bMid;
      });
    case "spent-desc":
      return sorted.sort((a, b) => b.moneySpent - a.moneySpent);
    case "status":
      return sorted.sort(
        (a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]
      );
    default:
      return creators;
  }
}

export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@+/, "").replace(/\/+$/, "");
}

export function creatorProfileUrl(
  platform: Platform,
  handle: string
): string | null {
  const username = normalizeHandle(handle);
  if (!username) return null;

  switch (platform) {
    case "TikTok":
      return `https://www.tiktok.com/@${username}`;
    case "Instagram":
      return `https://www.instagram.com/${username}/`;
    case "YouTube":
      return `https://www.youtube.com/@${username}`;
  }
}
