import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import type { Usuario } from '../../models/api.models';

export interface LoginResponse {
  id_usuario: string;
  nombre_usuario: string;
  rol: string;
}

export interface CrearUsuarioPayload {
  nombre_usuario: string;
  contrasena: string;
  rol: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  login(nombre_usuario: string, contrasena: string) {
    const params = new HttpParams()
      .set('nombre_usuario', nombre_usuario)
      .set('contrasena', contrasena);
    return this.http.post<LoginResponse>(`${this.baseUrl}/usuarios/login`, {}, {
      params
    });
  }

  obtenerUsuarios() {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios/`);
  }

  crearUsuario(data: CrearUsuarioPayload) {
    return this.http.post<Usuario>(`${this.baseUrl}/usuarios/`, data);
  }
}
