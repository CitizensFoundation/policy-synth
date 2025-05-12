import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number;
  email: string;
  role: 'admin' | 'editor';
  exp: number;
}

// Removed @reactive decorator - plain class for state management
class AuthStore {
  token: string | null = localStorage.getItem('authToken');
  user: DecodedToken | null = this.decodeToken(this.token);
  expiresAt: Date | null = this.getExpiryDate(this.user);
  // Add a simple observable property for Lit components
  updateCounter = 0;

  isLoggedIn(): boolean {
    // Check expiry explicitly
    const expired = this.expiresAt ? this.expiresAt <= new Date() : true;
    if (expired && this.token) {
        // If token exists but is expired, clear it
        this.logout();
        return false;
    }
    return !!this.token && !!this.user;
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.user?.role === 'admin';
  }

  getToken(): string | null {
    // Re-check login status which handles expiry
    if (this.isLoggedIn()) {
        return this.token;
    }
    return null;
  }

  setLoginInfo(token: string): void {
    const decoded = this.decodeToken(token);
    if (decoded) {
      this.token = token;
      this.user = decoded;
      this.expiresAt = this.getExpiryDate(decoded);
      localStorage.setItem('authToken', token);
      console.log('AuthStore: User logged in', this.user);
      this.notifyChanges(); // Notify Lit components
    } else {
      console.error('AuthStore: Failed to decode token');
      this.logout();
    }
  }

  logout(): void {
    console.log('AuthStore: Logging out');
    const changed = !!this.token;
    this.token = null;
    this.user = null;
    this.expiresAt = null;
    localStorage.removeItem('authToken');
    if (changed) {
        this.notifyChanges(); // Notify Lit components
    }
    // Optionally, redirect using window.location or router
    // Example: window.location.href = '/admin/login';
  }

  private decodeToken(token: string | null): DecodedToken | null {
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded && decoded.exp && decoded.id && decoded.email && decoded.role) {
         // Check expiry during decode as well
         const expiryDate = new Date(0);
         expiryDate.setUTCSeconds(decoded.exp);
         if (expiryDate <= new Date()) {
             console.warn('AuthStore: Attempted to decode expired token.');
             return null;
         }
        return decoded;
      }
      return null;
    } catch (error) {
      console.error('AuthStore: Error decoding token:', error);
      return null;
    }
  }

  private getExpiryDate(user: DecodedToken | null): Date | null {
    if (!user || !user.exp) return null;
    const expiryDate = new Date(0);
    expiryDate.setUTCSeconds(user.exp);
    return expiryDate;
  }

  // Method to notify Lit components of changes
  notifyChanges() {
    this.updateCounter++;
  }
}

export const authStoreInstance = new AuthStore();