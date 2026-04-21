import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Tarjeta } from '../../models/api.models';

export interface TarjetaCreatePayload {
  saldo: number;
  tipo?: string | null;
  activo: boolean;
  id_usuario: string;
  id_usuario_creacion: string;
}

export interface TarjetaUpdatePayload {
  saldo?: number;
  tipo?: string | null;
  activo?: boolean;
  id_usuario_edita: string;
}

@Injectable({ providedIn: 'root' })
export class TarjetasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tarjetas`;

  list() {
    return this.http.get<Tarjeta[]>(`${this.baseUrl}/`);
  }

  listByUsuario(id_usuario: string) {
    return this.http.get<Tarjeta[]>(`${this.baseUrl}/usuario/${id_usuario}`);
  }

  create(data: TarjetaCreatePayload) {
    return this.http.post<Tarjeta>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: TarjetaUpdatePayload) {
    return this.http.put<Tarjeta>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
