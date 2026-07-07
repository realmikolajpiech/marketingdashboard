import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "xzyomjkdfuopligidfxu";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error(
    "Missing SUPABASE_DB_PASSWORD. Add your database password to .env, then run npm run db:setup again."
  );
  console.error("Find it in Supabase Dashboard → Project Settings → Database.");
  process.exit(1);
}

const regions = [
  "eu-central-1",
  "us-east-1",
  "us-west-1",
  "ap-southeast-1",
  "ap-northeast-1",
];

const migrationDir = join(process.cwd(), "supabase/migrations");
const sql = readdirSync(migrationDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(join(migrationDir, file), "utf8"))
  .join("\n\n");

const candidates = [
  process.env.SUPABASE_DB_URL,
  ...regions.map(
    (region) =>
      `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`
  ),
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
].filter(Boolean);

let lastError: unknown;

for (const connectionString of candidates) {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Supabase schema applied successfully.");
    await client.end();
    process.exit(0);
  } catch (error) {
    lastError = error;
    await client.end().catch(() => undefined);
  }
}

console.error("Failed to apply schema:", lastError instanceof Error ? lastError.message : lastError);
process.exit(1);
