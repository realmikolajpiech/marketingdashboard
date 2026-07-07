import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  X,
  Calculator,
  RotateCcw,
  MapPin,
  ArrowUpDown,
  Download,
  Upload,
} from "lucide-react";

import { Creator, PaymentLog, CreatorStatus, Platform, PlatformProfile } from "./types";
import { INITIAL_CREATORS, INITIAL_PAYMENTS } from "./data";
import { downloadExport, readImportFile } from "./dataTransfer";
import { CREATOR_SORT_OPTIONS, CreatorSortKey, creatorHasPlatform, creatorMaxAvgViews, normalizeCreator, sortCreators, STATUS_OPTIONS } from "./utils";

import StatsBar from "./components/StatsBar";
import CreatorCard from "./components/CreatorCard";
import CreatorModal from "./components/CreatorModal";
import PaymentModal from "./components/PaymentModal";
import CreatorDetailDrawer from "./components/CreatorDetailDrawer";
import PaymentsView from "./components/PaymentsView";
import DealCalculator from "./components/DealCalculator";

type Tab = "creators" | "payments";

const PLATFORMS = ["All", "TikTok", "Instagram", "YouTube"] as const;

export default function App() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);

  const [tab, setTab] = useState<Tab>("creators");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<CreatorSortKey>("recent");

  const [showAddCreator, setShowAddCreator] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPreselect, setPaymentPreselect] = useState<string | undefined>();
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCreators = localStorage.getItem("trailo_clean_v1_creators");
    const savedPayments = localStorage.getItem("trailo_clean_v1_payments");

    if (savedCreators && savedPayments) {
      setCreators(JSON.parse(savedCreators).map(normalizeCreator));
      setPayments(JSON.parse(savedPayments));
    } else {
      setCreators(INITIAL_CREATORS);
      setPayments(INITIAL_PAYMENTS);
      localStorage.setItem("trailo_clean_v1_creators", JSON.stringify(INITIAL_CREATORS));
      localStorage.setItem("trailo_clean_v1_payments", JSON.stringify(INITIAL_PAYMENTS));
    }
  }, []);

  const syncCreators = (updated: Creator[]) => {
    setCreators(updated);
    localStorage.setItem("trailo_clean_v1_creators", JSON.stringify(updated));
  };

  const syncPayments = (updated: PaymentLog[]) => {
    setPayments(updated);
    localStorage.setItem("trailo_clean_v1_payments", JSON.stringify(updated));
  };

  const creatorsWithMetrics = creators.map((creator) => {
    const creatorPayments = payments.filter((p) => p.creatorId === creator.id);
    const moneySpent = creatorPayments.reduce((sum, p) => sum + p.amount, 0);
    const videosPosted = creatorPayments.filter((p) => p.videoUrl?.trim()).length;
    const totalViewsGenerated = videosPosted * creatorMaxAvgViews(creator);
    return { ...creator, moneySpent, videosPosted, totalViewsGenerated };
  });

  const handleAddCreator = (profile: {
    name: string;
    platformProfiles: PlatformProfile[];
    status: CreatorStatus;
    notes: string;
  }) => {
    const created: Creator = {
      id: "creator_" + Date.now(),
      ...profile,
      moneySpent: 0,
      videosPosted: 0,
      totalViewsGenerated: 0,
    };
    syncCreators([created, ...creators]);
  };

  const handleUpdateCreator = (updated: Creator) => {
    syncCreators(creators.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCreator?.id === updated.id) setSelectedCreator(updated);
  };

  const handleDeleteCreator = (id: string) => {
    syncCreators(creators.filter((c) => c.id !== id));
    syncPayments(payments.filter((p) => p.creatorId !== id));
    setSelectedCreator(null);
  };

  const handleLogPayment = (data: {
    creatorId: string;
    amount: number;
    paymentDate: string;
    videoUrl?: string;
    notes: string;
  }) => {
    const matched = creators.find((c) => c.id === data.creatorId);
    if (!matched) return;
    const logged: PaymentLog = {
      id: "pay_" + Date.now(),
      creatorName: matched.name,
      ...data,
    };
    syncPayments([logged, ...payments]);
  };

  const handleDeletePayment = (id: string) => {
    syncPayments(payments.filter((p) => p.id !== id));
  };

  const openPayment = (creatorId?: string) => {
    setPaymentPreselect(creatorId);
    setShowPayment(true);
  };

  const handleExport = () => {
    downloadExport(creators, payments);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (file: File) => {
    try {
      const { creators: importedCreators, payments: importedPayments } = await readImportFile(file);
      const confirmed = confirm(
        `Import ${importedCreators.length} creator${importedCreators.length === 1 ? "" : "s"} and ${importedPayments.length} payment${importedPayments.length === 1 ? "" : "s"}? This will replace your current data.`
      );
      if (!confirmed) return;

      syncCreators(importedCreators);
      syncPayments(importedPayments);
      setSelectedCreator(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not import file.");
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    }
  };

  const filteredCreators = sortCreators(
    creatorsWithMetrics.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.platformProfiles.some((profile) => profile.handle.toLowerCase().includes(q)) ||
        c.notes.toLowerCase().includes(q);
      const matchesPlatform = creatorHasPlatform(c, platformFilter as Platform | "All");
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesPlatform && matchesStatus;
    }),
    sortKey
  );

  const hasFilters =
    searchQuery || platformFilter !== "All" || statusFilter !== "All" || sortKey !== "recent";

  const selectedWithMetrics = selectedCreator
    ? creatorsWithMetrics.find((c) => c.id === selectedCreator.id) ?? selectedCreator
    : null;

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-stone-900 tracking-tight">Trailo</h1>
              <p className="text-[11px] text-stone-500 truncate hidden sm:block">
                Creator campaigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowCalculator(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculator
            </button>
            <button
              onClick={() => setShowAddCreator(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add creator</span>
            </button>
            <button
              onClick={() => openPayment()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Payment</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        <StatsBar creators={creatorsWithMetrics} payments={payments} />

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg w-fit">
          {(["creators", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === t
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t === "creators" ? "Creators" : "Payments"}
              <span className="ml-1.5 text-xs text-stone-400 tabular-nums">
                {t === "creators" ? creators.length : payments.length}
              </span>
            </button>
          ))}
        </div>

        {tab === "creators" ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative shrink-0">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as CreatorSortKey)}
                  className="appearance-none w-full sm:w-auto pl-8 pr-8 py-2.5 text-xs font-medium bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                >
                  {CREATOR_SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-0.5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      platformFilter === p
                        ? "bg-stone-900 text-white"
                        : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-0.5">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    statusFilter === value
                      ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200"
                      : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {label}
                </button>
              ))}
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setPlatformFilter("All");
                    setStatusFilter("All");
                    setSortKey("recent");
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:text-teal-800 whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            {filteredCreators.length === 0 ? (
              <div className="bg-white rounded-xl ring-1 ring-stone-200/80 px-6 py-16 text-center">
                <p className="text-sm font-medium text-stone-700">
                  {creators.length === 0 ? "No creators yet" : "No matches"}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {creators.length === 0
                    ? "Add your first travel creator to get started."
                    : "Try adjusting your search or filters."}
                </p>
                {creators.length === 0 && (
                  <button
                    onClick={() => setShowAddCreator(true)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                  >
                    Add creator
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onOpen={setSelectedCreator}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <PaymentsView payments={payments} onDelete={handleDeletePayment} />
        )}
      </main>

      <footer className="border-t border-stone-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-stone-400">Data saved locally in your browser</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export data
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-700 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Import data
            </button>
            <button
              onClick={() => {
                if (confirm("Reset all data to demo creators and payments?")) {
                  syncCreators(INITIAL_CREATORS);
                  syncPayments(INITIAL_PAYMENTS);
                  setSelectedCreator(null);
                }
              }}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset demo data
            </button>
          </div>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImportFile(file);
          }}
        />
      </footer>

      <AnimatePresence>
        {showAddCreator && (
          <CreatorModal
            onAdd={handleAddCreator}
            onClose={() => setShowAddCreator(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            creators={creators}
            preselectedCreatorId={paymentPreselect}
            onLog={handleLogPayment}
            onClose={() => {
              setShowPayment(false);
              setPaymentPreselect(undefined);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalculator && (
          <DealCalculator onClose={() => setShowCalculator(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedWithMetrics && (
          <CreatorDetailDrawer
            creator={selectedWithMetrics}
            payments={payments}
            onClose={() => setSelectedCreator(null)}
            onUpdate={handleUpdateCreator}
            onDelete={handleDeleteCreator}
            onDeletePayment={handleDeletePayment}
            onLogPayment={() => openPayment(selectedWithMetrics.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
