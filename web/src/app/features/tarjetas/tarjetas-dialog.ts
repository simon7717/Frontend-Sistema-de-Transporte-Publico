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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import type { Usuario } from '../../models/api.models';
import { UsuariosService } from '../../core/services/usuarios.service';
import type {
  TarjetaCreatePayload,
  TarjetaUpdatePayload
} from '../../core/services/tarjetas.service';
import type { Tarjeta } from '../../models/api.models';

export interface TarjetasDialogData {
  mode: 'create' | 'edit';
  tarjeta?: Tarjeta;
}

@Component({
  selector: 'app-tarjetas-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './tarjetas-dialog.html'
})
export class TarjetasDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TarjetasDialogComponent>);
  private readonly usuariosService = inject(UsuariosService);

  readonly data = inject<TarjetasDialogData>(MAT_DIALOG_DATA);

  usuarios: Usuario[] = [];

  readonly form = this.fb.nonNullable.group({
    saldo: [this.data.tarjeta?.saldo ?? 0, [Validators.required]],
    tipo: [this.data.tarjeta?.tipo ?? ''],
    activo: [this.data.tarjeta?.activo ?? true],
    id_usuario: [this.data.tarjeta?.id_usuario ?? '', Validators.required]
  });

  constructor() {
    this.usuariosService.list().subscribe({
      next: (users) => (this.usuarios = users),
      error: () => (this.usuarios = [])
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payloadBase = {
      saldo: Number(raw.saldo),
      tipo: raw.tipo?.trim() || null,
      activo: raw.activo
    };

    if (this.data.mode === 'create') {
      const payload: Omit<TarjetaCreatePayload, 'id_usuario_creacion'> = {
        ...payloadBase,
        id_usuario: raw.id_usuario
      };
      this.dialogRef.close(payload);
      return;
    }

    const payload: Omit<TarjetaUpdatePayload, 'id_usuario_edita'> = {
      ...payloadBase
    };
    this.dialogRef.close(payload);
  }
}
