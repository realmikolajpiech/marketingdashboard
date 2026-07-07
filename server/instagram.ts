const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const IG_APP_ID = "936619743392459";

export function normalizeUsername(handle: string): string {
  return handle.trim().replace(/^@+/, "");
}

interface InstagramMediaNode {
  is_video?: boolean;
  video_view_count?: number;
}

interface InstagramUser {
  profile_pic_url_hd?: string;
  profile_pic_url?: string;
  edge_owner_to_timeline_media?: { edges?: { node?: InstagramMediaNode }[] };
  edge_felix_video_timeline?: { edges?: { node?: InstagramMediaNode }[] };
}

export async function fetchInstagramUser(username: string): Promise<InstagramUser | null> {
  const response = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        "User-Agent": USER_AGENT,
        "X-IG-App-ID": IG_APP_ID,
        "X-Requested-With": "XMLHttpRequest",
        Referer: `https://www.instagram.com/${username}/`,
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data?.data?.user ?? null;
}

export async function fetchInstagramAvatar(username: string): Promise<string | null> {
  const user = await fetchInstagramUser(username);
  return user?.profile_pic_url_hd || user?.profile_pic_url || null;
}

export type InstagramViewsErrorCode = "not_found" | "no_media" | "no_videos" | "no_views";

export interface InstagramAvgViewsSuccess {
  avgViews: number;
  sampleSize: number;
  viewCounts: number[];
}

export interface InstagramAvgViewsError {
  error: string;
  code: InstagramViewsErrorCode;
}

export async function fetchInstagramAvgViews(
  username: string
): Promise<InstagramAvgViewsSuccess | InstagramAvgViewsError> {
  const user = await fetchInstagramUser(username);

  if (!user) {
    return {
      error: `No Instagram profile found for @${username}`,
      code: "not_found",
    };
  }

  const timeline = user.edge_owner_to_timeline_media?.edges ?? [];
  const reels = user.edge_felix_video_timeline?.edges ?? [];
  const allNodes = [...timeline, ...reels]
    .map((edge) => edge.node)
    .filter((node): node is InstagramMediaNode => Boolean(node));

  const videoNodes = allNodes.filter((node) => node.is_video);
  const viewCounts = videoNodes
    .map((node) => node.video_view_count)
    .filter((count): count is number => typeof count === "number" && count > 0);

  if (allNodes.length === 0) {
    return {
      error: `@${username} has no posts or reels on their profile`,
      code: "no_media",
    };
  }

  if (videoNodes.length === 0) {
    return {
      error: `@${username} has no reels or videos to measure`,
      code: "no_videos",
    };
  }

  if (viewCounts.length === 0) {
    return {
      error: `View counts are hidden or unavailable for @${username}`,
      code: "no_views",
    };
  }

  const avgViews = Math.round(viewCounts.reduce((sum, count) => sum + count, 0) / viewCounts.length);

  return {
    avgViews,
    sampleSize: viewCounts.length,
    viewCounts: viewCounts.slice(0, 12),
  };
}
