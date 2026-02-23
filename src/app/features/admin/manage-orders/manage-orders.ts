import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../../../shared/components/admin-navbar.component/admin-navbar.component';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageOrders {

}
