import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment'; // <-- Don't forget this import!

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the current token from Supabase session (if user is logged in)
  const currentUser = authService.currentUser();
  let activeToken = environment.supabase.anonKey; // Default to public key

  // If user is logged in, use the anon key (Supabase will use the session token automatically)
  // Note: Supabase client automatically handles JWT token in Authorization header

  // Clone the request and add required Supabase headers
  const authenticatedReq = req.clone({
    setHeaders: {
      apikey: environment.supabase.anonKey,       // This MUST ALWAYS be the public anon key
      Authorization: `Bearer ${activeToken}`, // Use anon key for auth header
    },
  });

  // 4. Pass the modified request to the next handler
  return next(authenticatedReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        console.error('[AuthInterceptor] Unauthorized: Invalid or expired token');
        authService.logout();
      } else if (error.status === 403) {
        console.error('[AuthInterceptor] Forbidden: User lacks permission');
        // You might not want to log them out for a 403, just block the action, 
        // but keeping your logout logic here is fine for now!
        authService.logout(); 
      }
      
      return throwError(() => error);
    })
  );
};