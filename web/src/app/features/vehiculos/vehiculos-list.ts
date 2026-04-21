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
  VehiculoCreatePayload,
  VehiculoUpdatePayload
} from '../../core/services/vehiculos.service';
import { VehiculosService } from '../../core/services/vehiculos.service';
import type { Vehiculo } from '../../models/api.models';
import {
  VehiculosDialogComponent,
  VehiculosDialogData
} from './vehiculos-dialog';

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
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        titulo: 'Eliminar vehículo',
        mensaje: `¿Desea eliminar ${vehiculo.placa}?`,
        textoConfirmar: 'Eliminar'
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
