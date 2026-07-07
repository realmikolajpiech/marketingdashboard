import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import { Platform } from "../types";
import { primaryAvatarPlatform } from "../utils";

interface ProfileAvatarPreviewProps {
  avatarUrl?: string;
  name?: string;
  loading?: boolean;
  error?: string;
  platform?: Platform;
  platforms?: Platform[];
}

export default function ProfileAvatarPreview({
  avatarUrl,
  name,
  loading,
  error,
  platform,
  platforms = platform ? [platform] : [],
}: ProfileAvatarPreviewProps) {
  const supported = Boolean(primaryAvatarPlatform(platforms));
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const showAvatar = Boolean(avatarUrl) && !imageError;
  const displayError = error || (imageError ? "Could not load profile picture" : undefined);

  return (
    <div className="flex items-center gap-3 rounded-lg bg-stone-50 ring-1 ring-stone-200 px-3 py-2.5">
      <div className="relative w-11 h-11 shrink-0">
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={name ? `${name} profile` : "Profile"}
            className="w-11 h-11 rounded-lg object-cover ring-1 ring-stone-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : initials || <User className="w-4 h-4" />}
          </div>
        )}
        {loading && showAvatar && (
          <div className="absolute inset-0 rounded-lg bg-white/60 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
          </div>
        )}
      </div>

      <div className="min-w-0 text-xs">
        {!supported ? (
          <p className="text-stone-500">Profile photos auto-fetch for Instagram and TikTok.</p>
        ) : loading && !showAvatar ? (
          <p className="text-stone-500">Looking up profile picture…</p>
        ) : showAvatar ? (
          <p className="text-teal-700 font-medium">Profile picture found</p>
        ) : displayError ? (
          <p className="text-stone-500">{displayError}</p>
        ) : (
          <p className="text-stone-500">Enter a handle to fetch their photo</p>
        )}
      </div>
    </div>
  );
}
