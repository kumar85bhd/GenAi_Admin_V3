import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, initDb, seedDb } from "./backend/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key-for-jwt-tokens";
const ADMIN_CONFIG_PATH = path.join(__dirname, "admin_config.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log("🚀 Starting Unified GenAI Workspace (Node.js Backend)...");
  
  // Initialize Database
  initDb();
  seedDb();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ detail: "Not authenticated" });

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
      if (err) return res.status(401).json({ detail: "Invalid token" });
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ detail: "Admin privileges required" });
    }
    next();
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    // Note: username field in OAuth2PasswordRequestForm often holds the email
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(username, username) as any;

    if (!user || !bcrypt.compareSync(password, user.hashed_password)) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }

    const token = jwt.sign({ sub: user.email, email: user.email, is_admin: !!user.is_admin }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ access_token: token, token_type: "bearer" });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, username, email, is_admin FROM users WHERE email = ?').get(req.user.sub) as any;
    if (!user) return res.status(404).json({ detail: "User not found" });
    res.json({ ...user, is_admin: !!user.is_admin });
  });

  // Workspace Categories
  app.get("/api/workspace/categories", (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  });

  app.post("/api/workspace/categories", authenticateToken, isAdmin, (req, res) => {
    const { name, slug, icon } = req.body;
    try {
      const info = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)').run(name, slug, icon || 'Folder');
      const newCat = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
      res.json(newCat);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.put("/api/workspace/categories/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, slug, icon } = req.body;
    try {
      db.prepare('UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?').run(name, slug, icon || 'Folder', req.params.id);
      const updatedCat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
      if (!updatedCat) return res.status(404).json({ detail: "Category not found" });
      res.json(updatedCat);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.delete("/api/workspace/categories/:id", authenticateToken, isAdmin, (req, res) => {
    try {
      const info = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
      if (info.changes === 0) return res.status(404).json({ detail: "Category not found" });
      res.json({ message: "Category deleted" });
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  // Workspace Apps
  app.get("/api/workspace/apps", (req, res) => {
    const includeInactive = req.query.all === 'true';
    const query = `
      SELECT 
        a.id, a.name, a.slug, a.icon, a.url, a.description, a.key_features,
        a.display_order, a.is_active, a.metrics_enabled, c.name as category 
      FROM workspace_apps a
      JOIN categories c ON a.category_id = c.id
      ${includeInactive ? '' : 'WHERE a.is_active = 1'}
      ORDER BY a.display_order ASC, a.name ASC
    `;
    const apps = db.prepare(query).all() as any[];

    // Add missing fields for frontend compatibility
    const mappedApps = apps.map(app => ({
      ...app,
      desc: app.description,
      keyFeatures: app.key_features,
      metricsEnabled: app.metrics_enabled === 1,
      baseActivity: 'System: Active',
      isFavorite: false,
      metrics: '94/100',
      status: 'Healthy',
      lastUsed: new Date().toISOString()
    }));

    res.json(mappedApps);
  });

  app.post("/api/workspace/apps", authenticateToken, isAdmin, (req, res) => {
    const { name, slug, category_id, icon, url, description, key_features, display_order, is_active, metrics_enabled } = req.body;
    try {
      const info = db.prepare('INSERT INTO workspace_apps (name, slug, category_id, icon, url, description, key_features, display_order, is_active, metrics_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(name, slug, category_id, icon, url?.toString() || '', description, key_features || '', display_order || 0, is_active ? 1 : 0, metrics_enabled ? 1 : 0);
      const newApp = db.prepare('SELECT * FROM workspace_apps WHERE id = ?').get(info.lastInsertRowid);
      res.json(newApp);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.put("/api/workspace/apps/:id", authenticateToken, isAdmin, (req, res) => {
    const { name, slug, category_id, icon, url, description, key_features, display_order, is_active, metrics_enabled } = req.body;
    try {
      db.prepare(`
        UPDATE workspace_apps 
        SET name = ?, slug = ?, category_id = ?, icon = ?, url = ?, description = ?, key_features = ?, display_order = ?, is_active = ?, metrics_enabled = ?
        WHERE id = ?
      `).run(name, slug, category_id, icon, url?.toString() || '', description, key_features || '', display_order || 0, is_active ? 1 : 0, metrics_enabled ? 1 : 0, req.params.id);
      const updatedApp = db.prepare('SELECT * FROM workspace_apps WHERE id = ?').get(req.params.id);
      if (!updatedApp) return res.status(404).json({ detail: "App not found" });
      res.json(updatedApp);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.delete("/api/workspace/apps/:id", authenticateToken, isAdmin, (req, res) => {
    try {
      const info = db.prepare('DELETE FROM workspace_apps WHERE id = ?').run(req.params.id);
      if (info.changes === 0) return res.status(404).json({ detail: "App not found" });
      res.json({ message: "App deleted" });
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  // Admin Dashboard Links
  const readAdminConfig = () => {
    try {
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, 'utf-8'));
      }
    } catch (e) {}
    return { dashboard_links: [] };
  };

  const writeAdminConfig = (config: any) => {
    fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(config, null, 2));
  };

  app.get("/api/admin/dashboard-links", authenticateToken, isAdmin, (req, res) => {
    const config = readAdminConfig();
    res.json(config.dashboard_links || []);
  });

  app.post("/api/admin/dashboard-links", authenticateToken, isAdmin, (req, res) => {
    const config = readAdminConfig();
    const newLink = { ...req.body, id: crypto.randomUUID() };
    config.dashboard_links = [...(config.dashboard_links || []), newLink];
    writeAdminConfig(config);
    res.json(newLink);
  });

  app.put("/api/admin/dashboard-links/:id", authenticateToken, isAdmin, (req, res) => {
    const config = readAdminConfig();
    const index = (config.dashboard_links || []).findIndex((l: any) => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ detail: "Link not found" });
    }
    config.dashboard_links[index] = { ...config.dashboard_links[index], ...req.body, id: req.params.id };
    writeAdminConfig(config);
    res.json(config.dashboard_links[index]);
  });

  app.delete("/api/admin/dashboard-links/:id", authenticateToken, isAdmin, (req, res) => {
    const config = readAdminConfig();
    const initialLength = config.dashboard_links?.length || 0;
    config.dashboard_links = (config.dashboard_links || []).filter((l: any) => l.id !== req.params.id);
    if (config.dashboard_links.length === initialLength) {
      return res.status(404).json({ detail: "Link not found" });
    }
    writeAdminConfig(config);
    res.json({ message: "Link deleted" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "node-express" });
  });

  // --- Frontend Serving ---
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false 
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Serving production build...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Unified Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("💥 Fatal error during startup:", err);
  process.exit(1);
});
