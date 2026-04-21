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

import { AuditContextService } from '../../core/audit-context.service';
import type { Tarjeta } from '../../models/api.models';
import { shortId } from '../../shared/ids';
import type {
  TarjetaCreatePayload,
  TarjetaUpdatePayload
} from '../../core/services/tarjetas.service';
import { TarjetasService } from '../../core/services/tarjetas.service';
import {
  TarjetasDialogComponent,
  TarjetasDialogData
} from './tarjetas-dialog';

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
  selector: 'app-tarjetas-list',
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
  templateUrl: './tarjetas-list.html',
  styleUrl: './tarjetas-list.scss'
})
export class TarjetasListComponent {
  private readonly tarjetasService = inject(TarjetasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly loading = signal(false);
  readonly tarjetas = signal<Tarjeta[]>([]);
  readonly displayedColumns = ['id', 'saldo', 'tipo', 'activo', 'id_usuario', 'acciones'];

  constructor() {
    this.fetchTarjetas();
  }

  asShortId(id: string): string {
    return shortId(id);
  }

  saldoFmt(value: number): string {
    return `$${value}`;
  }

  openCreate(): void {
    const ref = this.dialog.open(TarjetasDialogComponent, {
      width: '460px',
      data: { mode: 'create' } as TarjetasDialogData
    });

    ref.afterClosed().subscribe((raw?: Omit<TarjetaCreatePayload, 'id_usuario_creacion'>) => {
      if (!raw) {
        return;
      }

      const auditId = this.audit.getAuditUserId();
      if (!auditId) {
        this.snackBar.open('Sesión inválida. Inicie sesión de nuevo.', 'Cerrar', { duration: 5000 });
        return;
      }

      const payload: TarjetaCreatePayload = {
        ...raw,
        id_usuario_creacion: auditId
      };

      this.tarjetasService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Tarjeta creada.', 'Cerrar', { duration: 3000 });
          this.fetchTarjetas();
        },
        error: () => this.snackBar.open('No se pudo crear la tarjeta.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  openEdit(tarjeta: Tarjeta): void {
    const ref = this.dialog.open(TarjetasDialogComponent, {
      width: '460px',
      data: { mode: 'edit', tarjeta } as TarjetasDialogData
    });

    ref.afterClosed().subscribe((raw?: Omit<TarjetaUpdatePayload, 'id_usuario_edita'>) => {
      if (!raw) {
        return;
      }

      const auditId = this.audit.getAuditUserId();
      if (!auditId) {
        this.snackBar.open('Sesión inválida. Inicie sesión de nuevo.', 'Cerrar', { duration: 5000 });
        return;
      }

      const payload: TarjetaUpdatePayload = {
        ...raw,
        id_usuario_edita: auditId
      };

      this.tarjetasService.update(tarjeta.id_tarjeta, payload).subscribe({
        next: () => {
          this.snackBar.open('Tarjeta actualizada.', 'Cerrar', { duration: 3000 });
          this.fetchTarjetas();
        },
        error: () => this.snackBar.open('No se pudo actualizar la tarjeta.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  confirmDelete(tarjeta: Tarjeta): void {
    const ref = this.dialog.open(SimpleConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Eliminar tarjeta',
        message: `¿Desea eliminar la tarjeta ${shortId(tarjeta.id_tarjeta)}?`
      } satisfies ConfirmDialogData
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.tarjetasService.delete(tarjeta.id_tarjeta).subscribe({
        next: () => {
          this.snackBar.open('Tarjeta eliminada.', 'Cerrar', { duration: 3000 });
          this.fetchTarjetas();
        },
        error: () => this.snackBar.open('No se pudo eliminar la tarjeta.', 'Cerrar', { duration: 5000 })
      });
    });
  }

  private fetchTarjetas(): void {
    this.loading.set(true);
    this.tarjetasService.list().subscribe({
      next: (rows) => {
        this.tarjetas.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar tarjetas.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
