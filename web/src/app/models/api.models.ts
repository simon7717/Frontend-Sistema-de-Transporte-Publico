export interface Usuario {
  id_usuario: string;
  nombre_usuario: string;
  rol: string;
  activo: boolean;
}

export interface Tarjeta {
  id_tarjeta: string;
  saldo: number;
  tipo: string | null;
  activo: boolean;
  id_usuario: string;
}

export interface Estacion {
  id_estacion: string;
  nombre: string;
  direccion: string | null;
}

export interface Vehiculo {
  id_vehiculo: string;
  placa: string;
  modelo: string | null;
  capacidad: number | null;
}

export interface Ruta {
  id_ruta: string;
  codigo: string;
  nombre: string | null;
  activo: boolean;
}

export interface Viaje {
  id_viaje: string;
  id_ruta: string;
  id_vehiculo: string;
  id_estacion_origen: string;
  id_estacion_destino: string;
  fecha_hora_salida: string;
}
