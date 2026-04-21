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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import type {
  RutaCreatePayload,
  RutaUpdatePayload
} from '../../core/services/rutas.service';
import type { Ruta } from '../../models/api.models';

export interface RutasDialogData {
  mode: 'create' | 'edit';
  ruta?: Ruta;
}

@Component({
  selector: 'app-rutas-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './rutas-dialog.html'
})
export class RutasDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RutasDialogComponent>);
  readonly data = inject<RutasDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    codigo: [this.data.ruta?.codigo ?? '', Validators.required],
    nombre: [this.data.ruta?.nombre ?? ''],
    activo: [this.data.ruta?.activo ?? true]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payloadBase = {
      codigo: raw.codigo.trim(),
      nombre: raw.nombre?.trim() || null,
      activo: raw.activo
    };

    if (this.data.mode === 'create') {
      const payload: Omit<RutaCreatePayload, 'id_usuario_creacion'> = payloadBase;
      this.dialogRef.close(payload);
      return;
    }

    const payload: Omit<RutaUpdatePayload, 'id_usuario_edita'> = payloadBase;
    this.dialogRef.close(payload);
  }
}
