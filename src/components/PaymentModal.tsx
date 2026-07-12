import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Creator } from "../types";
import { formatCreatorHandles } from "../utils";

interface PaymentModalProps {
  creators: Creator[];
  preselectedCreatorId?: string;
  onLog: (payment: {
    creatorId: string;
    amount: number;
    paymentDate: string;
    videoUrl?: string;
    notes: string;
  }) => void;
  onClose: () => void;
}

export default function PaymentModal({
  creators,
  preselectedCreatorId,
  onLog,
  onClose,
}: PaymentModalProps) {
  const [creatorId, setCreatorId] = useState(preselectedCreatorId ?? "");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!creatorId || !amount) return;

    onLog({
      creatorId,
      amount: Number(amount) || 0,
      paymentDate,
      videoUrl: videoUrl.trim() || undefined,
      notes: notes.trim() || "Campaign payment",
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
        className="relative w-full sm:max-w-md bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl ring-1 ring-stone-200 dark:ring-stone-800"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Record payment</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Log money paid to a creator</p>
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
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Creator</label>
            <select
              required
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a creator</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatCreatorHandles(c)})
                </option>
              ))}
            </select>
            {creators.length === 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-lg">
                Add a creator first before recording payments.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Amount ($)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} tabular-nums font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              Video link <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={inputClass}
            />
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
              Adding a video link counts it as a deliverable.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              Notes <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Deposit for 3-video package..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
              disabled={creators.length === 0}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save payment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
