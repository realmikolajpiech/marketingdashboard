import { Platform, PlatformProfile } from "../types";
import { useProfileAvatar } from "../hooks/useProfileAvatar";
import AvgViewsCalculator from "./AvgViewsCalculator";
import ProfileAvatarPreview from "./ProfileAvatarPreview";
import InstagramViewsFetch from "./InstagramViewsFetch";
import PlatformIcon from "./PlatformIcon";

interface PlatformProfileEditorProps {
  profile: PlatformProfile;
  onChange: (profile: PlatformProfile) => void;
  inputClass: string;
}

export default function PlatformProfileEditor({
  profile,
  onChange,
  inputClass,
}: PlatformProfileEditorProps) {
  const avatarPlatform =
    profile.platform === "Instagram" || profile.platform === "TikTok"
      ? profile.platform
      : "";
  const { avatarUrl, loading, error } = useProfileAvatar(avatarPlatform, profile.handle);

  const update = (patch: Partial<PlatformProfile>) => {
    onChange({ ...profile, ...patch });
  };

  return (
    <div className="rounded-xl ring-1 ring-stone-200 bg-stone-50/50 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <PlatformIcon platform={profile.platform} size="sm" />
        <h3 className="text-sm font-semibold text-stone-900">{profile.platform}</h3>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1">Handle</label>
        <input
          type="text"
          required
          placeholder={profile.platform === "YouTube" ? "channelname" : "username"}
          value={profile.handle}
          onChange={(e) => update({ handle: e.target.value })}
          className={inputClass}
        />
      </div>

      {(profile.platform === "Instagram" || profile.platform === "TikTok") && (
        <ProfileAvatarPreview
          avatarUrl={avatarUrl}
          name={profile.handle}
          loading={loading}
          error={error}
          platform={profile.platform}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Followers (K)</label>
          <input
            type="number"
            placeholder="450"
            value={profile.followers ? String(profile.followers / 1000) : ""}
            onChange={(e) =>
              update({ followers: (Number(e.target.value) || 0) * 1000 })
            }
            className={`${inputClass} tabular-nums font-mono`}
          />
        </div>
        <div>
          <AvgViewsCalculator onApply={(avg) => update({ avgViews: avg })} />
          {profile.platform === "Instagram" && (
            <InstagramViewsFetch
              handle={profile.handle}
              platform={profile.platform}
              onApply={(avg) => update({ avgViews: avg })}
            />
          )}
          <label className="block text-xs font-medium text-stone-600 mb-1">Avg views</label>
          <input
            type="number"
            placeholder="120000"
            value={profile.avgViews || ""}
            onChange={(e) => update({ avgViews: Number(e.target.value) || 0 })}
            className={`${inputClass} tabular-nums font-mono`}
          />
        </div>
      </div>
    </div>
  );
}

export function syncProfilesFromPlatforms(
  platforms: Platform[],
  current: PlatformProfile[]
): PlatformProfile[] {
  return platforms.map((platform) => {
    const existing = current.find((profile) => profile.platform === platform);
    return (
      existing ?? {
        platform,
        handle: "",
        followers: 0,
        avgViews: 0,
      }
    );
  });
}

export function formatProfileHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}
