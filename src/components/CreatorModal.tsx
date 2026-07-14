import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { CreatorStatus, Platform, PlatformProfile } from "../types";
import { CREATOR_STATUS_OPTIONS, extractHandleFromInput } from "../utils";
import PlatformPicker from "./PlatformPicker";
import PlatformProfileEditor, {
  formatProfileHandle,
  syncProfilesFromPlatforms,
} from "./PlatformProfileEditor";

interface CreatorModalProps {
  onAdd: (creator: {
    name: string;
    platformProfiles: PlatformProfile[];
    status: CreatorStatus;
    notes: string;
  }) => void;
  onClose: () => void;
}

export default function CreatorModal({ onAdd, onClose }: CreatorModalProps) {
  const [name, setName] = useState("");
  const [platformProfiles, setPlatformProfiles] = useState<PlatformProfile[]>([
    { platform: "Instagram", handle: "", followers: 0, avgViews: 0 },
  ]);
  const [status, setStatus] = useState<CreatorStatus>("Selected");
  const [notes, setNotes] = useState("");

  const selectedPlatforms = platformProfiles.map((profile) => profile.platform);

  const handlePlatformsChange = (platforms: Platform[]) => {
    setPlatformProfiles((current) => syncProfilesFromPlatforms(platforms, current));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (platformProfiles.length === 0) return;
    if (!platformProfiles.every((profile) => extractHandleFromInput(profile.handle, profile.platform))) {
      return;
    }

    onAdd({
      name: name.trim(),
      platformProfiles: platformProfiles.map((profile) => ({
        ...profile,
        handle: formatProfileHandle(profile.handle, profile.platform),
      })),
      status,
      notes,
    });
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/30 dark:bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="relative w-full sm:max-w-2xl bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl ring-1 ring-stone-200 dark:ring-stone-800 max-h-[90dvh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-stone-900 flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800 z-10">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Add creator</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Add someone to your campaign pipeline</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              Name <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Amara Sterling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Platforms</label>
            <PlatformPicker value={selectedPlatforms} onChange={handlePlatformsChange} />
          </div>

          <div className="space-y-3">
            {platformProfiles.map((profile) => (
              <PlatformProfileEditor
                key={profile.platform}
                profile={profile}
                onChange={(updated) =>
                  setPlatformProfiles((current) =>
                    current.map((entry) =>
                      entry.platform === profile.platform ? updated : entry
                    )
                  )
                }
                inputClass={inputClass}
              />
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CreatorStatus)}
              className={inputClass}
            >
              {CREATOR_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              Notes <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Rates, deliverables, contact info..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Add creator
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
