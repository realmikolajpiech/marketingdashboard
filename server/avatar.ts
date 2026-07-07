import { fetchInstagramAvatar, normalizeUsername } from "./instagram";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export { normalizeUsername };

async function fetchTikTokAvatar(username: string): Promise<string | null> {
  const response = await fetch(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const match =
    html.match(/"avatarLarger":"([^"]+)"/) ||
    html.match(/"avatarMedium":"([^"]+)"/) ||
    html.match(/"avatarThumb":"([^"]+)"/);

  if (!match) return null;

  return JSON.parse(`"${match[1]}"`);
}

export async function fetchProfileAvatar(
  platform: "Instagram" | "TikTok",
  handle: string
): Promise<string | null> {
  const username = normalizeUsername(handle);
  if (!username) return null;

  if (platform === "Instagram") return fetchInstagramAvatar(username);
  return fetchTikTokAvatar(username);
}

export function avatarProxyPath(
  platform: "Instagram" | "TikTok",
  username: string
): string {
  const params = new URLSearchParams({ platform, handle: username });
  return `/api/avatar/image?${params}`;
}

export async function proxyAvatarImage(
  platform: "Instagram" | "TikTok",
  handle: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const username = normalizeUsername(handle);
  if (!username) return null;

  const imageUrl = await fetchProfileAvatar(platform, username);
  if (!imageUrl) return null;

  const referer =
    platform === "Instagram"
      ? `https://www.instagram.com/${username}/`
      : `https://www.tiktok.com/@${username}`;

  const response = await fetch(imageUrl, {
    headers: { "User-Agent": USER_AGENT, Referer: referer },
  });

  if (!response.ok) return null;

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return { buffer, contentType };
}
