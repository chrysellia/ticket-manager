export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

const API_BASE = '/api';

export const AuthService = {
  async login(email: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.error || 'Login failed');
    }
    return res.json();
  },

  async me(): Promise<AuthUser | null> {
    const res = await fetch(`${API_BASE}/me`, {
      credentials: 'include',
    });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  async logout(): Promise<void> {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Logout failed');
  },
};

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}
