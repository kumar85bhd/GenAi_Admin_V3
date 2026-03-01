import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'workspace.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Initialize Tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      is_admin BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT 'Folder',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workspace_apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id INTEGER NOT NULL,
      icon TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT NOT NULL,
      key_features TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      metrics_enabled BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  try {
    db.exec(`ALTER TABLE workspace_apps ADD COLUMN metrics_enabled BOOLEAN DEFAULT 0;`);
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE workspace_apps ADD COLUMN key_features TEXT;`);
  } catch (e) {
    // Column might already exist
  }
}

// Seeding Logic
export function seedDb() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('🌱 Seeding users...');
    const usersJsonPath = path.join(__dirname, '..', 'backend', 'data', 'users.json');
    if (fs.existsSync(usersJsonPath)) {
      const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
      const insertUser = db.prepare('INSERT INTO users (id, username, email, hashed_password, is_admin) VALUES (?, ?, ?, ?, ?)');
      for (const user of users) {
        insertUser.run(user.id, user.username, user.email, bcrypt.hashSync(user.password, 10), user.is_admin ? 1 : 0);
      }
    } else {
      console.log(`⚠️ Users file not found at ${usersJsonPath}`);
    }
  }

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    console.log('🌱 Seeding categories...');
    const categories = [
      { name: 'Generative Text', slug: 'gen-text', icon: 'MessageSquare' },
      { name: 'Image Generation', slug: 'gen-image', icon: 'Image' },
      { name: 'Code Assistants', slug: 'code-assist', icon: 'Code' },
      { name: 'Data Analytics', slug: 'data-analytics', icon: 'BarChart' },
      { name: 'Productivity', slug: 'productivity', icon: 'Zap' },
    ];
    const insertCat = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
    for (const cat of categories) {
      insertCat.run(cat.name, cat.slug, cat.icon);
    }
  }

  const appCount = db.prepare('SELECT COUNT(*) as count FROM workspace_apps').get() as { count: number };
  if (appCount.count === 0) {
    console.log('🌱 Seeding apps...');
    const categories = db.prepare('SELECT id, slug FROM categories').all() as { id: number, slug: string }[];
    const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

    const apps = [
      { name: 'Gemini Pro', slug: 'gemini-pro', category_id: catMap['gen-text'], icon: 'Cpu', url: 'https://gemini.google.com', description: 'Advanced reasoning and multimodal capabilities.', display_order: 1 },
      { name: 'ChatGPT Plus', slug: 'chatgpt-plus', category_id: catMap['gen-text'], icon: 'MessageCircle', url: 'https://chat.openai.com', description: "The world's most popular AI chatbot.", display_order: 2 },
      { name: 'Claude 3', slug: 'claude-3', category_id: catMap['gen-text'], icon: 'Zap', url: 'https://claude.ai', description: 'Anthropic\'s most capable AI model.', display_order: 3 },
      { name: 'Perplexity', slug: 'perplexity', category_id: catMap['gen-text'], icon: 'Search', url: 'https://www.perplexity.ai', description: 'AI-powered search engine.', display_order: 4 },
      { name: 'Midjourney', slug: 'midjourney', category_id: catMap['gen-image'], icon: 'Palette', url: 'https://www.midjourney.com', description: 'High-quality artistic image generation.', display_order: 1 },
      { name: 'DALL-E 3', slug: 'dall-e-3', category_id: catMap['gen-image'], icon: 'Image', url: 'https://labs.openai.com', description: 'OpenAI\'s image generation model.', display_order: 2 },
      { name: 'Stable Diffusion', slug: 'stable-diffusion', category_id: catMap['gen-image'], icon: 'Layers', url: 'https://dreamstudio.ai', description: 'Open-source image generation.', display_order: 3 },
      { name: 'GitHub Copilot', slug: 'github-copilot', category_id: catMap['code-assist'], icon: 'Github', url: 'https://github.com/features/copilot', description: 'Your AI pair programmer.', display_order: 1 },
      { name: 'Cursor', slug: 'cursor', category_id: catMap['code-assist'], icon: 'Code', url: 'https://cursor.sh', description: 'AI-first code editor.', display_order: 2 },
      { name: 'Phind', slug: 'phind', category_id: catMap['code-assist'], icon: 'Terminal', url: 'https://www.phind.com', description: 'AI search engine for developers.', display_order: 3 },
      { name: 'Notion AI', slug: 'notion-ai', category_id: catMap['productivity'], icon: 'FileText', url: 'https://www.notion.so', description: 'AI-powered writing and organization.', display_order: 1 },
      { name: 'Jasper', slug: 'jasper', category_id: catMap['productivity'], icon: 'PenTool', url: 'https://www.jasper.ai', description: 'AI content creation platform.', display_order: 2 },
      { name: 'Tableau AI', slug: 'tableau-ai', category_id: catMap['data-analytics'], icon: 'PieChart', url: 'https://www.tableau.com', description: 'AI-driven data visualization.', display_order: 1 },
      { name: 'PowerBI AI', slug: 'powerbi-ai', category_id: catMap['data-analytics'], icon: 'BarChart', url: 'https://powerbi.microsoft.com', description: 'Business intelligence with AI.', display_order: 2 }
    ];

    const insertApp = db.prepare('INSERT INTO workspace_apps (name, slug, category_id, icon, url, description, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const app of apps) {
      if (app.category_id) {
        insertApp.run(app.name, app.slug, app.category_id, app.icon, app.url, app.description, app.display_order);
      }
    }
  }
}
