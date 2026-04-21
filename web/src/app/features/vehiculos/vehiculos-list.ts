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
  VehiculoCreatePayload,
  VehiculoUpdatePayload
} from '../../core/services/vehiculos.service';
import { VehiculosService } from '../../core/services/vehiculos.service';
import type { Vehiculo } from '../../models/api.models';
import {
  VehiculosDialogComponent,
  VehiculosDialogData
} from './vehiculos-dialog';

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
  selector: 'app-vehiculos-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vehiculos-list.html',
  styleUrl: './vehiculos-list.scss'
})
export class VehiculosListComponent {
  private readonly vehiculosService = inject(VehiculosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly displayedColumns = ['id', 'placa', 'modelo', 'capacidad', 'acciones'];

  constructor() {
    this.fetchVehiculos();
  }

  asShortId(id: string): string {
    return shortId(id);
  }

  openCreate(): void {
    const ref = this.dialog.open(VehiculosDialogComponent, {
      width: '420px',
      data: { mode: 'create' } as VehiculosDialogData
    });

    ref.afterClosed().subscribe((payload?: VehiculoCreatePayload) => {
      if (!payload) {
        return;
      }
      this.vehiculosService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Vehículo creado.', 'Cerrar', { duration: 3000 });
          this.fetchVehiculos();
        },
        error: () => this.snackBar.open('No se pudo crear el vehículo.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  openEdit(vehiculo: Vehiculo): void {
    const ref = this.dialog.open(VehiculosDialogComponent, {
      width: '420px',
      data: { mode: 'edit', vehiculo } as VehiculosDialogData
    });

    ref.afterClosed().subscribe((payload?: VehiculoUpdatePayload) => {
      if (!payload) {
        return;
      }
      this.vehiculosService.update(vehiculo.id_vehiculo, payload).subscribe({
        next: () => {
          this.snackBar.open('Vehículo actualizado.', 'Cerrar', { duration: 3000 });
          this.fetchVehiculos();
        },
        error: () => this.snackBar.open('No se pudo actualizar el vehículo.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  confirmDelete(vehiculo: Vehiculo): void {
    const ref = this.dialog.open(SimpleConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Eliminar vehículo',
        message: `¿Desea eliminar ${vehiculo.placa}?`
      } satisfies ConfirmDialogData
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.vehiculosService.delete(vehiculo.id_vehiculo).subscribe({
        next: () => {
          this.snackBar.open('Vehículo eliminado.', 'Cerrar', { duration: 3000 });
          this.fetchVehiculos();
        },
        error: () => this.snackBar.open('No se pudo eliminar el vehículo.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  private fetchVehiculos(): void {
    this.loading.set(true);
    this.vehiculosService.list().subscribe({
      next: (rows) => {
        this.vehiculos.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar vehículos.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
