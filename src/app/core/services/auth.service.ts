import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  /**
   * Signal to track the current authentication state.
   * Synced with Supabase session state.
   */
  readonly isLoggedIn = signal(false);

  /**
   * Signal to store the current user's information (email, role, etc).
   * Populated from Supabase user metadata.
   */
  readonly currentUser = signal<{ email?: string; role?: 'admin' | 'user' } | null>(null);

  /**
   * Computed signal to check if user is admin
   */
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'admin';
  });

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from Supabase session.
   * Subscribes to auth state changes automatically.
   */
  private initializeAuth(): void {
    // Listen to Supabase session changes
    this.supabaseService.getSession$().subscribe(async (session) => {
      if (session) {
        // User is logged in
        const user = await this.supabaseService.getCurrentUser();
        if (user) {
          this.currentUser.set({
            email: user.email,
            role: user.user_metadata?.role || 'user',
          });
          this.isLoggedIn.set(true);
        }
      } else {
        // User is logged out
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
      }
    });
  }

  /**
   * Login a user with email and password via Supabase Auth
   * @param email User email
   * @param password User password
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[AuthService] Starting login. Calling supabaseService.signIn...');
      const { user, error } = await this.supabaseService.signIn(email, password);
      console.log('[AuthService] signIn returned. user:', user, 'error:', error);

      if (error) {
        console.error('[AuthService] Login error from Supabase:', error);
        return { success: false, error: error.message };
      }

      if (user) {
        console.log('[AuthService] User authenticated:', user.email);
        const role = await this.supabaseService.getUserRole();
        console.log('[AuthService] Retrieved user role:', role);
        
        this.currentUser.set({
          email: user.email,
          role: role || 'user',
        });
        this.isLoggedIn.set(true);
        console.log('[AuthService] Updated currentUser signal:', this.currentUser());
        return { success: true };
      }

      console.log('[AuthService] No user returned from signIn');
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('[AuthService] Login exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a new user via Supabase Auth
   * @param email User email
   * @param password User password
   * @param isAdmin Whether the user is an admin (default: false)
   */
  async register(email: string, password: string, isAdmin: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const role = isAdmin ? 'admin' : 'user';
      const { user, error } = await this.supabaseService.signUp(email, password, role);

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
      }

      if (user) {
        this.currentUser.set({
          email: user.email,
          role: role,
        });
        this.isLoggedIn.set(true);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout the current user via Supabase Auth
   */
  async logout(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      this.currentUser.set(null);
      this.isLoggedIn.set(false);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
