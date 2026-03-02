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

The underlying technology has been migrated to an Express (Node.js) and lowdb (JSON) stack. This change provides a lightweight, performant, and easily maintainable backend that works seamlessly in restricted environments.

### 4.1 Impact on Users

**There are no changes to the user interface, user experience, or application functionality.** All existing features and workflows remain exactly the same. The API contract has been preserved, ensuring that the frontend continues to work seamlessly with the new backend.

### 4.2 Authentication Flow Update

The platform now supports Single Sign-On (SSO) as the primary authentication method.
- **SSO Redirect**: Users are redirected to a secure SSO provider for identity verification.
- **SSO Callback**: Upon successful verification, the user is returned to the workspace.
- **JWT Issuance**: The backend issues a standard JWT for session management, ensuring a secure and seamless journey from login to workspace.

### 4.3 Endpoint Contract Confirmation

The following endpoints are served by the Express backend:

- `/api/auth/login`
- `/api/auth/sso-login`
- `/api/auth/sso-callback`
- `/api/auth/me`
- `/api/workspace/apps`
- `/api/workspace/categories`
- `/api/admin/dashboard-links`
