import { Platform, PlatformProfile } from "../types";
import { extractHandleFromInput } from "../utils";
import AvgViewsCalculator from "./AvgViewsCalculator";
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
  const update = (patch: Partial<PlatformProfile>) => {
    onChange({ ...profile, ...patch });
  };

  return (
    <div className="rounded-xl ring-1 ring-stone-200 dark:ring-stone-700 bg-stone-50/50 dark:bg-stone-800/50 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <PlatformIcon platform={profile.platform} size="sm" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{profile.platform}</h3>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Handle</label>
        <input
          type="text"
          required
          placeholder={
            profile.platform === "YouTube"
              ? "@channelname or profile URL"
              : profile.platform === "Instagram"
                ? "@username or profile URL"
                : "@username or profile URL"
          }
          value={profile.handle}
          onChange={(e) => update({ handle: e.target.value })}
          onBlur={() => {
            const formatted = formatProfileHandle(profile.handle, profile.platform);
            if (formatted !== profile.handle) {
              update({ handle: formatted });
            }
          }}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Followers (K)</label>
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
          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Avg views</label>
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

export function formatProfileHandle(handle: string, platform: Platform): string {
  const username = extractHandleFromInput(handle, platform);
  if (!username) return "";
  return `@${username}`;
}
