# Single Sign-On (SSO) Integration Guide

This guide outlines the architecture and steps required to integrate Single Sign-On (SSO) into the GenAI Workspace & Admin Platform. Currently, the platform uses local JWT-based authentication. Integrating SSO (e.g., Google Workspace, Microsoft Entra ID / Azure AD, Okta, or GitHub) will enhance security and user experience.

## 1. Architecture Overview

The recommended approach for integrating SSO into this platform is using **OAuth 2.0 / OpenID Connect (OIDC)**. 

The flow will involve:
1. **Frontend (React)**: Initiates the login process by redirecting the user to the Identity Provider (IdP).
2. **Identity Provider (IdP)**: Authenticates the user and redirects back to the backend with an authorization code.
3. **Backend (FastAPI)**: Exchanges the authorization code for an access token and ID token with the IdP.
4. **Backend (FastAPI)**: Verifies the ID token, extracts user information (email, name), and either finds the existing user or provisions a new one in the PostgreSQL database.
5. **Backend (FastAPI)**: Generates the platform's internal JWT and redirects the user back to the frontend with the token.
6. **Frontend (React)**: Stores the JWT and authenticates the user session.

## 2. Prerequisites

Before implementing SSO, you will need:
- An account with your chosen Identity Provider (e.g., Google Cloud Console, Azure Portal, Okta Developer).
- Registered an OAuth Application in the IdP to obtain:
  - `CLIENT_ID`
  - `CLIENT_SECRET`
- Configured the **Authorized Redirect URIs** in the IdP (e.g., `https://your-domain.com/api/auth/callback/google`).

## 3. Backend Implementation (FastAPI)

### 3.1. Install Dependencies
You will need an OAuth library for FastAPI, such as `Authlib` or `httpx` for manual token exchange.
```bash
pip install authlib httpx
```

### 3.2. Environment Variables
Add the following to your `.env` file:
```env
SSO_PROVIDER=google
SSO_CLIENT_ID=your_client_id
SSO_CLIENT_SECRET=your_client_secret
SSO_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 3.3. API Routes
Add new routes in `backend/routes/auth.py`:

1. **Login Route (`/api/auth/login/{provider}`)**:
   Redirects the user to the IdP's authorization URL.
   
2. **Callback Route (`/api/auth/callback/{provider}`)**:
   Handles the redirect from the IdP, exchanges the code for tokens, and issues the internal JWT.

```python
# Example pseudo-code for callback
@router.get("/callback/google")
async def auth_callback(code: str, db: Session = Depends(get_db)):
    # 1. Exchange code for Google token
    # 2. Fetch user profile from Google API
    # 3. Check if user exists in DB by email
    # 4. If not, create user (auto-provisioning)
    # 5. Generate internal JWT
    # 6. Redirect to frontend with token (e.g., via URL hash or HttpOnly cookie)
    return RedirectResponse(url=f"/workspace?token={internal_jwt}")
```

## 4. Frontend Implementation (React)

### 4.1. Update Login UI
Modify the login screen to include an "SSO Login" button.

```tsx
// src/shared/components/Login.tsx
const handleSSOLogin = () => {
  // Redirect directly to the backend route which handles the IdP redirect
  window.location.href = '/api/auth/login/google';
};

<button onClick={handleSSOLogin}>
  Sign in with Google
</button>
```

### 4.2. Handle Token Reception
Update the application entry point or a dedicated callback component to capture the JWT returned by the backend after a successful SSO flow.

```tsx
// Example logic in App.tsx or a dedicated /auth/callback route
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('access_token', token);
    // Clean up URL
    window.history.replaceState({}, document.title, '/workspace');
    // Trigger auth context update
    checkAuthStatus();
  }
}, []);
```

## 5. Security Considerations

- **State Parameter**: Always use a `state` parameter in the OAuth flow to prevent Cross-Site Request Forgery (CSRF) attacks.
- **Auto-Provisioning**: Decide whether any user from the IdP can access the platform, or if they must be pre-invited. You can restrict access by checking the email domain (e.g., `@yourcompany.com`).
- **Admin Roles**: Map IdP roles/groups to the platform's `is_admin` flag, or manage admin roles manually within the platform's database.
- **Token Storage**: For enhanced security, consider returning the internal JWT in an `HttpOnly` cookie rather than passing it via the URL and storing it in `localStorage`.

## 6. Testing

When testing SSO locally:
- Ensure your IdP allows `http://localhost` or `http://127.0.0.1` as a valid redirect URI.
- If running inside a containerized preview environment (like AI Studio), ensure the exact dynamic URL is registered in the IdP's authorized redirect URIs.
