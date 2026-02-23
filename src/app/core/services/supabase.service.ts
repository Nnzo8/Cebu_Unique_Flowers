import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    role?: 'admin' | 'user';
  };
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private session$ = new BehaviorSubject<Session | null>(null);
  
  // Table names
  private readonly PRODUCTS_TABLE = 'products';
  private readonly USERS_TABLE = 'users';

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
    this.initializeSession();
  }

  /**
   * Initialize session on service creation
   */
  private async initializeSession(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.session$.next(data.session);

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.session$.next(session);
    });
  }

  /**
   * Get current session observable
   */
  getSession$(): Observable<Session | null> {
    return this.session$.asObservable();
  }

  /**
   * Get current session synchronously (for quick checks)
   */
  getSessionSync(): Session | null {
    return this.session$.getValue();
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { user: null, error };
      }

      return { user: data.user as any, error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { user: null, error };
    }
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      console.log('[SupabaseService] Attempting signIn with email:', email);
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('[SupabaseService] signInWithPassword response - user:', data.user?.email, 'error:', error);

      if (error) {
        console.error('[SupabaseService] Sign in error:', error);
        return { user: null, error };
      }

      console.log('[SupabaseService] Sign in successful for:', data.user?.email);
      return { user: data.user as any, error: null };
    } catch (error) {
      console.error('[SupabaseService] Sign in exception:', error);
      return { user: null, error };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out exception:', error);
      return { error };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const session = this.getSessionSync();
    if (!session) return null;

    return {
      id: session.user.id,
      email: session.user.email || '',
      user_metadata: session.user.user_metadata as any,
    };
  }

  /**
   * Get current user role from the users table
   */
  async getUserRole(): Promise<'admin' | 'user' | null> {
    const session = this.getSessionSync();
    if (!session) return null;

    try {
      // First try to get role from users table (primary source of truth)
      const { data, error } = await this.supabase
        .from(this.USERS_TABLE)
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        console.log('[SupabaseService] Retrieved user role from users table:', data.role);
        return (data.role as 'admin' | 'user') || 'user';
      }

      console.log('[SupabaseService] No users table entry found, checking user_metadata');
      // Fallback to user_metadata if users table doesn't have the entry
      const metadataRole = (session.user.user_metadata?.['role'] as 'admin' | 'user');
      if (metadataRole) {
        console.log('[SupabaseService] Retrieved user role from metadata:', metadataRole);
        return metadataRole;
      }

      console.log('[SupabaseService] No role found, defaulting to user');
      return 'user';
    } catch (error) {
      console.error('[SupabaseService] Error fetching user role:', error);
      // Fallback to metadata on error
      return (session.user.user_metadata?.['role'] as 'admin' | 'user') || 'user';
    }
  }

  /**
   * Fetch all products
   */
  async getProducts(): Promise<{ data: Product[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from(this.PRODUCTS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch products error:', error);
        return { data: null, error };
      }

      return { data: data as Product[], error: null };
    } catch (error) {
      console.error('Fetch products exception:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from(this.PRODUCTS_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Fetch product ${id} error:`, error);
        return { data: null, error };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      console.error(`Fetch product ${id} exception:`, error);
      return { data: null, error };
    }
  }

  /**
   * Create new product (Admin only)
   */
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from(this.PRODUCTS_TABLE)
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Create product error:', error);
        return { data: null, error };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      console.error('Create product exception:', error);
      return { data: null, error };
    }
  }

  /**
   * Update product (Admin only)
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from(this.PRODUCTS_TABLE)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Update product ${id} error:`, error);
        return { data: null, error };
      }

      return { data: data as Product, error: null };
    } catch (error) {
      console.error(`Update product ${id} exception:`, error);
      return { data: null, error };
    }
  }

  /**
   * Delete product (Admin only)
   */
  async deleteProduct(id: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from(this.PRODUCTS_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Delete product ${id} error:`, error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error(`Delete product ${id} exception:`, error);
      return { error };
    }
  }

  /**
   * Subscribe to real-time product changes
   * Note: For real-time updates, ensure your Supabase tables have proper RLS policies
   */
  subscribeToProducts(callback: (products: Product[]) => void): () => void {
    // Subscribe to changes using Supabase realtime channel
    const channel = this.supabase
      .channel(`public:${this.PRODUCTS_TABLE}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.PRODUCTS_TABLE },
        () => {
          // Refetch products on any change
          this.getProducts().then(({ data }) => {
            if (data) callback(data);
          });
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      this.supabase.removeChannel(channel);
    };
  }
}
