# High-Level Design (HLD) - GenAI Workspace & Admin Platform

## 1. System Overview
The GenAI Workspace is a unified web application designed to provide a seamless experience for both end-users and platform administrators. It combines a user-facing workspace for accessing AI tools and an admin dashboard for monitoring system health and services.

## 2. Architecture
The application follows a full-stack architecture with a modular monolith frontend built with React, Vite, and Tailwind CSS, and a backend built with Express (Node.js) and a lowdb JSON database.

### 2.1 Modules
- **Backend (`/backend`)**: Express server handling authentication, authorization, and API routes. It uses lowdb as a lightweight JSON database.
- **Workspace Module (`/src/modules/workspace`)**: The primary interface for general users. It allows users to browse, search, and launch AI applications.
- **Admin Module (`/src/modules/admin`)**: A restricted area for administrators to manage workspace apps, categories, and dashboard links.
- **Shared Layer (`/src/shared`)**: Contains reusable UI components, contexts (Auth), and utility functions shared across both modules.

### 2.2 Authentication & Authorization
- **Authentication**: Managed via an Express backend using JWT (JSON Web Tokens) with HS256 signature verification.
  - **Single Sign-On (SSO)**: The architecture supports minimal SSO integration via a backend-driven flow. The backend validates SSO identity and issues an internal JWT for session management.
- **Authorization**: Role-based access control (RBAC).
  - `user`: Access to Workspace.
  - `admin`: Access to Workspace and Admin Dashboard.
- **Route Protection**: The `AdminRoute` component guards the `/admin` routes on the frontend, and the `isAdmin` middleware guards API routes on the backend.

### 2.3 UI & Component Architecture
- **Data-Driven UI**: The frontend relies heavily on data provided by the backend to render dynamic interfaces.
- **Dynamic Icon Rendering**: A centralized `DynamicIcon` component dynamically loads and renders SVG icons from the `lucide-react` library based on string identifiers stored in the database or configuration files. This allows administrators to customize application icons without code changes.

## 3. Data Storage
- **Database**: A lowdb JSON database (`backend/data/workspace.json`) is used as the single source of truth for all data, including users, workspace apps, and categories.
- **JSON Configuration**: The `admin_config.json` file is used to store the configuration for the admin dashboard links. This provides a simple way to manage these links without requiring a database migration.

## 4. Routing Model
The application uses `react-router-dom` for client-side routing.
- `/workspace/*`: Entry point for the user workspace.
- `/admin/*`: Entry point for the admin dashboard (Protected).
- `/`: Redirects to `/workspace`.

## 5. Future Extensibility
- **Micro-frontends**: The modular structure allows for potential separation into distinct micro-frontends if the application scale demands it.
