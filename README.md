# GenAI Workspace & Admin Platform

## 1. Project Overview
A unified React application combining a user-facing GenAI Workspace and an Admin Dashboard for platform management. Built with React, Vite, and Tailwind CSS.

## 2. Architecture Summary
- **Frontend**: React (TypeScript) + Vite
- **Backend**: Express (Node.js)
- **Database**: lowdb (JSON-based)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **State Management**: Context API (Auth)
- **Authentication**: JWT (HS256) + SSO (Minimal Integration)
- **Modules**:
  - **Workspace**: User interface for AI tools.
  - **Admin**: Dashboard for system health monitoring.

## 3. Tech Stack
- **React 18+**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Recharts** (Charts)
- **Express** (Backend)
- **lowdb** (Database)

## 4. Folder Structure
```
/backend
  data/             # JSON storage (workspace.json)
  database.ts       # lowdb initialization and seeding
/src
  /modules
    /workspace      # User-facing module
    /admin          # Admin dashboard module
  /shared           # Shared components, contexts, services
  App.tsx           # Main application router
  main.tsx          # Application entry point
```

## 5. How to Run Locally

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the application**:
    ```bash
    npm run dev
    ```
    This starts the **Express backend** (which also serves the Vite frontend in development) automatically using a single Node.js entry point (`server.ts`).

### Default Credentials
- **Email**: `admin@example.com`
- **Password**: `admin`

## 6. Environment Setup
- Create a `.env` file in the root directory.
- Example `.env`:
  ```env
  SECRET_KEY=super-secret-key
  ```

### Database Setup
By default, the application uses **lowdb** for easy setup. The database file will be created automatically at `backend/data/workspace.json` on the first run.

## 7. API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate a user and get a JWT token.
- `POST /api/auth/sso-login`: Authenticate via SSO identity.
- `GET /api/auth/sso-callback`: Handle SSO provider callback.
- `GET /api/auth/me`: Get the current authenticated user's information.

### Workspace
- `GET /api/workspace/apps`: Get all workspace apps.
- `POST /api/workspace/apps`: Create a new workspace app.
- `PUT /api/workspace/apps/{id}`: Update a workspace app.
- `DELETE /api/workspace/apps/{id}`: Delete a workspace app.
- `GET /api/workspace/categories`: Get all categories.
- `POST /api/workspace/categories`: Create a new category.
- `PUT /api/workspace/categories/{id}`: Update a category.
- `DELETE /api/workspace/categories/{id}`: Delete a category.

### Admin
- `GET /api/admin/dashboard-links`: Get all admin dashboard links.
- `POST /api/admin/dashboard-links`: Create a new admin dashboard link.
- `PUT /api/admin/dashboard-links/{id}`: Update an admin dashboard link.
- `DELETE /api/admin/dashboard-links/{id}`: Delete an admin dashboard link.

## 8. Build Instructions
To build the application for production:
```bash
npm run build
```
The output will be in the `dist` directory.

## 9. Role-Based Routing
- **Workspace**: Accessible to all authenticated users.
- **Admin**: Accessible only to users with the `is_admin` flag set to `true`.

## 10. Future Enhancement Roadmap
- **Enhanced Analytics**: Add more detailed metrics and visualizations.
- **User Management**: Implement user roles and permissions management in the admin dashboard.
- **Notifications**: Add real-time notifications for system alerts.

## 11. Recent Updates (Phase 1)
### Hero Redesign (Phase 1 Update)
- **New Hero Component**: Added a dedicated `Hero` component with:
  - **Height**: Fixed 280px-300px for consistency.
  - **Styling**: Premium glassmorphism with subtle gradient backgrounds (Slate/Indigo).
  - **Illustration**: Custom CSS-based 3D-style Robot Character with animated expressions.
  - **Responsiveness**: Adaptive layout that hides illustration on mobile.
- **Header**: Reduced height to 64px (h-16) for better screen real estate.
- **Performance**: Optimized for zero layout shift and fast loading.

### Layout Architecture (Phase 5 Update)
- **Navigation**: Collapsible left sidebar (`SidebarNavigation.tsx`) for main navigation (Home, Favorites, Categories).
  - Expands on hover from 72px to 240px.
  - Vertical layout removes the need for a 'More' dropdown for categories.
- **Header**: The main header is now dedicated to the greeting, search, view mode, and profile controls.
- **Scroll Optimization**:
  - Main content area handles scrolling (`overflow-y-auto`).
  - Body scroll locked (`overflow-hidden`).
  - Scrollbar visually hidden but functional.
- **Hero**: Integrated into scrollable area, triggering nav collapse when scrolled past.
## 12. Admin Architecture (Phase 6 Update)
- **Structured Dashboard Console**: The Admin page has been refactored into a clean, neutral Infrastructure Dashboard.
- **Layout**: Features a left sidebar (`AdminSidebar.tsx`) for filtering services by category, and a main content area (`AdminDashboardCards.tsx`) displaying grouped service cards.
- **Design Philosophy**: Strict adherence to a stable, professional UI. Removed all animations, glow effects, and mock polling.
- **Metrics Handling**: Service cards (`AdminCard.tsx`) fetch their own metrics on mount with a manual refresh option, ensuring no background polling overhead.
- **Color Strategy**: Utilizes a neutral slate palette with indigo accents for active states, supporting both light and dark modes seamlessly.

## 14. UI & Component Enhancements (Phase 8 Update)
- **Dynamic Icon Rendering**: Implemented a `DynamicIcon` component (`src/shared/components/ui/DynamicIcon.tsx`) that dynamically loads icons from the `lucide-react` library based on string names stored in the database or config.
- **Data-Driven UI**: Removed hardcoded text blocks and placeholder metrics from Workspace and Admin cards. The UI now strictly adheres to the data provided via the Application Management section, ensuring a cleaner and more accurate representation of services.
- **Fallback Mechanisms**: The `DynamicIcon` component includes a fallback to a default icon (`Box`) if an invalid or missing icon name is provided, preventing UI breakage.

## 15. Single Sign-On (SSO) Integration
For instructions on how to integrate Single Sign-On (SSO) using OAuth 2.0 / OIDC (e.g., Google, Microsoft, Okta) into the platform, please refer to the [SSO Integration Guide](docs/SSO_INTEGRATION.md).
