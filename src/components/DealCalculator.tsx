import { useState } from "react";
import { Calculator, X } from "lucide-react";
import { motion } from "motion/react";
import { calcCPM, cpmLabel } from "../utils";

interface DealCalculatorProps {
  onClose: () => void;
}

export default function DealCalculator({ onClose }: DealCalculatorProps) {
  const [cost, setCost] = useState("1500");
  const [views, setViews] = useState("300000");

  const cpm = calcCPM(Number(cost) || 0, Number(views) || 0);
  const rating = cpmLabel(cpm);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl ring-1 ring-stone-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-teal-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Deal calculator</h2>
              <p className="text-xs text-stone-500">Check if a rate is worth it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Creator fee ($)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 tabular-nums font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Expected views
            </label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 tabular-nums font-mono"
            />
          </div>

          <div className="rounded-xl bg-stone-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500">CPM</p>
              <p className="text-2xl font-semibold text-stone-900 tabular-nums font-mono">
                ${cpm.toFixed(2)}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md bg-white ring-1 ring-stone-200 ${rating.className}`}>
              {rating.text}
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Under $5 CPM is a strong deal for travel content. TikTok typically runs $3–5, Instagram $4–7, YouTube $8–14.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
