import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { fetchInstagramAvgViews, normalizeUsername } from "./server/instagram";
import { ensureSupabaseSchema } from "./server/db-setup";


dotenv.config();

async function startServer() {
  try {
    await ensureSupabaseSchema();
  } catch (error) {
    console.warn("Supabase schema setup skipped:", error instanceof Error ? error.message : error);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/instagram-views", async (req, res) => {
    const username = normalizeUsername(String(req.query.handle || ""));

    if (!username) {
      return res.status(400).json({ error: "Handle is required" });
    }

    try {
      const result = await fetchInstagramAvgViews(username);

      if ("error" in result) {
        const status = result.code === "not_found" ? 404 : 422;
        return res.status(status).json(result);
      }

      return res.json({ username, ...result });
    } catch {
      return res.status(502).json({ error: "Could not fetch views from Instagram" });
    }
  });

  // Serve static assets / Vite middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  }).on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or run: PORT=${PORT + 1} npm run dev`);
      process.exit(1);
    }
    throw err;
  });
}

startServer();
