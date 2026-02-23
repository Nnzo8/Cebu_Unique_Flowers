import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { routes } from './app.routes';

// Application-wide configuration including HTTP setup and routing
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable browser global error listeners for debugging
    provideBrowserGlobalErrorListeners(),
    
    // Enable routing throughout the application
    provideRouter(routes),
    
    // Configure HttpClient with interceptors
    // Interceptors are middleware that runs on every HTTP request/response
    provideHttpClient(
      // Apply auth interceptor to automatically inject Bearer token on protected routes
      withInterceptors([authInterceptor])
    ),
  ]
};
