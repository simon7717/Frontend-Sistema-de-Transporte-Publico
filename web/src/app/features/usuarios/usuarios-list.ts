import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
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
  UsuarioCreatePayload,
  UsuarioUpdatePayload
} from '../../core/services/usuarios.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import type { Usuario } from '../../models/api.models';
import {
  UsuarioDialogData,
  UsuariosDialogComponent
} from './usuarios-dialog';

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
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss'
})
export class UsuariosListComponent {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly usuarios = signal<Usuario[]>([]);
  readonly displayedColumns = ['id', 'nombre_usuario', 'rol', 'activo', 'acciones'];

  constructor() {
    this.fetchUsuarios();
  }

  asShortId(id: string): string {
    return shortId(id);
  }

  openCreate(): void {
    const ref = this.dialog.open(UsuariosDialogComponent, {
      width: '420px',
      data: { mode: 'create' } as UsuarioDialogData
    });

    ref.afterClosed().subscribe((payload?: UsuarioCreatePayload) => {
      if (!payload) {
        return;
      }
      this.usuariosService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado.', 'Cerrar', { duration: 3000 });
          this.fetchUsuarios();
        },
        error: () => this.snackBar.open('No se pudo crear el usuario.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  openEdit(usuario: Usuario): void {
    const ref = this.dialog.open(UsuariosDialogComponent, {
      width: '420px',
      data: { mode: 'edit', usuario } as UsuarioDialogData
    });

    ref.afterClosed().subscribe((payload?: UsuarioUpdatePayload) => {
      if (!payload) {
        return;
      }
      this.usuariosService.update(usuario.id_usuario, payload).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado.', 'Cerrar', { duration: 3000 });
          this.fetchUsuarios();
        },
        error: () => this.snackBar.open('No se pudo actualizar el usuario.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  confirmDelete(usuario: Usuario): void {
    const ref = this.dialog.open(SimpleConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Eliminar usuario',
        message: `¿Desea eliminar a ${usuario.nombre_usuario}?`
      } satisfies ConfirmDialogData
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.usuariosService.delete(usuario.id_usuario).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado.', 'Cerrar', { duration: 3000 });
          this.fetchUsuarios();
        },
        error: () => this.snackBar.open('No se pudo eliminar el usuario.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  private fetchUsuarios(): void {
    this.loading.set(true);
    this.usuariosService.list().subscribe({
      next: (rows) => {
        this.usuarios.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar usuarios.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
