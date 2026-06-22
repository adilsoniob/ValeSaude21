import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_PATH = path.resolve("/data/admin-config.json");

export function createAdminConfigRouter(authMiddleware) {
  const router = Router();

  router.get("/api/admin/config", authMiddleware, async (_req, res) => {
    try {
      const raw = await fs.readFile(CONFIG_PATH, "utf8");
      return res.json({ success: true, config: JSON.parse(raw) });
    } catch {
      return res.json({ success: true, config: {} });
    }
  });

  router.post("/api/admin/config", authMiddleware, async (req, res) => {
    try {
      const payload = req.body || {};
      await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
      await fs.writeFile(CONFIG_PATH, JSON.stringify(payload, null, 2));
      return res.json({ success: true, message: "Configuracao salva no servidor WhatsApp." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
}
