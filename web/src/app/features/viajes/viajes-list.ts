import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { AuditContextService } from '../../core/audit-context.service';
import { EstacionesService } from '../../core/services/estaciones.service';
import { RutasService } from '../../core/services/rutas.service';
import { VehiculosService } from '../../core/services/vehiculos.service';
import type { Estacion, Ruta, Vehiculo, Viaje } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import type { ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import type {
  ViajeCreatePayload,
  ViajeUpdatePayload
} from '../../core/services/viajes.service';
import { ViajesService } from '../../core/services/viajes.service';
import {
  ViajesDialogComponent,
  ViajesDialogData
} from './viajes-dialog';

function formatFechaHora(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

@Component({
  selector: 'app-viajes-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './viajes-list.html',
  styleUrl: './viajes-list.scss'
})
export class ViajesListComponent implements OnInit {
  private readonly viajesService = inject(ViajesService);
  private readonly rutasService = inject(RutasService);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly estacionesService = inject(EstacionesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly loading = signal(false);
  readonly viajes = signal<Viaje[]>([]);
  readonly displayedColumns = [
    'id',
    'ruta',
    'vehiculo',
    'origen',
    'destino',
    'fecha',
    'acciones'
  ];

  readonly rutas = signal<Ruta[]>([]);
  readonly selectedRutaId = signal<string>('');

  private rutaMap = new Map<string, string>();
  private vehiculoMap = new Map<string, string>();
  private estacionMap = new Map<string, string>();

  ngOnInit(): void {
    this.loading.set(true);
    this.rutasService.list().subscribe({
      next: (rutas) => {
        this.rutas.set(rutas);
        this.rutaMap = new Map(rutas.map((r) => [r.id_ruta, r.codigo]));
        this.maybeFinishInitLoading();
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar rutas.', 'Cerrar', { duration: 5000 });
      }
    });

    this.vehiculosService.list().subscribe({
      next: (vehiculos) => {
        this.vehiculoMap = new Map(vehiculos.map((v) => [v.id_vehiculo, v.placa]));
        this.maybeFinishInitLoading();
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar vehículos.', 'Cerrar', { duration: 5000 });
      }
    });

    this.estacionesService.list().subscribe({
      next: (estaciones) => {
        this.estacionMap = new Map(estaciones.map((e) => [e.id_estacion, e.nombre]));
        this.maybeFinishInitLoading();
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar estaciones.', 'Cerrar', { duration: 5000 });
      }
    });

    this.fetchViajes();
  }

  asShortId(id: string): string {
    return shortId(id);
  }

  rutaLabel(id_ruta: string): string {
    return this.rutaMap.get(id_ruta) ?? shortId(id_ruta);
  }

  vehiculoLabel(id_vehiculo: string): string {
    return this.vehiculoMap.get(id_vehiculo) ?? shortId(id_vehiculo);
  }

  estacionLabel(id_estacion: string): string {
    return this.estacionMap.get(id_estacion) ?? shortId(id_estacion);
  }

  fechaLabel(value: string): string {
    return formatFechaHora(value);
  }

  onRutaFilterChange(id_ruta: string): void {
    this.selectedRutaId.set(id_ruta);
    this.fetchViajes();
  }

  openCreate(): void {
    const ref = this.dialog.open(ViajesDialogComponent, {
      width: '520px',
      data: { mode: 'create' } as ViajesDialogData
    });

    ref.afterClosed().subscribe(
      (raw?: Omit<ViajeCreatePayload, 'id_usuario_creacion'>) => {
        if (!raw) return;

        const auditId = this.audit.getAuditUserId();
        if (!auditId) {
          this.snackBar.open('Sesión inválida. Inicie sesión de nuevo.', 'Cerrar', {
            duration: 5000
          });
          return;
        }

        const payload: ViajeCreatePayload = { ...raw, id_usuario_creacion: auditId };
        this.viajesService.create(payload).subscribe({
          next: () => {
            this.snackBar.open('Viaje creado.', 'Cerrar', { duration: 3000 });
            this.fetchViajes();
          },
          error: () =>
            this.snackBar.open('No se pudo crear el viaje.', 'Cerrar', {
              duration: 5000
            })
        });
      }
    );
  }

  openEdit(viaje: Viaje): void {
    const ref = this.dialog.open(ViajesDialogComponent, {
      width: '520px',
      data: { mode: 'edit', viaje } as ViajesDialogData
    });

    ref.afterClosed().subscribe(
      (raw?: Omit<ViajeUpdatePayload, 'id_usuario_edita'>) => {
        if (!raw) return;

        const auditId = this.audit.getAuditUserId();
        if (!auditId) {
          this.snackBar.open('Sesión inválida. Inicie sesión de nuevo.', 'Cerrar', {
            duration: 5000
          });
          return;
        }

        const payload: ViajeUpdatePayload = { ...raw, id_usuario_edita: auditId };
        this.viajesService.update(viaje.id_viaje, payload).subscribe({
          next: () => {
            this.snackBar.open('Viaje actualizado.', 'Cerrar', { duration: 3000 });
            this.fetchViajes();
          },
          error: () =>
            this.snackBar.open('No se pudo actualizar el viaje.', 'Cerrar', {
              duration: 5000
            })
        });
      }
    );
  }

  confirmDelete(viaje: Viaje): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        titulo: 'Eliminar viaje',
        mensaje: `¿Desea eliminar el viaje ${shortId(viaje.id_viaje)}?`,
        textoConfirmar: 'Eliminar'
      } satisfies ConfirmDialogData
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.viajesService.delete(viaje.id_viaje).subscribe({
        next: () => {
          this.snackBar.open('Viaje eliminado.', 'Cerrar', { duration: 3000 });
          this.fetchViajes();
        },
        error: () =>
          this.snackBar.open('No se pudo eliminar el viaje.', 'Cerrar', {
            duration: 5000
          })
      });
    });
  }

  private fetchViajes(): void {
    this.loading.set(true);
    const rutaId = this.selectedRutaId();
    const obs = rutaId ? this.viajesService.listByRuta(rutaId) : this.viajesService.list();
    obs.subscribe({
      next: (rows) => {
        this.viajes.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar viajes.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  private pendingInitParts = 3;
  private maybeFinishInitLoading(): void {
    this.pendingInitParts = Math.max(0, this.pendingInitParts - 1);
    if (this.pendingInitParts === 0) {
      // keep loading spinner controlled by fetchViajes()
    }
  }
}

