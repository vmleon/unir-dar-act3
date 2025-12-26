// Respuesta cruda de la API (nombres exactos del JSON)
export interface ApiResponse {
  Fecha: string;
  ListaEESSPrecio: EstacionApi[];
}

export interface EstacionApi {
  'C.P.': string;
  Dirección: string;
  Horario: string;
  Latitud: string;
  'Longitud (WGS84)': string;
  Localidad: string;
  Municipio: string;
  Provincia: string;
  Rótulo: string;
  Margen: string;
  IDEESS: string;
  IDMunicipio: string;
  IDProvincia: string;
  IDCCAA: string;
  // Precios (string vacío si no disponible)
  'Precio Gasoleo A': string;
  'Precio Gasoleo B': string;
  'Precio Gasoleo Premium': string;
  'Precio Gasolina 95 E5': string;
  'Precio Gasolina 95 E10': string;
  'Precio Gasolina 98 E5': string;
  'Precio Gasolina 98 E10': string;
  'Precio Gases licuados del petróleo': string;
  'Precio Gas Natural Comprimido': string;
}

// Modelo normalizado para uso interno
export interface Gasolinera {
  id: string;
  rotulo: string;
  direccion: string;
  localidad: string;
  provincia: string;
  cp: string;
  horario: string;
  latitud: number;
  longitud: number;
  precios: Map<TipoCombustible, number>;
  distancia?: number; // km desde ubicación usuario
}

export type TipoCombustible =
  | 'gasoleoA'
  | 'gasoleoB'
  | 'gasoleoPremium'
  | 'gasolina95'
  | 'gasolina98'
  | 'glp'
  | 'gnc';

// Mapeo de campos API a tipos de combustible
export const CAMPOS_PRECIO: Record<TipoCombustible, string> = {
  gasoleoA: 'Precio Gasoleo A',
  gasoleoB: 'Precio Gasoleo B',
  gasoleoPremium: 'Precio Gasoleo Premium',
  gasolina95: 'Precio Gasolina 95 E5',
  gasolina98: 'Precio Gasolina 98 E5',
  glp: 'Precio Gases licuados del petróleo',
  gnc: 'Precio Gas Natural Comprimido',
};

export const NOMBRES_COMBUSTIBLE: Record<TipoCombustible, string> = {
  gasoleoA: 'Gasóleo A',
  gasoleoB: 'Gasóleo B',
  gasoleoPremium: 'Gasóleo Premium',
  gasolina95: 'Gasolina 95',
  gasolina98: 'Gasolina 98',
  glp: 'GLP',
  gnc: 'GNC',
};
