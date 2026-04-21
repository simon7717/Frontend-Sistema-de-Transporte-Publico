import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Vehiculo } from '../../models/api.models';

export interface VehiculoCreatePayload {
  placa: string;
  modelo?: string | null;
  capacidad?: number | null;
}

export interface VehiculoUpdatePayload {
  placa?: string;
  modelo?: string | null;
  capacidad?: number | null;
}

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vehiculos`;

  list() {
    return this.http.get<Vehiculo[]>(`${this.baseUrl}/`);
  }

  create(data: VehiculoCreatePayload) {
    return this.http.post<Vehiculo>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: VehiculoUpdatePayload) {
    return this.http.put<Vehiculo>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
