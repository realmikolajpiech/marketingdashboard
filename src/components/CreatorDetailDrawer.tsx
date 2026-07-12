import { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Trash2,
  ExternalLink,
  Pencil,
  Check,
} from "lucide-react";
import { Creator, PaymentLog, CreatorStatus, PlatformProfile } from "../types";
import {
  calcCPM,
  cpmLabel,
  formatCompact,
  formatCurrency,
  CREATOR_STATUS_OPTIONS,
  formatPriceRange,
  creatorProfileUrl,
  formatCreatorHandles,
  shortStatus,
  statusStyle,
  suggestedVideoPrice,
  suggestedVideoPriceForProfiles,
} from "../utils";
import PlatformIcon, { PlatformIcons } from "./PlatformIcon";
import PlatformPicker from "./PlatformPicker";
import PlatformProfileEditor, {
  formatProfileHandle,
  syncProfilesFromPlatforms,
} from "./PlatformProfileEditor";

interface CreatorDetailDrawerProps {
  creator: Creator;
  payments: PaymentLog[];
  onClose: () => void;
  onUpdate: (creator: Creator) => void;
  onDelete: (id: string) => void;
  onDeletePayment: (id: string) => void;
  onLogPayment: () => void;
}

export default function CreatorDetailDrawer({
  creator,
  payments,
  onClose,
  onUpdate,
  onDelete,
  onDeletePayment,
  onLogPayment,
}: CreatorDetailDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(creator.name);
  const [platformProfiles, setPlatformProfiles] = useState<PlatformProfile[]>(
    creator.platformProfiles
  );
  const [status, setStatus] = useState(creator.status);
  const [notes, setNotes] = useState(creator.notes);

  const creatorPayments = payments.filter((p) => p.creatorId === creator.id);
  const cpm = calcCPM(creator.moneySpent, creator.totalViewsGenerated);
  const rating = cpmLabel(cpm);
  const displayProfiles = editing ? platformProfiles : creator.platformProfiles;
  const suggested = suggestedVideoPriceForProfiles(displayProfiles);

  const handlePlatformsChange = (platforms: PlatformProfile["platform"][]) => {
    setPlatformProfiles((current) => syncProfilesFromPlatforms(platforms, current));
  };

  const handleSave = () => {
    onUpdate({
      ...creator,
      name,
      platformProfiles: platformProfiles.map((profile) => ({
        ...profile,
        handle: formatProfileHandle(profile.handle),
      })),
      status,
      notes,
    });
    setEditing(false);
  };

  const startEdit = () => {
    setName(creator.name);
    setPlatformProfiles(creator.platformProfiles);
    setStatus(creator.status);
    setNotes(creator.notes);
    setEditing(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/25 dark:bg-black/50 backdrop-blur-[2px]"
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative w-full max-w-md h-dvh bg-white dark:bg-stone-900 shadow-2xl flex flex-col ring-1 ring-stone-200 dark:ring-stone-800"
      >
        <header className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center text-sm font-semibold shrink-0">
              {creator.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate">{creator.name}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{formatCreatorHandles(creator)}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <PlatformIcons profiles={displayProfiles} size="sm" />
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ring-1 ${statusStyle(creator.status)}`}>
                  {shortStatus(creator.status)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Platforms</label>
                <PlatformPicker
                  value={platformProfiles.map((profile) => profile.platform)}
                  onChange={handlePlatformsChange}
                />
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
                    inputClass="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CreatorStatus)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {CREATOR_STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                  placeholder="Rates discussed, deliverables, contact details..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 space-y-6">
              {suggested && (
                <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 ring-1 ring-teal-200 dark:ring-teal-800 px-4 py-3.5">
                  <p className="text-xs font-medium text-teal-800 dark:text-teal-300">Suggested price per video</p>
                  <p className="text-xl font-semibold text-teal-900 dark:text-teal-200 tabular-nums font-mono mt-0.5">
                    {formatPriceRange(suggested.low, suggested.high)}
                  </p>
                  <p className="text-xs text-teal-700/80 dark:text-teal-400/80 mt-1">
                    Combined range across {displayProfiles.length} platform
                    {displayProfiles.length === 1 ? "" : "s"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Platforms</p>
                {displayProfiles.map((profile) => {
                  const profileSuggested = suggestedVideoPrice(profile.platform, profile.avgViews);
                  const profileUrl = creatorProfileUrl(profile.platform, profile.handle);

                  return (
                    <div
                      key={profile.platform}
                      className="rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-3.5 py-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <PlatformIcon platform={profile.platform} size="sm" href={profileUrl} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{profile.platform}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{profile.handle}</p>
                          </div>
                        </div>
                        {profileUrl && (
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 shrink-0"
                          >
                            Open
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-stone-50 dark:bg-stone-800 px-2.5 py-2">
                          <p className="text-stone-500 dark:text-stone-400">Followers</p>
                          <p className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono mt-0.5">
                            {formatCompact(profile.followers)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-stone-50 dark:bg-stone-800 px-2.5 py-2">
                          <p className="text-stone-500 dark:text-stone-400">Avg views</p>
                          <p className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono mt-0.5">
                            {profile.avgViews > 0 ? formatCompact(profile.avgViews) : "—"}
                          </p>
                        </div>
                      </div>
                      {profileSuggested && (
                        <p className="text-xs text-teal-700 dark:text-teal-400 font-medium tabular-nums font-mono">
                          Suggested: {formatPriceRange(profileSuggested.low, profileSuggested.high)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Videos", value: String(creator.videosPosted) },
                  ...(creator.moneySpent > 0
                    ? [
                        { label: "Spent", value: formatCurrency(creator.moneySpent) },
                        ...(cpm > 0
                          ? [
                              { label: "CPM", value: `$${cpm.toFixed(2)}` },
                              { label: "Rating", value: rating.text, className: rating.className },
                            ]
                          : []),
                      ]
                    : []),
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-stone-50 dark:bg-stone-800 px-3 py-2.5">
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{item.label}</p>
                    <p className={`text-sm font-semibold mt-0.5 tabular-nums font-mono ${item.className ?? "text-stone-900 dark:text-stone-100"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {creator.notes && (
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Notes</p>
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{creator.notes}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Payments ({creatorPayments.length})
                  </p>
                  <button
                    onClick={onLogPayment}
                    className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
                  >
                    + Add payment
                  </button>
                </div>

                {creatorPayments.length === 0 ? (
                  <p className="text-sm text-stone-400 dark:text-stone-500 py-4 text-center bg-stone-50 dark:bg-stone-800 rounded-lg">
                    No payments recorded for this creator.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {creatorPayments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg ring-1 ring-stone-200/80 dark:ring-stone-800 group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">
                            {formatCurrency(p.amount)}
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{p.paymentDate}</p>
                          {p.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{p.notes}</p>
                          )}
                          {p.videoUrl && (
                            <a
                              href={p.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-teal-700 dark:text-teal-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View video
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Delete this payment?")) onDeletePayment(p.id);
                          }}
                          className="p-1 rounded text-stone-300 dark:text-stone-600 hover:text-rose-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!editing && (
          <footer className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 flex gap-2">
            <button
              onClick={startEdit}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${creator.name} and all their payments?`)) {
                  onDelete(creator.id);
                }
              }}
              className="px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              Delete
            </button>
          </footer>
        )}
      </motion.aside>
    </div>
  );
}
