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
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

import { Creator, PaymentLog, CreatorStatus, Platform, PlatformProfile } from "./types";
import { INITIAL_CREATORS, INITIAL_PAYMENTS } from "./data";
import { downloadExport, readImportFile } from "./dataTransfer";
import {
  deleteCreator as deleteCreatorRow,
  deletePayment as deletePaymentRow,
  insertCreator,
  insertPayment,
  loadTrailoData,
  replaceAllData,
  updateCreator,
} from "./lib/database";
import { loadAppDataOnce } from "./lib/initialLoad";
import { useAuth } from "./lib/auth";
import { useTheme } from "./lib/theme";
import { CREATOR_SORT_OPTIONS, CreatorSortKey, creatorHasPlatform, creatorMaxAvgViews, normalizeCreator, sortCreators, STATUS_OPTIONS } from "./utils";

import StatsBar from "./components/StatsBar";
import CreatorCard from "./components/CreatorCard";
import CreatorModal from "./components/CreatorModal";
import PaymentModal from "./components/PaymentModal";
import CreatorDetailDrawer from "./components/CreatorDetailDrawer";
import PaymentsView from "./components/PaymentsView";
import DealCalculator from "./components/DealCalculator";
import LoginPage from "./components/LoginPage";

type Tab = "creators" | "payments";

const PLATFORMS = ["All", "TikTok", "Instagram", "YouTube"] as const;

export default function App() {
  const { session, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setCreators([]);
      setPayments([]);
      setLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const { creators: loadedCreators, payments: loadedPayments } = await loadAppDataOnce(
          async () => {
            let { creators, payments } = await loadTrailoData();

            const localCreators = localStorage.getItem("trailo_clean_v1_creators");
            const localPayments = localStorage.getItem("trailo_clean_v1_payments");

            if (
              creators.length === 0 &&
              payments.length === 0 &&
              localCreators &&
              localPayments
            ) {
              const migratedCreators = JSON.parse(localCreators).map(normalizeCreator);
              const migratedPayments = JSON.parse(localPayments) as PaymentLog[];
              await replaceAllData(migratedCreators, migratedPayments);
              creators = migratedCreators;
              payments = migratedPayments;
              localStorage.removeItem("trailo_clean_v1_creators");
              localStorage.removeItem("trailo_clean_v1_payments");
            } else if (creators.length === 0 && payments.length === 0) {
              await replaceAllData(INITIAL_CREATORS, INITIAL_PAYMENTS);
              creators = INITIAL_CREATORS;
              payments = INITIAL_PAYMENTS;
            }

            return { creators, payments };
          }
        );

        if (!cancelled) {
          setCreators(loadedCreators);
          setPayments(loadedPayments);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Could not load data from Supabase.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  const runSynced = async (action: () => Promise<void>, rollback: () => void) => {
    setSyncing(true);
    setLoadError(null);
    try {
      await action();
    } catch (error) {
      rollback();
      setLoadError(error instanceof Error ? error.message : "Could not save changes to Supabase.");
    } finally {
      setSyncing(false);
    }
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
      id: `creator_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...profile,
      moneySpent: 0,
      videosPosted: 0,
      totalViewsGenerated: 0,
    };
    const previous = creators;
    setCreators([created, ...creators]);
    void runSynced(
      () => insertCreator(created),
      () => setCreators(previous)
    );
  };

  const handleUpdateCreator = (updated: Creator) => {
    const previous = creators;
    setCreators(creators.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedCreator?.id === updated.id) setSelectedCreator(updated);
    void runSynced(
      () => updateCreator(updated),
      () => {
        setCreators(previous);
        if (selectedCreator?.id === updated.id) {
          setSelectedCreator(previous.find((c) => c.id === updated.id) ?? null);
        }
      }
    );
  };

  const handleDeleteCreator = (id: string) => {
    const previousCreators = creators;
    const previousPayments = payments;
    setCreators(creators.filter((c) => c.id !== id));
    setPayments(payments.filter((p) => p.creatorId !== id));
    setSelectedCreator(null);
    void runSynced(
      () => deleteCreatorRow(id),
      () => {
        setCreators(previousCreators);
        setPayments(previousPayments);
      }
    );
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
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      creatorName: matched.name,
      ...data,
    };
    const previous = payments;
    setPayments([logged, ...payments]);
    void runSynced(
      () => insertPayment(logged),
      () => setPayments(previous)
    );
  };

  const handleDeletePayment = (id: string) => {
    const previous = payments;
    setPayments(payments.filter((p) => p.id !== id));
    void runSynced(
      () => deletePaymentRow(id),
      () => setPayments(previous)
    );
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

      const previousCreators = creators;
      const previousPayments = payments;
      setCreators(importedCreators);
      setPayments(importedPayments);
      setSelectedCreator(null);
      await runSynced(
        () => replaceAllData(importedCreators, importedPayments),
        () => {
          setCreators(previousCreators);
          setPayments(previousPayments);
        }
      );
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

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {loadError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 px-4 py-2 text-xs text-rose-800 dark:text-rose-300 text-center">
          {loadError}
        </div>
      )}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Trailo</h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate hidden sm:block">
                Creator campaigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center p-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => void signOut()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
            <button
              onClick={() => setShowCalculator(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculator
            </button>
            <button
              onClick={() => setShowAddCreator(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
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
        {loading ? (
          <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-6 py-16 text-center">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Loading from Supabase…</p>
          </div>
        ) : (
          <>
        <StatsBar creators={creatorsWithMetrics} payments={payments} />

        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg w-fit">
          {(["creators", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === t
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              {t === "creators" ? "Creators" : "Payments"}
              <span className="ml-1.5 text-xs text-stone-400 dark:text-stone-500 tabular-nums">
                {t === "creators" ? creators.length : payments.length}
              </span>
            </button>
          ))}
        </div>

        {tab === "creators" ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative shrink-0">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as CreatorSortKey)}
                  className="appearance-none w-full sm:w-auto pl-8 pr-8 py-2.5 text-xs font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
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
                        ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
                        : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
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
                      ? "bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 ring-1 ring-teal-200 dark:ring-teal-800"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
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
                  className="px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            {filteredCreators.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-xl ring-1 ring-stone-200/80 dark:ring-stone-800 px-6 py-16 text-center">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {creators.length === 0 ? "No creators yet" : "No matches"}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
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
          </>
        )}
      </main>

      <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            {syncing ? "Syncing…" : `Signed in as ${session.user.email}`}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export data
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Import data
            </button>
            <button
              onClick={() => {
                if (confirm("Reset all data to demo creators and payments?")) {
                  const previousCreators = creators;
                  const previousPayments = payments;
                  setCreators(INITIAL_CREATORS);
                  setPayments(INITIAL_PAYMENTS);
                  setSelectedCreator(null);
                  void runSynced(
                    () => replaceAllData(INITIAL_CREATORS, INITIAL_PAYMENTS),
                    () => {
                      setCreators(previousCreators);
                      setPayments(previousPayments);
                    }
                  );
                }
              }}
              className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
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
