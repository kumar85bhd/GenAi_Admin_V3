import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface User {
  id: number;
  username: string;
  email: string;
  hashed_password: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceApp {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  icon: string;
  url: string;
  description: string;
  key_features: string;
  display_order: number;
  is_active: boolean;
  metrics_enabled: boolean;
  total_launches: number;
  created_at: string;
  updated_at: string;
}

export interface Data {
  users: User[];
  categories: Category[];
  workspace_apps: WorkspaceApp[];
}

const dbPath = path.join(__dirname, '..', 'backend', 'data', 'workspace.json');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData: Data = { users: [], categories: [], workspace_apps: [] };

// We'll initialize the db instance in initDb because it's async
export let db: any;

export async function initDb() {
  db = await JSONFilePreset<Data>(dbPath, defaultData);
  await db.read();
  
  // Ensure default structure if file was empty or corrupted
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  } else {
    // Migration: Ensure total_launches exists for all apps
    let changed = false;
    db.data.workspace_apps.forEach((app: any) => {
      if (app.total_launches === undefined) {
        app.total_launches = 0;
        changed = true;
      }
    });
    if (changed) {
      await db.write();
    }
  }
}

export async function seedDb() {
  if (!db.data) return;

  // Seed Users
  if (db.data.users.length === 0) {
    console.log('🌱 Seeding users...');
    const usersJsonPath = path.join(__dirname, '..', 'backend', 'data', 'users.json');
    if (fs.existsSync(usersJsonPath)) {
      const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
      for (const user of users) {
        db.data.users.push({
          id: user.id,
          username: user.username,
          email: user.email,
          hashed_password: bcrypt.hashSync(user.password, 10),
          is_active: true,
          is_admin: !!user.is_admin
        });
      }
    } else {
      console.log(`⚠️ Users file not found at ${usersJsonPath}`);
    }
  }

  // Seed Categories
  if (db.data.categories.length === 0) {
    console.log('🌱 Seeding categories...');
    const categories = [
      { name: 'Generative Text', slug: 'gen-text', icon: 'MessageSquare' },
      { name: 'Image Generation', slug: 'gen-image', icon: 'Image' },
      { name: 'Code Assistants', slug: 'code-assist', icon: 'Code' },
      { name: 'Data Analytics', slug: 'data-analytics', icon: 'BarChart' },
      { name: 'Productivity', slug: 'productivity', icon: 'Zap' },
    ];
    
    categories.forEach((cat, index) => {
      db.data.categories.push({
        id: index + 1,
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  }

  // Seed Apps
  if (db.data.workspace_apps.length === 0) {
    console.log('🌱 Seeding apps...');
    const catMap = Object.fromEntries(db.data.categories.map((c: Category) => [c.slug, c.id]));

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

    apps.forEach((app, index) => {
      if (app.category_id) {
        db.data.workspace_apps.push({
          id: index + 1,
          ...app,
          key_features: '',
          is_active: true,
          metrics_enabled: false,
          total_launches: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
  }

  await db.write();
}
