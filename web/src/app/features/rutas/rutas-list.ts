import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { AuditContextService } from '../../core/audit-context.service';
import type { Ruta } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import type {
  RutaCreatePayload,
  RutaUpdatePayload
} from '../../core/services/rutas.service';
import { RutasService } from '../../core/services/rutas.service';
import {
  RutasDialogComponent,
  RutasDialogData
} from './rutas-dialog';

interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-simple-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close="false" type="button">Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true" type="button">Eliminar</button>
    </mat-dialog-actions>
  `
})
export class SimpleConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

type RutaFilterMode = 'todas' | 'activas';

@Component({
  selector: 'app-rutas-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonToggleModule
  ],
  templateUrl: './rutas-list.html',
  styleUrl: './rutas-list.scss'
})
export class RutasListComponent {
  private readonly rutasService = inject(RutasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly loading = signal(false);
  readonly rutas = signal<Ruta[]>([]);
  readonly displayedColumns = ['id', 'codigo', 'nombre', 'activo', 'acciones'];
  readonly filterMode = signal<RutaFilterMode>('todas');

  constructor() {
    this.fetchRutas();
  }

  asShortId(id: string): string {
    return shortId(id);
  }

  setFilterMode(mode: RutaFilterMode): void {
    this.filterMode.set(mode);
    this.fetchRutas();
  }

  openCreate(): void {
    const ref = this.dialog.open(RutasDialogComponent, {
      width: '440px',
      data: { mode: 'create' } as RutasDialogData
    });

    ref.afterClosed().subscribe((raw?: Omit<RutaCreatePayload, 'id_usuario_creacion'>) => {
      if (!raw) {
        return;
      }

      const auditId = this.audit.getAuditUserId();
      if (!auditId) {
        this.snackBar.open('Sesión inválida. Inicie sesión de nuevo.', 'Cerrar', { duration: 5000 });
        return;
      }

      const payload: RutaCreatePayload = {
        ...raw,
        id_usuario_creacion: auditId
      };

      this.rutasService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Ruta creada.', 'Cerrar', { duration: 3000 });
          this.fetchRutas();
        },
        error: () => this.snackBar.open('No se pudo crear la ruta.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  openEdit(ruta: Ruta): void {
    const ref = this.dialog.open(RutasDialogComponent, {
      width: '440px',
      data: { mode: 'edit', ruta } as RutasDialogData
    });

    ref.afterClosed().subscribe((raw?: Omit<RutaUpdatePayload, 'id_usuario_edita'>) => {
      if (!raw) {
        return;
      }

      const auditId = this.audit.getAuditUserId();
      if (!auditId) {
        this.snackBar.open('Sesión inválida. Inicie sesión de nuevo.', 'Cerrar', { duration: 5000 });
        return;
      }

      const payload: RutaUpdatePayload = {
        ...raw,
        id_usuario_edita: auditId
      };

      this.rutasService.update(ruta.id_ruta, payload).subscribe({
        next: () => {
          this.snackBar.open('Ruta actualizada.', 'Cerrar', { duration: 3000 });
          this.fetchRutas();
        },
        error: () => this.snackBar.open('No se pudo actualizar la ruta.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  confirmDelete(ruta: Ruta): void {
    const ref = this.dialog.open(SimpleConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Eliminar ruta',
        message: `¿Desea eliminar la ruta ${ruta.codigo}?`
      } satisfies ConfirmDialogData
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.rutasService.delete(ruta.id_ruta).subscribe({
        next: () => {
          this.snackBar.open('Ruta eliminada.', 'Cerrar', { duration: 3000 });
          this.fetchRutas();
        },
        error: () => this.snackBar.open('No se pudo eliminar la ruta.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  private fetchRutas(): void {
    this.loading.set(true);
    const mode = this.filterMode();
    const obs = mode === 'activas' ? this.rutasService.listActivas() : this.rutasService.list();

    obs.subscribe({
      next: (rows) => {
        this.rutas.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar rutas.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
