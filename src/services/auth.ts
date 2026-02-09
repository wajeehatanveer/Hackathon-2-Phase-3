// frontend/src/services/auth.ts

// Function to get the auth token from localStorage
export const getAuthCookie = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('better-auth-session-token');
    return token;
  }
  return null;
};

// Function to set the auth token
export const setAuthCookie = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('better-auth-session-token', token);
  }
};

// Function to remove the auth token
export const removeAuthCookie = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('better-auth-session-token');
    // Also clear stored current user when removing auth
    localStorage.removeItem('better-auth-current-user');
  }
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthCookie();
  return !!token;
};

// Return the current user info saved in localStorage (if any)
export const getCurrentUser = (): { email?: string; name?: string } | null => {
  if (typeof window !== 'undefined') {
    const s = localStorage.getItem('better-auth-current-user');
    return s ? JSON.parse(s) : null;
  }
  return null;
};

// Helper to determine backend base URL (strip /api if included)
const AUTH_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/api$/, '') as string;

// Login function that calls the backend dev auth endpoint
export const login = async (email: string, password: string): Promise<{ access_token: string; token_type: string; user_id: string }> => {
  // For now use email as user_id in dev mode
  const payload = { user_id: email };

  const res = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText || 'Login failed');
  }

  const data = await res.json();
  setAuthCookie(data.access_token);
  // Store a small current user object to show in the UI
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('better-auth-current-user', JSON.stringify({ email: data.user_id }));
    } catch (e) {
      // ignore storage errors
    }
  }
  return data;
};

// Signup function: for dev, call login endpoint directly (replace with real signup later)
export const signup = async (email: string, password: string, name: string): Promise<{ access_token: string; token_type: string; user_id: string }> => {
  // In production, call a proper signup endpoint. For dev, just request a token for the user.
  const data = await login(email, password);
  // store provided name alongside email for display
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('better-auth-current-user', JSON.stringify({ email: data.user_id, name }));
    } catch (e) {
      // ignore
    }
  }
  return data;
};

// Logout function
export const logout = (): void => {
  removeAuthCookie();
};
