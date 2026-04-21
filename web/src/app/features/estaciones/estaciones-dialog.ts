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
  EstacionCreatePayload,
  EstacionUpdatePayload
} from '../../core/services/estaciones.service';
import type { Estacion } from '../../models/api.models';

export interface EstacionesDialogData {
  mode: 'create' | 'edit';
  estacion?: Estacion;
}

@Component({
  selector: 'app-estaciones-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './estaciones-dialog.html'
})
export class EstacionesDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EstacionesDialogComponent>);
  readonly data = inject<EstacionesDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.estacion?.nombre ?? '', Validators.required],
    direccion: [this.data.estacion?.direccion ?? '']
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: EstacionCreatePayload | EstacionUpdatePayload = {
      nombre: raw.nombre.trim(),
      direccion: raw.direccion?.trim() || null
    };

    this.dialogRef.close(payload);
  }
}
