import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Usuario } from '../../models/api.models';

export interface UsuarioCreatePayload {
  nombre_usuario: string;
  contrasena: string;
  rol: string;
  activo: boolean;
}

export interface UsuarioUpdatePayload {
  nombre_usuario?: string;
  contrasena?: string;
  rol?: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  list() {
    return this.http.get<Usuario[]>(`${this.baseUrl}/`);
  }

  create(data: UsuarioCreatePayload) {
    return this.http.post<Usuario>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: UsuarioUpdatePayload) {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
