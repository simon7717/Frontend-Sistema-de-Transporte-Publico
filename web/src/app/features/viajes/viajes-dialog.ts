import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

import { EstacionesService } from '../../core/services/estaciones.service';
import { RutasService } from '../../core/services/rutas.service';
import { VehiculosService } from '../../core/services/vehiculos.service';
import type { Estacion, Ruta, Vehiculo, Viaje } from '../../models/api.models';
import type {
  ViajeCreatePayload,
  ViajeUpdatePayload
} from '../../core/services/viajes.service';

export interface ViajesDialogData {
  mode: 'create' | 'edit';
  viaje?: Viaje;
}

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string {
  // value: "YYYY-MM-DDTHH:mm"
  const d = new Date(value);
  return d.toISOString();
}

@Component({
  selector: 'app-viajes-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './viajes-dialog.html'
})
export class ViajesDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ViajesDialogComponent>);
  private readonly rutasService = inject(RutasService);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly estacionesService = inject(EstacionesService);

  readonly data = inject<ViajesDialogData>(MAT_DIALOG_DATA);

  rutas: Ruta[] = [];
  vehiculos: Vehiculo[] = [];
  estaciones: Estacion[] = [];

  readonly form = this.fb.nonNullable.group({
    id_ruta: [this.data.viaje?.id_ruta ?? '', Validators.required],
    id_vehiculo: [this.data.viaje?.id_vehiculo ?? '', Validators.required],
    id_estacion_origen: [
      this.data.viaje?.id_estacion_origen ?? '',
      Validators.required
    ],
    id_estacion_destino: [
      this.data.viaje?.id_estacion_destino ?? '',
      Validators.required
    ],
    fecha_hora_salida: [
      toDatetimeLocal(this.data.viaje?.fecha_hora_salida),
      Validators.required
    ]
  });

  constructor() {
    forkJoin({
      rutas: this.rutasService.list(),
      vehiculos: this.vehiculosService.list(),
      estaciones: this.estacionesService.list()
    }).subscribe({
      next: ({ rutas, vehiculos, estaciones }) => {
        this.rutas = rutas;
        this.vehiculos = vehiculos;
        this.estaciones = estaciones;
      },
      error: () => {
        this.rutas = [];
        this.vehiculos = [];
        this.estaciones = [];
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const base = {
      id_ruta: raw.id_ruta,
      id_vehiculo: raw.id_vehiculo,
      id_estacion_origen: raw.id_estacion_origen,
      id_estacion_destino: raw.id_estacion_destino,
      fecha_hora_salida: fromDatetimeLocal(raw.fecha_hora_salida)
    };

    if (this.data.mode === 'create') {
      const payload: Omit<ViajeCreatePayload, 'id_usuario_creacion'> = base;
      this.dialogRef.close(payload);
      return;
    }

    const payload: Omit<ViajeUpdatePayload, 'id_usuario_edita'> = base;
    this.dialogRef.close(payload);
  }
}

