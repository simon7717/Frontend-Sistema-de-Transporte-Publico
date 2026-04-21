import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Ruta } from '../../models/api.models';

export interface RutaCreatePayload {
  codigo: string;
  nombre?: string | null;
  activo: boolean;
  id_usuario_creacion: string;
}

export interface RutaUpdatePayload {
  codigo?: string;
  nombre?: string | null;
  activo?: boolean;
  id_usuario_edita: string;
}

@Injectable({ providedIn: 'root' })
export class RutasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rutas`;

  list() {
    return this.http.get<Ruta[]>(`${this.baseUrl}/`);
  }

  listActivas() {
    return this.http.get<Ruta[]>(`${this.baseUrl}/activas`);
  }

  create(data: RutaCreatePayload) {
    return this.http.post<Ruta>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: RutaUpdatePayload) {
    return this.http.put<Ruta>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
