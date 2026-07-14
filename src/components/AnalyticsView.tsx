import { useState } from "react";
import { Pencil, Check, X, Wallet, TrendingUp, Handshake } from "lucide-react";
import { Creator } from "../types";
import {
  creatorDisplayName,
  formatCurrency,
  CREATOR_STATUS_OPTIONS,
  statusBarColor,
  hasResponded,
  budgetHealth,
} from "../utils";

interface AnalyticsViewProps {
  creators: Creator[];
  budget: number;
  onUpdateBudget: (budget: number) => void;
}

export default function AnalyticsView({ creators, budget, onUpdateBudget }: AnalyticsViewProps) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget > 0 ? String(budget) : "");

  const totalSpent = creators.reduce((sum, c) => sum + c.moneySpent, 0);
  const pct = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const health = budgetHealth(pct);
  const remaining = budget - totalSpent;

  const contacted = creators.filter((c) => c.status !== "Selected");
  const responded = contacted.filter((c) => hasResponded(c.status));
  const responseRate = contacted.length > 0 ? (responded.length / contacted.length) * 100 : 0;

  const negotiating = creators.filter((c) => c.status === "Negotiating");

  const statusCounts = CREATOR_STATUS_OPTIONS.map(({ value, label }) => ({
    value,
    label,
    count: creators.filter((c) => c.status === value).length,
  }));
  const maxCount = Math.max(1, ...statusCounts.map((s) => s.count));

  const saveBudget = () => {
    const value = Number(budgetInput);
    if (!isNaN(value) && value >= 0) {
      onUpdateBudget(value);
    }
    setEditingBudget(false);
  };

  const cancelEditBudget = () => {
    setEditingBudget(false);
    setBudgetInput(budget > 0 ? String(budget) : "");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-5 py-4">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Campaign budget</p>
              {budget > 0 && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {formatCurrency(totalSpent)} spent of {formatCurrency(budget)}
                </p>
              )}
            </div>
          </div>

          {editingBudget ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                autoFocus
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveBudget();
                  if (e.key === "Escape") cancelEditBudget();
                }}
                placeholder="10000"
                className="w-28 px-2.5 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 tabular-nums font-mono"
              />
              <button
                onClick={saveBudget}
                className="p-1.5 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEditBudget}
                className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingBudget(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {budget > 0 ? "Edit" : "Set budget"}
            </button>
          )}
        </div>

        {budget > 0 ? (
          <>
            <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${health.barClassName}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs font-medium ${health.className}`}>{pct.toFixed(0)}% of budget used</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 tabular-nums font-mono">
                {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(-remaining)} over`}
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-400 dark:text-stone-500">Set a budget to track spend against it.</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-5 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Response rate</p>
          </div>
          <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">
            {contacted.length > 0 ? `${responseRate.toFixed(0)}%` : "—"}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {contacted.length > 0
              ? `${responded.length} of ${contacted.length} contacted creators responded`
              : "Contact a creator to start tracking this"}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-5 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
              <Handshake className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Active negotiations</p>
          </div>
          {negotiating.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-stone-500 py-2">No creators currently negotiating.</p>
          ) : (
            <div className="space-y-2">
              {negotiating.map((c) => {
                const offers = c.negotiationLog ?? [];
                const latest = offers[offers.length - 1];
                return (
                  <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-stone-700 dark:text-stone-300 truncate">{creatorDisplayName(c)}</span>
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400 tabular-nums font-mono shrink-0">
                      {latest
                        ? `${formatCurrency(latest.amount)} (${latest.by === "you" ? "you" : "them"})`
                        : "No offers yet"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-5 py-4">
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Pipeline by status</p>
        <div className="space-y-2.5">
          {statusCounts.map(({ value, label, count }) => (
            <div key={value} className="flex items-center gap-3">
              <span className="w-28 text-xs text-stone-500 dark:text-stone-400 shrink-0 truncate">{label}</span>
              <div className="flex-1 h-4 rounded-sm bg-stone-100 dark:bg-stone-800 overflow-hidden">
                {count > 0 && (
                  <div
                    className={`h-full rounded-sm ${statusBarColor(value)} transition-all`}
                    style={{ width: `${Math.max((count / maxCount) * 100, 4)}%` }}
                  />
                )}
              </div>
              <span className="w-6 text-xs font-medium text-stone-700 dark:text-stone-300 tabular-nums font-mono text-right shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
