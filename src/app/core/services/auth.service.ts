import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Signal to track the current authentication state.
   * Can be updated when Firebase authentication is integrated.
   */
  readonly isLoggedIn = signal(false);

  /**
   * Signal to store the current user's email or information.
   * Will be populated with Firebase user data in the future.
   */
  readonly currentUser = signal<{ email?: string } | null>(null);

  constructor(private router: Router) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from local storage or session.
   * This will be replaced with Firebase persistence in the future.
   */
  private initializeAuth(): void {
    // TODO: Implement Firebase auth state persistence
    // For now, check local storage for demo purposes
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } catch {
        // Invalid stored user data
        this.clearAuth();
      }
    }
  }

  /**
   * Login a user. This is a placeholder for Firebase authentication.
   * 
   * @param email User email
   * @param password User password
   */
  login(email: string, password: string): Promise<void> {
    // TODO: Replace with Firebase authentication
    console.log('Logging in with:', email);
    
    // Temporary: Store user in local storage for demo
    const user = { email };
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    
    return Promise.resolve();
  }

  /**
   * Register a new user. This is a placeholder for Firebase authentication.
   * 
   * @param fullName User's full name
   * @param email User email
   * @param password User password
   */
  register(fullName: string, email: string, password: string): Promise<void> {
    // TODO: Replace with Firebase authentication
    console.log('Registering user:', fullName, email);
    
    // Temporary: Store user in local storage for demo
    const user = { email };
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    
    return Promise.resolve();
  }

  /**
   * Logout the current user and clear authentication state.
   */
  logout(): Promise<void> {
    console.log('User logged out');
    this.clearAuth();
    this.router.navigate(['/auth/login']);
    return Promise.resolve();
  }

  /**
   * Clear authentication state and local storage.
   */
  private clearAuth(): void {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  /**
   * Get the current authenticated user (if any).
   */
  getCurrentUser() {
    return this.currentUser();
  }
}
