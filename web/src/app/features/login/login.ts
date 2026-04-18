import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AuditContextService } from '../../core/audit-context.service';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly audit = inject(AuditContextService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly showFirstUser = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    nombre_usuario: ['', Validators.required],
    contrasena: ['', Validators.required]
  });

  readonly firstUserForm = this.fb.nonNullable.group({
    nombre_usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
    rol: ['admin', Validators.required],
    activo: [true]
  });

  constructor() {
    this.loginService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.showFirstUser.set(usuarios.length === 0);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open(
          'No se pudo comprobar si existen usuarios. Intente de nuevo.',
          'Cerrar',
          { duration: 6000 }
        );
        this.showFirstUser.set(false);
        this.loading.set(false);
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { nombre_usuario, contrasena } = this.loginForm.getRawValue();
    this.loginService.login(nombre_usuario, contrasena).subscribe({
      next: (res) => {
        this.audit.setAuditUserId(res.id_usuario);
        void this.router.navigate(['/app', 'usuarios']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.snackBar.open('Usuario o contraseña incorrectos.', 'Cerrar', {
            duration: 6000
          });
        } else {
          this.snackBar.open(
            'No se pudo iniciar sesión. Intente más tarde.',
            'Cerrar',
            { duration: 6000 }
          );
        }
      }
    });
  }

  onCreateFirstUser(): void {
    if (this.firstUserForm.invalid) {
      return;
    }
    const raw = this.firstUserForm.getRawValue();
    this.loginService
      .crearUsuario({
        nombre_usuario: raw.nombre_usuario,
        contrasena: raw.contrasena,
        rol: raw.rol,
        activo: raw.activo
      })
      .subscribe({
        next: () => {
          this.firstUserForm.reset({
            nombre_usuario: '',
            contrasena: '',
            rol: 'admin',
            activo: true
          });
          this.showFirstUser.set(false);
          this.snackBar.open('Usuario creado. Inicie sesión.', 'Cerrar', {
            duration: 4000
          });
        },
        error: (err: HttpErrorResponse) => {
          if (this.isDuplicateUserError(err)) {
            this.snackBar.open('El usuario ya existe.', 'Cerrar', {
              duration: 6000
            });
          } else {
            this.snackBar.open(
              'No se pudo crear el usuario. Verifique los datos.',
              'Cerrar',
              { duration: 6000 }
            );
          }
        }
      });
  }

  private isDuplicateUserError(err: HttpErrorResponse): boolean {
    if (err.status === 409) {
      return true;
    }
    const detail = err.error?.detail;
    if (typeof detail === 'string') {
      const lower = detail.toLowerCase();
      return (
        lower.includes('ya existe') ||
        lower.includes('already exists') ||
        lower.includes('duplicate') ||
        lower.includes('unique')
      );
    }
    if (Array.isArray(detail)) {
      return detail.some((item) => {
        const msg =
          typeof item === 'string'
            ? item
            : typeof item?.msg === 'string'
              ? item.msg
              : '';
        const lower = msg.toLowerCase();
        return (
          lower.includes('ya existe') ||
          lower.includes('already exists') ||
          lower.includes('duplicate') ||
          lower.includes('unique')
        );
      });
    }
    return false;
  }
}
