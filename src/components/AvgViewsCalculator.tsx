import { useState } from "react";
import { Calculator } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AvgViewsCalculatorProps {
  onApply: (average: number) => void;
}

export default function AvgViewsCalculator({ onApply }: AvgViewsCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [singleValue, setSingleValue] = useState("");
  const [viewList, setViewList] = useState<number[]>([]);

  const addSingle = () => {
    const val = Number(singleValue);
    if (!isNaN(val) && val > 0) {
      setViewList((prev) => [...prev, val]);
      setSingleValue("");
    }
  };

  const removeAt = (index: number) => {
    setViewList((prev) => prev.filter((_, i) => i !== index));
  };

  const average =
    viewList.length > 0
      ? Math.round(viewList.reduce((a, b) => a + b, 0) / viewList.length)
      : 0;

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-stone-600 dark:text-stone-400 shrink-0">Avg views</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 shrink-0"
        >
          <Calculator className="w-3 h-3" />
          {open ? "Hide" : "Calculate"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 p-3 space-y-3 min-w-0 max-h-48 overflow-y-auto scrollbar-thin">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Type a view count and press Enter to add each one.
              </p>

              <div className="flex gap-2 min-w-0">
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={singleValue}
                  onChange={(e) => setSingleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSingle();
                    }
                  }}
                  className="min-w-0 flex-1 px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 tabular-nums font-mono"
                />
                <button
                  type="button"
                  onClick={addSingle}
                  className="shrink-0 px-3 py-2 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-lg"
                >
                  Add
                </button>
              </div>

              {viewList.length > 0 && (
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      {viewList.length} added
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewList([])}
                      className="text-[11px] text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin">
                    {viewList.map((views, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 max-w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs tabular-nums font-mono px-2 py-1 rounded-md ring-1 ring-stone-200 dark:ring-stone-700"
                      >
                        <span className="truncate">{views.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => removeAt(index)}
                          className="shrink-0 text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-stone-800 px-3 py-2 ring-1 ring-stone-200 dark:ring-stone-700 min-w-0">
                    <div className="min-w-0">
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Average</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono truncate">
                        {average.toLocaleString()} views
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApply(average);
                        setOpen(false);
                      }}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
