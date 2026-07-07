import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

function loadMigrations(): string {
  const dir = join(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  return files.map((file) => readFileSync(join(dir, file), "utf8")).join("\n\n");
}

export async function ensureSupabaseSchema(): Promise<void> {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) return;

  const projectRef = process.env.SUPABASE_PROJECT_REF ?? "xzyomjkdfuopligidfxu";
  const connectionString =
    process.env.SUPABASE_DB_URL ??
    `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

  const sql = loadMigrations();
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Supabase schema verified.");
  } finally {
    await client.end();
  }
}
