import { PLATFORMS, Platform } from "../types";

interface PlatformPickerProps {
  value: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export default function PlatformPicker({ value, onChange }: PlatformPickerProps) {
  const toggle = (platform: Platform) => {
    if (value.includes(platform)) {
      const next = value.filter((p) => p !== platform);
      if (next.length > 0) onChange(next);
    } else {
      onChange([...value, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {PLATFORMS.map((platform) => {
        const selected = value.includes(platform);
        return (
          <button
            key={platform}
            type="button"
            onClick={() => toggle(platform)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selected
                ? "bg-stone-900 text-white"
                : "bg-stone-50 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
            }`}
          >
            {platform}
          </button>
        );
      })}
    </div>
  );
}
