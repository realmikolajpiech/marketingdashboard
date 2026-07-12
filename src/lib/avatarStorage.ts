import { PlatformProfile } from "../types";
import { normalizeHandle, primaryAvatarPlatform } from "../utils";
import { supabase } from "./supabase";

const AVATAR_BUCKET = "avatars";

export function avatarSourceKey(profiles: PlatformProfile[]): string {
  const platform = primaryAvatarPlatform(profiles.map((profile) => profile.platform));
  if (!platform) return "";

  const profile = profiles.find((entry) => entry.platform === platform);
  const handle = profile ? normalizeHandle(profile.handle) : "";
  return handle ? `${platform}:${handle}` : "";
}

/**
 * Downloads the creator's avatar once via the server proxy and uploads it to
 * Supabase Storage, so future page loads read a stable URL instead of
 * re-scraping Instagram/TikTok (which rate-limits and blocks server IPs).
 */
export async function persistCreatorAvatar(
  creatorId: string,
  profiles: PlatformProfile[]
): Promise<string | undefined> {
  const platform = primaryAvatarPlatform(profiles.map((profile) => profile.platform));
  if (!platform) return undefined;

  const profile = profiles.find((entry) => entry.platform === platform);
  const username = profile ? normalizeHandle(profile.handle) : "";
  if (!username) return undefined;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return undefined;

  const params = new URLSearchParams({ platform, handle: username });
  const response = await fetch(`/api/avatar/image?${params}`);
  if (!response.ok) return undefined;

  const blob = await response.blob();
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const path = `${user.id}/${creatorId}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });

  if (error) return undefined;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
