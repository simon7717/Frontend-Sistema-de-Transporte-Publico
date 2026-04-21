import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Viaje } from '../../models/api.models';

export interface ViajeCreatePayload {
  id_ruta: string;
  id_vehiculo: string;
  id_estacion_origen: string;
  id_estacion_destino: string;
  fecha_hora_salida: string;
  id_usuario_creacion: string;
}

export interface ViajeUpdatePayload {
  id_ruta?: string;
  id_vehiculo?: string;
  id_estacion_origen?: string;
  id_estacion_destino?: string;
  fecha_hora_salida?: string;
  id_usuario_edita: string;
}

@Injectable({ providedIn: 'root' })
export class ViajesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/viajes`;

  list() {
    return this.http.get<Viaje[]>(`${this.baseUrl}/`);
  }

  listByRuta(id_ruta: string) {
    return this.http.get<Viaje[]>(`${this.baseUrl}/ruta/${id_ruta}`);
  }

  listByVehiculo(id_vehiculo: string) {
    return this.http.get<Viaje[]>(`${this.baseUrl}/vehiculo/${id_vehiculo}`);
  }

  create(data: ViajeCreatePayload) {
    return this.http.post<Viaje>(`${this.baseUrl}/`, data);
  }

  update(id: string, data: ViajeUpdatePayload) {
    return this.http.put<Viaje>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

