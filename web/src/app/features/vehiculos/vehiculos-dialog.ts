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

import type {
  VehiculoCreatePayload,
  VehiculoUpdatePayload
} from '../../core/services/vehiculos.service';
import type { Vehiculo } from '../../models/api.models';

export interface VehiculosDialogData {
  mode: 'create' | 'edit';
  vehiculo?: Vehiculo;
}

@Component({
  selector: 'app-vehiculos-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './vehiculos-dialog.html'
})
export class VehiculosDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VehiculosDialogComponent>);
  readonly data = inject<VehiculosDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    placa: [this.data.vehiculo?.placa ?? '', Validators.required],
    modelo: [this.data.vehiculo?.modelo ?? ''],
    capacidad: [this.data.vehiculo?.capacidad ?? null as number | null]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: VehiculoCreatePayload | VehiculoUpdatePayload = {
      placa: raw.placa.trim(),
      modelo: raw.modelo?.trim() || null,
      capacidad: raw.capacidad === null ? null : Number(raw.capacidad)
    };

    this.dialogRef.close(payload);
  }
}
