# Low-Level Design (LLD) - GenAI Workspace & Admin Platform

## 1. Folder Structure
```
/backend
  data/             # JSON storage (workspace.json)
  database.ts       # lowdb initialization and seeding
/src
  /modules
    /workspace      # User-facing module
      /components   # Workspace-specific components
    /admin          # Admin dashboard module
      /components   # Admin-specific components
  /shared           # Shared resources
    /components     # Reusable UI components (Button, Modal, Toast)
    /context        # Global contexts (Auth)
    /services       # Shared API logic
  App.tsx           # Main application router
  main.tsx          # Application entry point
```

## 2. Component Hierarchy

### 2.1 Main Application (`App.tsx`)
- **Providers**: `AuthProvider`
- **Router**: `BrowserRouter`
  - **Route**: `/workspace/*` -> `WorkspaceModule`
  - **Route**: `/admin/*` -> `ProtectedRoute` -> `AdminRoute` -> `AdminModule`

### 2.2 Workspace Module (`WorkspaceModule.tsx`)
- **Layout**: `SidebarNavigation` (Fixed, Collapsible), `Header` (Sticky), `MainContent` (Scrollable)
- **State**: `searchQuery`, `viewMode`, `activeFilter`, `activeCategory`

### 2.3 Admin Module (`AdminModule.tsx`)
- **Layout**: `AdminSidebar` (Left), `MainContent` (Right)
- **State**: `apps`, `categories`, `dashboardLinks`

### 2.4 Shared Components
- **`DynamicIcon` (`src/shared/components/ui/DynamicIcon.tsx`)**: A utility component that takes a string name (e.g., "FileText") and dynamically renders the corresponding SVG icon from the `lucide-react` library. It includes a fallback mechanism to prevent rendering errors if an invalid icon name is provided.

## 3. Context Providers

### 3.1 AuthContext
- **State**: `user` (User object or null), `isAuthenticated` (boolean)
- **Functions**: `login`, `ssoLogin`, `logout`
- **Source**: `src/shared/context/AuthContext.tsx`
- **SSO Integration**: The context supports SSO flows by handling verified email identities from the backend and updating the authentication state accordingly.

## 4. Routing Configuration

- **Protected Routes**: Implemented via `ProtectedRoute` and `AdminRoute` wrapper components.
- **Redirects**: Unauthorized access to `/admin` redirects to `/workspace`.

## 5. Data Flow

1.  **Initialization**: `App.tsx` initializes contexts.
2.  **Authentication**: `AuthContext` checks for existing session by calling the `/api/auth/me` endpoint.
3.  **Data Fetching**:
    -   **Workspace**: Fetches app list and categories from `src/shared/services/api.ts`.
    -   **Admin**: Fetches dashboard links from `src/modules/admin/services/api.ts`.
4.  **State Updates**: Components update local state or context state, triggering re-renders.

## 6. Database Schema

### 6.1 Users
- `id`: Integer, Primary Key
- `username`: String, Unique
- `email`: String, Unique
- `hashed_password`: String
- `is_active`: Boolean
- `is_admin`: Boolean

### 6.2 Categories
- `id`: Integer, Primary Key
- `name`: String, Unique
- `slug`: String, Unique
- `icon`: String
- `created_at`: DateTime
- `updated_at`: DateTime

### 6.3 Workspace Apps
- `id`: Integer, Primary Key
- `name`: String, Unique
- `slug`: String, Unique
- `category_id`: Integer, Foreign Key to `categories.id`
- `icon`: String
- `url`: Text
- `description`: Text
- `display_order`: Integer
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime
