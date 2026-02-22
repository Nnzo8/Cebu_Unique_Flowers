import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sticky]': 'true',
    '[class.top-0]': 'true',
    '[class.z-50]': 'true',
    '[class.w-full]': 'true',
  },
})
export class NavbarComponent {
  // Inject AuthService and Router
  private authService = inject(AuthService);
  private router = inject(Router);

  // State
  readonly isMenuOpen = signal(false);
  readonly isScrolling = signal(false);

  // Navigation links
  readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Custom Arrangements', path: '/custom' },
    { label: 'Contact', path: '/contact' },
  ];

  // Computed state for derived UI logic
  readonly menuIcon = computed(() => (this.isMenuOpen() ? '✕' : '☰'));
  readonly cartItemCount = computed(() => 0); // Placeholder - will be replaced by cart service signal
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly isAuthPage = computed(() => this.router.url.includes('/auth'));
  readonly shouldShowAuthButtons = computed(() => !this.isAuthPage());

  constructor() {
    this.setupScrollListener();
  }

  /**
   * Toggle mobile menu state
   */
  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  /**
   * Close menu when a link is clicked
   */
  onNavLinkClick(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * Handle user logout by calling the auth service.
   */
  logout(): void {
    this.authService.logout();
    this.isMenuOpen.set(false);
  }
  
  /**
   * Setup scroll listener for navbar styling
   */
  private setupScrollListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 0;
        if (isScrolled !== this.isScrolling()) {
          this.isScrolling.set(isScrolled);
        }
      });
    }
  }
}
