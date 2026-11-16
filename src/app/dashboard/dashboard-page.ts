import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = this.auth.currentUser();

  async signOut(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
