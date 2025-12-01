const AUTH_API_URL = 'https://functions.poehali.dev/d0d8a117-25d4-4bae-9e4d-c6192bbe7497';
const USERS_API_URL = 'https://functions.poehali.dev/aa434c46-4b09-4a1f-a196-d854bed8176c';
const ACCESS_GROUPS_API_URL = 'https://functions.poehali.dev/a2c227f5-7853-45de-837a-b5b92bf15a1d';
const AUDIT_API_URL = 'https://functions.poehali.dev/8698496d-ca4c-4393-a952-ada40d9a22d9';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role_id: number;
  role_name: string;
  is_blocked?: boolean;
}

export interface AuthResponse {
  success: boolean;
  session_token: string;
  user: User;
  permissions: string[];
}

export interface ValidationResponse {
  valid: boolean;
  user: User;
  permissions: string[];
}

class AuthService {
  private sessionToken: string | null = null;
  private currentUser: User | null = null;
  private permissions: string[] = [];

  constructor() {
    this.sessionToken = localStorage.getItem('session_token');
    const userStr = localStorage.getItem('current_user');
    const permsStr = localStorage.getItem('permissions');
    
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        this.currentUser = null;
      }
    }
    
    if (permsStr) {
      try {
        this.permissions = JSON.parse(permsStr);
      } catch (e) {
        this.permissions = [];
      }
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        username,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    this.sessionToken = data.session_token;
    this.currentUser = data.user;
    this.permissions = data.permissions;
    
    localStorage.setItem('session_token', data.session_token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
    
    return data;
  }

  async logout(): Promise<void> {
    if (this.sessionToken) {
      try {
        await fetch(AUTH_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': this.sessionToken,
          },
          body: JSON.stringify({
            action: 'logout',
          }),
        });
      } catch (e) {
        console.error('Logout request failed:', e);
      }
    }
    
    this.sessionToken = null;
    this.currentUser = null;
    this.permissions = [];
    
    localStorage.removeItem('session_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('permissions');
  }

  async validateSession(): Promise<boolean> {
    console.log('[AUTH] validateSession called, token:', this.sessionToken?.substring(0, 20));
    
    if (!this.sessionToken) {
      console.log('[AUTH] No session token, returning false');
      return false;
    }

    try {
      console.log('[AUTH] Sending validation request...');
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': this.sessionToken,
        },
        body: JSON.stringify({
          action: 'validate',
        }),
      });

      console.log('[AUTH] Validation response status:', response.status);

      if (!response.ok) {
        console.log('[AUTH] Validation failed, logging out');
        this.logout();
        return false;
      }

      const data: ValidationResponse = await response.json();
      
      if (data.valid) {
        this.currentUser = data.user;
        this.permissions = data.permissions;
        localStorage.setItem('current_user', JSON.stringify(data.user));
        localStorage.setItem('permissions', JSON.stringify(data.permissions));
        return true;
      }
      
      this.logout();
      return false;
    } catch (e) {
      console.error('Session validation failed:', e);
      this.logout();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.sessionToken !== null && this.currentUser !== null;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  getUserId(): number | null {
    return this.currentUser?.id || null;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  hasPermission(permissionCode: string): boolean {
    return this.permissions.includes(permissionCode);
  }

  hasAnyPermission(permissionCodes: string[]): boolean {
    return permissionCodes.some(code => this.permissions.includes(code));
  }

  hasAllPermissions(permissionCodes: string[]): boolean {
    return permissionCodes.every(code => this.permissions.includes(code));
  }

  getPermissions(): string[] {
    return [...this.permissions];
  }
}

export const authService = new AuthService();
export { AUTH_API_URL, USERS_API_URL, ACCESS_GROUPS_API_URL, AUDIT_API_URL };