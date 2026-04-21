import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { shortId } from '../../shared/ids';
import type { ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import type {
  EstacionCreatePayload,
  EstacionUpdatePayload
} from '../../core/services/estaciones.service';
import { EstacionesService } from '../../core/services/estaciones.service';
import type { Estacion } from '../../models/api.models';
import {
  EstacionesDialogComponent,
  EstacionesDialogData
} from './estaciones-dialog';

@Component({
  selector: 'app-estaciones-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './estaciones-list.html',
  styleUrl: './estaciones-list.scss'
})
export class EstacionesListComponent {
  private readonly estacionesService = inject(EstacionesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly estaciones = signal<Estacion[]>([]);
  readonly displayedColumns = ['id', 'nombre', 'direccion', 'acciones'];

  constructor() {
    this.fetchEstaciones();
  }

  asShortId(id: string): string {
    return shortId(id);
  }

  openCreate(): void {
    const ref = this.dialog.open(EstacionesDialogComponent, {
      width: '420px',
      data: { mode: 'create' } as EstacionesDialogData
    });

    ref.afterClosed().subscribe((payload?: EstacionCreatePayload) => {
      if (!payload) {
        return;
      }
      this.estacionesService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Estación creada.', 'Cerrar', { duration: 3000 });
          this.fetchEstaciones();
        },
        error: () => this.snackBar.open('No se pudo crear la estación.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  openEdit(estacion: Estacion): void {
    const ref = this.dialog.open(EstacionesDialogComponent, {
      width: '420px',
      data: { mode: 'edit', estacion } as EstacionesDialogData
    });

    ref.afterClosed().subscribe((payload?: EstacionUpdatePayload) => {
      if (!payload) {
        return;
      }
      this.estacionesService.update(estacion.id_estacion, payload).subscribe({
        next: () => {
          this.snackBar.open('Estación actualizada.', 'Cerrar', { duration: 3000 });
          this.fetchEstaciones();
        },
        error: () => this.snackBar.open('No se pudo actualizar la estación.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  confirmDelete(estacion: Estacion): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        titulo: 'Eliminar estación',
        mensaje: `¿Desea eliminar ${estacion.nombre}?`,
        textoConfirmar: 'Eliminar'
      } satisfies ConfirmDialogData
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.estacionesService.delete(estacion.id_estacion).subscribe({
        next: () => {
          this.snackBar.open('Estación eliminada.', 'Cerrar', { duration: 3000 });
          this.fetchEstaciones();
        },
        error: () => this.snackBar.open('No se pudo eliminar la estación.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  private fetchEstaciones(): void {
    this.loading.set(true);
    this.estacionesService.list().subscribe({
      next: (rows) => {
        this.estaciones.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar estaciones.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
