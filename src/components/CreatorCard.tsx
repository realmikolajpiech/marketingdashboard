import type { FC } from "react";
import { ChevronRight } from "lucide-react";
import { Creator } from "../types";
import {
  calcCPM,
  formatCompact,
  formatCurrency,
  creatorDisplayName,
  creatorInitials,
  formatCreatorHandles,
  formatPriceRange,
  formatViewsRange,
  shortStatus,
  statusStyle,
  suggestedVideoPriceForProfiles,
} from "../utils";
import { PlatformIcons } from "./PlatformIcon";

interface CreatorCardProps {
  creator: Creator;
  onOpen: (creator: Creator) => void;
}

const CreatorCard: FC<CreatorCardProps> = ({ creator, onOpen }) => {
  const hasPaid = creator.moneySpent > 0;
  const cpm = calcCPM(creator.moneySpent, creator.totalViewsGenerated);
  const showCpm = hasPaid && cpm > 0;
  const suggested = suggestedVideoPriceForProfiles(creator.platformProfiles);
  const displayName = creatorDisplayName(creator);
  const handlesLabel = formatCreatorHandles(creator);
  const showHandles = Boolean(creator.name.trim() && handlesLabel);
  const viewsLabel = formatViewsRange(creator.platformProfiles);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(creator)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(creator);
        }
      }}
      className="w-full text-left bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-4 py-3.5 hover:ring-stone-300 dark:hover:ring-stone-700 hover:shadow-sm transition-all group flex items-center gap-3 sm:gap-4 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs font-semibold shrink-0">
        {creatorInitials(creator)}
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{displayName}</p>
            <PlatformIcons profiles={creator.platformProfiles} size="sm" className="sm:hidden shrink-0" />
          </div>
          {showHandles && (
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{handlesLabel}</p>
          )}
          {creator.notes && <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">{creator.notes}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 sm:hidden text-xs text-stone-500 dark:text-stone-400">
            <span className="tabular-nums font-mono">
              {viewsLabel === "—" ? "— avg views" : `${viewsLabel} avg views`}
            </span>
            {suggested && (
              <span className="text-teal-700 dark:text-teal-400 font-medium tabular-nums font-mono">
                {formatPriceRange(suggested.low, suggested.high)}
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <PlatformIcons profiles={creator.platformProfiles} size="md" />
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ring-1 ${statusStyle(creator.status)}`}>
            {shortStatus(creator.status)}
          </span>
        </div>

        <div className="hidden sm:block text-right shrink-0 min-w-[4.5rem]">
          <p className="text-xs text-stone-400 dark:text-stone-500">Avg views</p>
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200 tabular-nums font-mono">
            {viewsLabel}
          </p>
        </div>

        <div className="hidden md:block text-right shrink-0 min-w-[5.5rem]">
          <p className="text-xs text-stone-400 dark:text-stone-500">Suggested</p>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400 tabular-nums font-mono">
            {suggested ? formatPriceRange(suggested.low, suggested.high) : "—"}
          </p>
        </div>

        {hasPaid && (
          <div className="hidden lg:block text-right shrink-0 min-w-[4rem]">
            <p className="text-xs text-stone-400 dark:text-stone-500">Spent</p>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 tabular-nums font-mono">
              {formatCurrency(creator.moneySpent)}
            </p>
          </div>
        )}

        {showCpm && (
          <div className="hidden lg:block text-right shrink-0 min-w-[4rem]">
            <p className="text-xs text-stone-400 dark:text-stone-500">CPM</p>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 tabular-nums font-mono">
              ${cpm.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <ChevronRight className="hidden sm:block w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  );
};

export default CreatorCard;
