import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin Route Guard
 * Protects admin routes by checking:
 * 1. User is authenticated (isLoggedIn signal is true)
 * 2. User has 'admin' role
 *
 * If either check fails, redirects to /auth/login
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    console.warn('[AdminGuard] Access denied: User not authenticated');
    router.navigate(['/auth/login']);
    return false;
  }

  // Get current user
  const user = authService.currentUser();

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    console.warn('[AdminGuard] Access denied: User is not an admin');
    router.navigate(['/auth/login']);
    return false;
  }

  // User is authenticated and has admin role - allow access
  console.log('[AdminGuard] Access granted: User is admin');
  return true;
};
