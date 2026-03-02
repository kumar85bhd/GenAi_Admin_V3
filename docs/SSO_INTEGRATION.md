# Single Sign-On (SSO) Integration Guide (Minimal Implementation)

This guide outlines the architecture and steps for the minimal, backend-driven SSO integration implemented in the GenAI Workspace.

## 1. Architecture Overview

The integration uses a popup-based flow to handle SSO identity verification and internal JWT issuance.

### Flow Diagram
1. **User Action**: User clicks "Sign in with SSO" on the Login page.
2. **Popup Initiation**: Frontend opens `/api/auth/sso-callback` in a popup window.
3. **Identity Verification**: 
   - The callback handles the interaction with the SSO provider.
   - The popup sends a `postMessage` back to the opener (main window) with the verified email.
4. **Internal Login**: 
   - The main window receives the email and calls `POST /api/auth/sso-login`.
   - The backend validates the email, looks up or creates the user, and issues an internal JWT.
5. **Session Establishment**: 
   - The frontend stores the JWT in `localStorage`.
   - The user is redirected to the Workspace.

## 2. API Endpoints

### `POST /api/auth/sso-login`
Accepts a verified SSO email and issues an internal JWT.
- **Input**: `{ "email": "string" }`
- **Validation**: Strict regex validation for email format.
- **Processing**: 
  - Checks if user exists in the database.
  - If not, creates a minimal user record.
  - Generates JWT with `sub`, `email`, and `is_admin` claims.

### `GET /api/auth/sso-callback`
Handles the SSO provider's redirect and communicates back to the frontend.
- **Purpose**: Bridge between the SSO provider and the application.
- **Implementation**: Returns an HTML page that executes `window.opener.postMessage` to send the identity back to the main application window.

## 3. Frontend Implementation (React)

### 3.1. AuthContext Helper
The `ssoLogin` method in `AuthContext` handles the backend communication:
```tsx
const ssoLogin = async (email: string) => {
  const response = await fetch('/api/auth/sso-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  // ... handle response and store token
};
```

### 3.2. Login Page
The login page replaces the standard form with an SSO trigger:
```tsx
const handleSSO = () => {
  window.open('/api/auth/sso-callback', 'sso_popup', 'width=600,height=700');
};
```

## 4. Security Considerations

- **Backend Validation**: The frontend never trusts an email identity without backend validation.
- **JWT Integrity**: The internal JWT is signed with a server-side secret, ensuring session integrity.
- **Origin Validation**: In production, `postMessage` listeners should strictly validate `event.origin`.

## 5. Testing

To test the SSO flow:
1. Navigate to the `/login` page.
2. Click "Sign in with SSO".
3. A popup will appear and automatically communicate the identity back to the main window.
4. The main window will authenticate and redirect you to the workspace.
