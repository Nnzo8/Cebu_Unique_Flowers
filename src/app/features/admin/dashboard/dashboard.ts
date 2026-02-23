import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminNavbarComponent } from '../../../shared/components/admin-navbar.component/admin-navbar.component';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
}

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  // UI State
  readonly userName = signal('Admin');

  // Stats Cards Data
  readonly statsCards: StatCard[] = [
    
  ];

  // Recent Orders Data
  readonly recentOrders: Order[] = [

  ];

  constructor() {
    this.setUserName();
  }

  /**
   * Extract user name from auth service
   */
  private setUserName(): void {
    const user = this.authService.currentUser();
    if (user?.email) {
      const name = user.email.split('@')[0];
      this.userName.set(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }

  /**
   * Get badge color based on order status
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get badge label (capitalize first letter)
   */
  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
