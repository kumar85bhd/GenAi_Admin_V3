# User-Level Design (ULD) - GenAI Workspace & Admin Platform

## 1. Overview
The GenAI Workspace is a unified platform providing users with access to various AI tools and an administrative dashboard for system monitoring.

## 2. User Personas
- **Standard User**: Accesses the workspace to use AI tools.
- **Administrator**: Has all standard user capabilities plus access to the Admin Dashboard for managing workspace apps, categories, and dashboard links.

## 3. Key Features
- **Dynamic Workspace**: A responsive grid of AI tools categorized by function.
- **Intelligent Navigation**: A collapsible left sidebar that expands on hover, providing access to all tool categories in a clean, vertical layout.
- **Admin Dashboard**: A dedicated interface for administrators to manage the workspace content.

## 4. Backend Consolidation Update

As part of a recent backend consolidation effort, the underlying technology has been migrated from a Node.js and SQLite stack to a FastAPI and PostgreSQL stack. This change was made to improve performance, scalability, and maintainability.

### 4.1 Impact on Users

**There are no changes to the user interface, user experience, or application functionality.** All existing features and workflows remain exactly the same. The API contract has been preserved, ensuring that the frontend continues to work seamlessly with the new backend.

### 4.2 Endpoint Contract Confirmation

All API endpoints remain unchanged. The following endpoints are now served by the FastAPI backend, but their paths, request/response formats, and behavior are identical to the previous implementation:

- `/api/auth/login`
- `/api/auth/me`
- `/api/workspace/apps`
- `/api/workspace/categories`
- `/api/admin/dashboard-links`
