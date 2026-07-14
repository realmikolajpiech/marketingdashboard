import { Creator, PaymentLog } from "../types";
import { normalizeCreator } from "../utils";
import { getSupabase } from "./supabase";

interface CreatorRow {
  id: string;
  user_id: string;
  name: string;
  platform_profiles: Creator["platformProfiles"];
  status: Creator["status"];
  notes: string;
  avatar_url: string | null;
  negotiation_log: Creator["negotiationLog"];
  created_at: string;
}

interface SettingsRow {
  user_id: string;
  budget: number;
  updated_at: string;
}

interface PaymentRow {
  id: string;
  user_id: string;
  creator_id: string;
  creator_name: string;
  amount: number;
  payment_date: string;
  video_url: string | null;
  notes: string;
  created_at: string;
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await getSupabase().auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to access campaign data.");
  }

  return user.id;
}

function toCreator(row: CreatorRow): Creator {
  return normalizeCreator({
    id: row.id,
    name: row.name,
    platformProfiles: row.platform_profiles,
    status: row.status,
    notes: row.notes,
    avatarUrl: row.avatar_url ?? undefined,
    negotiationLog: row.negotiation_log ?? [],
    moneySpent: 0,
    videosPosted: 0,
    totalViewsGenerated: 0,
  });
}

function fromCreator(creator: Creator, userId: string) {
  return {
    id: creator.id,
    user_id: userId,
    name: creator.name,
    platform_profiles: creator.platformProfiles,
    status: creator.status,
    notes: creator.notes,
    avatar_url: creator.avatarUrl ?? null,
    negotiation_log: creator.negotiationLog ?? [],
  };
}

function toPayment(row: PaymentRow): PaymentLog {
  return {
    id: row.id,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    videoUrl: row.video_url ?? undefined,
    notes: row.notes,
  };
}

function fromPayment(payment: PaymentLog, userId: string) {
  return {
    id: payment.id,
    user_id: userId,
    creator_id: payment.creatorId,
    creator_name: payment.creatorName,
    amount: payment.amount,
    payment_date: payment.paymentDate,
    video_url: payment.videoUrl ?? null,
    notes: payment.notes,
  };
}

function formatDbError(error: { message: string; code?: string }) {
  if (error.code === "PGRST205") {
    return "Database tables are missing. Run the SQL migrations in supabase/migrations/, or npm run db:setup.";
  }
  if (error.code === "42501") {
    return "Permission denied. Run supabase/migrations/20260707130000_auth_rls.sql and sign in again.";
  }
  return error.message;
}

export async function fetchCreators(): Promise<Creator[]> {
  const { data, error } = await getSupabase()
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatDbError(error));
  return (data as CreatorRow[]).map(toCreator);
}

export async function fetchPayments(): Promise<PaymentLog[]> {
  const { data, error } = await getSupabase()
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatDbError(error));
  return (data as PaymentRow[]).map(toPayment);
}

export async function insertCreator(creator: Creator): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabase()
    .from("creators")
    .upsert(fromCreator(creator, userId), { onConflict: "id" });
  if (error) throw new Error(formatDbError(error));
}

export async function updateCreator(creator: Creator): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabase()
    .from("creators")
    .update(fromCreator(creator, userId))
    .eq("id", creator.id);
  if (error) throw new Error(formatDbError(error));
}

export async function deleteCreator(id: string): Promise<void> {
  const { error } = await getSupabase().from("creators").delete().eq("id", id);
  if (error) throw new Error(formatDbError(error));
}

export async function insertPayment(payment: PaymentLog): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabase()
    .from("payments")
    .upsert(fromPayment(payment, userId), { onConflict: "id" });
  if (error) throw new Error(formatDbError(error));
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await getSupabase().from("payments").delete().eq("id", id);
  if (error) throw new Error(formatDbError(error));
}

export async function replaceAllData(creators: Creator[], payments: PaymentLog[]): Promise<void> {
  const userId = await requireUserId();

  const { error: paymentsDeleteError } = await getSupabase()
    .from("payments")
    .delete()
    .neq("id", "");

  if (paymentsDeleteError) throw new Error(formatDbError(paymentsDeleteError));

  const { error: creatorsDeleteError } = await getSupabase().from("creators").delete().neq("id", "");

  if (creatorsDeleteError) throw new Error(formatDbError(creatorsDeleteError));

  if (creators.length > 0) {
    const { error: creatorsInsertError } = await getSupabase()
      .from("creators")
      .upsert(creators.map((creator) => fromCreator(creator, userId)), { onConflict: "id" });

    if (creatorsInsertError) throw new Error(formatDbError(creatorsInsertError));
  }

  if (payments.length > 0) {
    const { error: paymentsInsertError } = await getSupabase()
      .from("payments")
      .upsert(payments.map((payment) => fromPayment(payment, userId)), { onConflict: "id" });

    if (paymentsInsertError) throw new Error(formatDbError(paymentsInsertError));
  }
}

export async function fetchBudget(): Promise<number> {
  const { data, error } = await getSupabase().from("settings").select("budget").maybeSingle();
  if (error) throw new Error(formatDbError(error));
  return (data as SettingsRow | null)?.budget ?? 0;
}

export async function updateBudget(budget: number): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabase()
    .from("settings")
    .upsert({ user_id: userId, budget, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(formatDbError(error));
}

export async function loadTrailoData(): Promise<{
  creators: Creator[];
  payments: PaymentLog[];
  budget: number;
}> {
  const [creators, payments, budget] = await Promise.all([
    fetchCreators(),
    fetchPayments(),
    fetchBudget(),
  ]);
  return { creators, payments, budget };
}
