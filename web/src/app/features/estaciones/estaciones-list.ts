import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { shortId } from '../../shared/ids';
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
    const ref = this.dialog.open(SimpleConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Eliminar estación',
        message: `¿Desea eliminar ${estacion.nombre}?`
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
