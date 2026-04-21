import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Estacion } from '../../models/api.models';

export interface EstacionCreatePayload {
  nombre: string;
  direccion?: string | null;
}

export interface EstacionUpdatePayload {
  nombre?: string;
  direccion?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EstacionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/estaciones`;

  list() {
    return this.http.get<Estacion[]>(`${this.baseUrl}/`);
  }

  create(data: EstacionCreatePayload) {
    return this.http.post<Estacion>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: EstacionUpdatePayload) {
    return this.http.put<Estacion>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
