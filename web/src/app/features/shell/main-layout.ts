import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuditContextService } from '../../core/audit-context.service';
import { environment } from '../../../environments/environment';
import type { Usuario } from '../../models/api.models';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar';

const SIDEBAR_KEY = 'shell_sidebar_collapsed';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LoadingBarComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly audit = inject(AuditContextService);
  private readonly router = inject(Router);

  readonly collapsed = signal(this.readCollapsedFromStorage());
  readonly nombreUsuario = signal<string>('');

  ngOnInit(): void {
    const id = this.audit.getAuditUserId();
    if (!id) {
      return;
    }
    this.http.get<Usuario>(`${environment.apiUrl}/usuarios/${id}`).subscribe({
      next: (u) => this.nombreUsuario.set(u.nombre_usuario),
      error: () => this.nombreUsuario.set('Usuario')
    });
  }

  toggleSidebar(): void {
    this.collapsed.update((c) => !c);
    localStorage.setItem(SIDEBAR_KEY, String(this.collapsed()));
  }

  logout(): void {
    localStorage.clear();
    void this.router.navigate(['/login']);
  }

  private readCollapsedFromStorage(): boolean {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  }
}
