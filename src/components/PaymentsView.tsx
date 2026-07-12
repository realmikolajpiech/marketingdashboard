import { Calendar, ExternalLink, Trash2 } from "lucide-react";
import { PaymentLog } from "../types";
import { formatCurrency } from "../utils";

interface PaymentsViewProps {
  payments: PaymentLog[];
  onDelete: (id: string) => void;
}

export default function PaymentsView({ payments, onDelete }: PaymentsViewProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-6 py-16 text-center">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No payments yet</p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
          Record a payment when you pay a creator. Link a video URL to count it as a deliverable.
        </p>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {payments.length} payment{payments.length !== 1 ? "s" : ""}
        </p>
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
        {payments.map((payment) => (
          <div key={payment.id} className="px-5 py-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/60 transition-colors group">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-stone-900 dark:text-stone-100 tabular-nums font-mono">
                    {formatCurrency(payment.amount)}
                  </span>
                  <span className="text-sm text-stone-600 dark:text-stone-400 truncate">{payment.creatorName}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-400 dark:text-stone-500">
                  <Calendar className="w-3 h-3" />
                  <span className="tabular-nums">{payment.paymentDate}</span>
                </div>
                {payment.notes && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">{payment.notes}</p>
                )}
                {payment.videoUrl && (
                  <a
                    href={payment.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View video
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this payment?")) onDelete(payment.id);
                }}
                className="p-1.5 rounded-lg text-stone-300 dark:text-stone-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                title="Delete payment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
