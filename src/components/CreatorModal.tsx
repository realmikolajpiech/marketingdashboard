import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ChevronDown, Link2, X } from "lucide-react";
import { CreatorStatus, PlatformProfile } from "../types";
import { parseCreatorFromInput } from "../utils";
import PlatformIcon from "./PlatformIcon";

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
  const profileRef = useRef<HTMLInputElement>(null);
  const followersRef = useRef<HTMLInputElement>(null);
  const avgViewsRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const wasParsedRef = useRef(false);

  const [input, setInput] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [followersK, setFollowersK] = useState("");
  const [avgViews, setAvgViews] = useState(0);
  const [notes, setNotes] = useState("");

  const parsed = parseCreatorFromInput(input);
  const canSubmit = Boolean(parsed);

  useEffect(() => {
    if (!parsed) {
      wasParsedRef.current = false;
      return;
    }

    const justParsed = !wasParsedRef.current;
    wasParsedRef.current = true;
    setShowDetails(true);

    if (justParsed) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => followersRef.current?.focus());
      });
    }
  }, [parsed?.platform, parsed?.handle]);

  const addCreator = () => {
    if (!parsed) return;

    onAdd({
      name: "",
      platformProfiles: [
        {
          platform: parsed.platform,
          handle: `@${parsed.handle}`,
          followers: (Number(followersK) || 0) * 1000,
          avgViews,
        },
      ],
      status: "Selected",
      notes: notes.trim(),
    });
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addCreator();
  };

  const focusNext = (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>) => {
    requestAnimationFrame(() => ref.current?.focus());
  };

  const handleFieldKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    nextRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  ) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      addCreator();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey && nextRef) {
      e.preventDefault();
      focusNext(nextRef);
    }
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
        className="relative w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl ring-1 ring-stone-200 dark:ring-stone-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Add creator</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Paste a link · Enter for next · Shift+Enter to add
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              Profile URL or handle
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                ref={profileRef}
                type="text"
                autoFocus
                placeholder="instagram.com/username or @username"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    addCreator();
                    return;
                  }
                  if (e.key === "Enter" && !e.shiftKey && parsed) {
                    e.preventDefault();
                    setShowDetails(true);
                    requestAnimationFrame(() => focusNext(followersRef));
                  }
                }}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {parsed && (
            <div className="flex items-center gap-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 ring-1 ring-teal-200 dark:ring-teal-800 px-3.5 py-3">
              <PlatformIcon platform={parsed.platform} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                  @{parsed.handle}
                </p>
                <p className="text-xs text-teal-700 dark:text-teal-400">{parsed.platform}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDetails((open) => !open)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
            />
            {showDetails ? "Hide details" : "Add followers, views, or notes"}
          </button>

          {showDetails && parsed && (
            <div className="space-y-3 rounded-xl ring-1 ring-stone-200 dark:ring-stone-700 bg-stone-50/50 dark:bg-stone-800/50 p-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Followers (K)
                  </label>
                  <input
                    ref={followersRef}
                    type="number"
                    placeholder="45"
                    value={followersK}
                    onChange={(e) => setFollowersK(e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, avgViewsRef)}
                    className={`${inputClass} tabular-nums font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Avg views
                  </label>
                  <input
                    ref={avgViewsRef}
                    type="number"
                    placeholder="120000"
                    value={avgViews || ""}
                    onChange={(e) => setAvgViews(Number(e.target.value) || 0)}
                    onKeyDown={(e) => handleFieldKeyDown(e, notesRef)}
                    className={`${inputClass} tabular-nums font-mono`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Notes</label>
                <textarea
                  ref={notesRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      e.preventDefault();
                      addCreator();
                    }
                  }}
                  rows={2}
                  placeholder="Rates, deliverables..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

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
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Add creator
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
