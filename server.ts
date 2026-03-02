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
  await initDb();
  await seedDb();

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
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    await db.read();
    const user = db.data.users.find((u: any) => u.email === username || u.username === username);

    if (!user || !bcrypt.compareSync(password, user.hashed_password)) {
      return res.status(401).json({ detail: "Incorrect email or password" });
    }

    const token = jwt.sign({ sub: user.email, email: user.email, is_admin: !!user.is_admin }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ access_token: token, token_type: "bearer" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    await db.read();
    const user = db.data.users.find((u: any) => u.email === req.user.sub);
    if (!user) return res.status(404).json({ detail: "User not found" });
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.hashed_password;
    res.json({ ...userWithoutPassword, is_admin: !!user.is_admin });
  });

  // Workspace Categories
  app.get("/api/workspace/categories", async (req, res) => {
    await db.read();
    const categories = [...db.data.categories].sort((a, b) => a.name.localeCompare(b.name));
    res.json(categories);
  });

  app.post("/api/workspace/categories", authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, icon } = req.body;
    try {
      await db.read();
      const id = db.data.categories.length > 0 ? Math.max(...db.data.categories.map((c: any) => c.id)) + 1 : 1;
      const newCat = {
        id,
        name,
        slug,
        icon: icon || 'Folder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.data.categories.push(newCat);
      await db.write();
      res.json(newCat);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.put("/api/workspace/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, icon } = req.body;
    const id = parseInt(req.params.id);
    try {
      await db.read();
      const index = db.data.categories.findIndex((c: any) => c.id === id);
      if (index === -1) return res.status(404).json({ detail: "Category not found" });
      
      db.data.categories[index] = {
        ...db.data.categories[index],
        name,
        slug,
        icon: icon || 'Folder',
        updated_at: new Date().toISOString()
      };
      await db.write();
      res.json(db.data.categories[index]);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.delete("/api/workspace/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await db.read();
      const initialLength = db.data.categories.length;
      db.data.categories = db.data.categories.filter((c: any) => c.id !== id);
      if (db.data.categories.length === initialLength) return res.status(404).json({ detail: "Category not found" });
      await db.write();
      res.json({ message: "Category deleted" });
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  // Workspace Apps
  app.get("/api/workspace/apps", async (req, res) => {
    const includeInactive = req.query.all === 'true';
    await db.read();
    
    let apps = db.data.workspace_apps;
    if (!includeInactive) {
      apps = apps.filter((a: any) => a.is_active);
    }

    const mappedApps = apps.map((app: any) => {
      const category = db.data.categories.find((c: any) => c.id === app.category_id);
      return {
        ...app,
        category: category ? category.name : 'Uncategorized',
        desc: app.description,
        keyFeatures: app.key_features,
        metricsEnabled: !!app.metrics_enabled,
        baseActivity: 'System: Active',
        isFavorite: false,
        metrics: '94/100',
        status: 'Healthy',
        lastUsed: new Date().toISOString()
      };
    });

    mappedApps.sort((a: any, b: any) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.name.localeCompare(b.name);
    });

    res.json(mappedApps);
  });

  app.post("/api/workspace/apps", authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, category_id, icon, url, description, key_features, display_order, is_active, metrics_enabled } = req.body;
    try {
      await db.read();
      const id = db.data.workspace_apps.length > 0 ? Math.max(...db.data.workspace_apps.map((a: any) => a.id)) + 1 : 1;
      const newApp = {
        id,
        name,
        slug,
        category_id: parseInt(category_id),
        icon,
        url: url?.toString() || '',
        description,
        key_features: key_features || '',
        display_order: display_order || 0,
        is_active: !!is_active,
        metrics_enabled: !!metrics_enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.data.workspace_apps.push(newApp);
      await db.write();
      res.json(newApp);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.put("/api/workspace/apps/:id", authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, category_id, icon, url, description, key_features, display_order, is_active, metrics_enabled } = req.body;
    const id = parseInt(req.params.id);
    try {
      await db.read();
      const index = db.data.workspace_apps.findIndex((a: any) => a.id === id);
      if (index === -1) return res.status(404).json({ detail: "App not found" });

      db.data.workspace_apps[index] = {
        ...db.data.workspace_apps[index],
        name,
        slug,
        category_id: parseInt(category_id),
        icon,
        url: url?.toString() || '',
        description,
        key_features: key_features || '',
        display_order: display_order || 0,
        is_active: !!is_active,
        metrics_enabled: !!metrics_enabled,
        updated_at: new Date().toISOString()
      };
      await db.write();
      res.json(db.data.workspace_apps[index]);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.delete("/api/workspace/apps/:id", authenticateToken, isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await db.read();
      const initialLength = db.data.workspace_apps.length;
      db.data.workspace_apps = db.data.workspace_apps.filter((a: any) => a.id !== id);
      if (db.data.workspace_apps.length === initialLength) return res.status(404).json({ detail: "App not found" });
      await db.write();
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
    } catch {
      // Ignore read errors, return default
    }
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
