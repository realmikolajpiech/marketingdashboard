import { useEffect, useState } from "react";

type AvatarPlatform = "Instagram" | "TikTok";

interface AvatarResult {
  avatarUrl?: string;
  loading: boolean;
  error?: string;
}

export function useProfileAvatar(platform: string, handle: string): AvatarResult {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const username = handle.trim().replace(/^@+/, "");
    const supported = platform === "Instagram" || platform === "TikTok";

    if (!username || !supported) {
      setAvatarUrl(undefined);
      setLoading(false);
      setError(undefined);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(undefined);

      try {
        const params = new URLSearchParams({
          platform,
          handle: username,
        });
        const response = await fetch(`/api/avatar?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          setAvatarUrl(undefined);
          setError(data.error || "Profile not found");
          return;
        }

        setAvatarUrl(data.avatarUrl);
        setError(undefined);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setAvatarUrl(undefined);
        setError("Could not fetch profile picture");
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [platform, handle]);

  return { avatarUrl, loading, error };
}

export function isAvatarPlatform(platform: string): platform is AvatarPlatform {
  return platform === "Instagram" || platform === "TikTok";
}
