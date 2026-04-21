import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import type {
  UsuarioCreatePayload,
  UsuarioUpdatePayload
} from '../../core/services/usuarios.service';
import type { Usuario } from '../../models/api.models';

export interface UsuarioDialogData {
  mode: 'create' | 'edit';
  usuario?: Usuario;
}

@Component({
  selector: 'app-usuarios-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './usuarios-dialog.html'
})
export class UsuariosDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UsuariosDialogComponent>);
  readonly data = inject<UsuarioDialogData>(MAT_DIALOG_DATA);

  hidePassword = true;

  readonly form = this.fb.nonNullable.group({
    nombre_usuario: [this.data.usuario?.nombre_usuario ?? '', Validators.required],
    contrasena: [''],
    rol: [this.data.usuario?.rol ?? 'usuario', Validators.required],
    activo: [this.data.usuario?.activo ?? true]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.data.mode === 'create') {
      if (!raw.contrasena || raw.contrasena.length < 6) {
        this.form.controls.contrasena.setErrors({ minlength: true });
        return;
      }
      const payload: UsuarioCreatePayload = {
        nombre_usuario: raw.nombre_usuario.trim(),
        contrasena: raw.contrasena,
        rol: raw.rol.trim(),
        activo: raw.activo
      };
      this.dialogRef.close(payload);
      return;
    }

    const payload: UsuarioUpdatePayload = {
      nombre_usuario: raw.nombre_usuario.trim(),
      rol: raw.rol.trim(),
      activo: raw.activo
    };

    if (raw.contrasena) {
      payload.contrasena = raw.contrasena;
    }

    this.dialogRef.close(payload);
  }
}
