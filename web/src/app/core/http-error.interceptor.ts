import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, throwError } from 'rxjs';

import { LoadingService } from './loading.service';

function extractDetail(err: unknown): string | null {
  const anyErr = err as any;
  const detail = anyErr?.error?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (typeof first === 'string') return first;
    if (typeof first?.msg === 'string') return first.msg;
  }
  return null;
}

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const loading = inject(LoadingService);

  loading.isLoading.set(true);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          localStorage.clear();
          void router.navigate(['/login']);
          return throwError(() => err);
        }

        if (err.status === 400) {
          const detail = extractDetail(err) ?? 'Solicitud inválida';
          snackBar.open(detail, 'Cerrar', {
            duration: 6000,
            panelClass: ['snack-error']
          });
          return throwError(() => err);
        }

        if (err.status === 404) {
          snackBar.open('Registro no encontrado', 'Cerrar', {
            duration: 5000,
            panelClass: ['snack-error']
          });
          return throwError(() => err);
        }

        if (err.status === 500) {
          snackBar.open('Error del servidor, intente de nuevo', 'Cerrar', {
            duration: 6000,
            panelClass: ['snack-error']
          });
          return throwError(() => err);
        }
      }

      snackBar.open('Ocurrió un error inesperado', 'Cerrar', {
        duration: 6000,
        panelClass: ['snack-error']
      });
      return throwError(() => err);
    }),
    finalize(() => {
      loading.isLoading.set(false);
    })
  );
};

