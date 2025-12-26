import { Injectable, signal, computed } from '@angular/core';
import {
  ApiResponse,
  EstacionApi,
  Gasolinera,
  TipoCombustible,
  CAMPOS_PRECIO,
} from '../models/gasolinera.interface';

@Injectable({ providedIn: 'root' })
export class GasolinerasService {
  private readonly API_URL =
    'https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
  private readonly CACHE_KEY = 'gasolineras_data';
  private readonly CACHE_TIMESTAMP_KEY = 'gasolineras_timestamp';
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

  // Estado con signals
  private estaciones = signal<Gasolinera[]>([]);
  private cargando = signal(false);
  private error = signal<string | null>(null);
  private ubicacionUsuario = signal<{ lat: number; lon: number } | null>(null);

  // Filtros
  private tipoCombustible = signal<TipoCombustible>('gasoleoA');
  private radioKm = signal(10);
  private marcasPermitidas = signal<string[]>([]);
  private marcasBloqueadas = signal<string[]>([]);

  // Exposición pública (readonly)
  readonly loading = this.cargando.asReadonly();
  readonly errorMsg = this.error.asReadonly();

  // Computed: estaciones filtradas y ordenadas
  readonly estacionesFiltradas = computed(() => {
    const todas = this.estaciones();
    const ubicacion = this.ubicacionUsuario();
    const tipo = this.tipoCombustible();
    const radio = this.radioKm();
    const permitidas = this.marcasPermitidas();
    const bloqueadas = this.marcasBloqueadas();

    if (!ubicacion) return [];

    return todas
      .filter((e) => {
        // Tiene el combustible seleccionado
        const precio = e.precios.get(tipo);
        if (!precio) return false;

        // Dentro del radio
        const dist = this.calcularDistancia(
          ubicacion.lat,
          ubicacion.lon,
          e.latitud,
          e.longitud
        );
        e.distancia = dist;
        if (dist > radio) return false;

        // Filtro de marcas
        const marca = e.rotulo.toUpperCase();
        if (
          permitidas.length > 0 &&
          !permitidas.some((p) => marca.includes(p.toUpperCase()))
        ) {
          return false;
        }
        if (bloqueadas.some((b) => marca.includes(b.toUpperCase()))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
  });

  // Computed: estación más cercana
  readonly masCercana = computed(() => this.estacionesFiltradas()[0] ?? null);

  // Computed: estación más barata dentro del radio
  readonly masBarata = computed(() => {
    const filtradas = this.estacionesFiltradas();
    const tipo = this.tipoCombustible();

    if (filtradas.length === 0) return null;

    return filtradas.reduce((min, e) => {
      const precioActual = e.precios.get(tipo) ?? Infinity;
      const precioMin = min.precios.get(tipo) ?? Infinity;
      return precioActual < precioMin ? e : min;
    });
  });

  // Cargar datos de la API con sistema de caché
  async cargarEstaciones(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      // Intentar leer de caché primero
      const cached = this.leerDeCache();

      if (cached) {
        // Usar datos cacheados
        this.estaciones.set(cached);
      } else {
        // Descargar de API
        const response = await fetch(this.API_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        const normalizadas = data.ListaEESSPrecio.map((e) => this.normalizar(e));

        // Guardar en caché
        this.guardarEnCache(normalizadas);
        this.estaciones.set(normalizadas);
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      this.cargando.set(false);
    }
  }

  // Leer datos del caché si son válidos
  private leerDeCache(): Gasolinera[] | null {
    const timestampStr = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
    const dataStr = localStorage.getItem(this.CACHE_KEY);

    if (!timestampStr || !dataStr) return null;

    const timestamp = parseInt(timestampStr, 10);
    const ahora = Date.now();

    // Verificar si han pasado más de 30 minutos
    if (ahora - timestamp > this.CACHE_TTL_MS) {
      return null; // Datos obsoletos
    }

    try {
      // Parsear datos (necesita serialización especial para Map)
      const parsed = JSON.parse(dataStr);
      return this.revivir(parsed);
    } catch {
      return null;
    }
  }

  // Guardar datos en caché
  private guardarEnCache(estaciones: Gasolinera[]): void {
    try {
      const serializado = this.serializar(estaciones);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(serializado));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      // Ignorar errores de localStorage lleno
      console.warn('No se pudo guardar en caché:', e);
    }
  }

  // Serializar Map para JSON
  private serializar(estaciones: Gasolinera[]): any[] {
    return estaciones.map((e) => ({
      ...e,
      precios: Array.from(e.precios.entries()),
    }));
  }

  // Revivir Map desde JSON
  private revivir(data: any[]): Gasolinera[] {
    return data.map((e) => ({
      ...e,
      precios: new Map(e.precios),
    }));
  }

  // Normalizar estación de API a modelo interno
  private normalizar(api: EstacionApi): Gasolinera {
    const precios = new Map<TipoCombustible, number>();

    for (const [tipo, campo] of Object.entries(CAMPOS_PRECIO)) {
      const valor = api[campo as keyof EstacionApi] as string;
      if (valor && valor.trim() !== '') {
        precios.set(tipo as TipoCombustible, this.parseDecimal(valor));
      }
    }

    return {
      id: api['IDEESS'],
      rotulo: api['Rótulo'],
      direccion: api['Dirección'],
      localidad: api['Localidad'],
      provincia: api['Provincia'],
      cp: api['C.P.'],
      horario: api['Horario'],
      latitud: this.parseDecimal(api['Latitud']),
      longitud: this.parseDecimal(api['Longitud (WGS84)']),
      precios,
    };
  }

  // Parsear decimales con coma española
  private parseDecimal(valor: string): number {
    return parseFloat(valor.replace(',', '.'));
  }

  // Fórmula Haversine para distancia en km
  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Setters para filtros
  setUbicacion(lat: number, lon: number): void {
    this.ubicacionUsuario.set({ lat, lon });
  }

  setTipoCombustible(tipo: TipoCombustible): void {
    this.tipoCombustible.set(tipo);
  }

  setRadio(km: number): void {
    this.radioKm.set(km);
  }

  setMarcasPermitidas(marcas: string[]): void {
    this.marcasPermitidas.set(marcas);
  }

  setMarcasBloqueadas(marcas: string[]): void {
    this.marcasBloqueadas.set(marcas);
  }

  // Obtener ubicación del usuario via Geolocation API
  async obtenerUbicacionActual(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.setUbicacion(pos.coords.latitude, pos.coords.longitude);
          resolve();
        },
        (err) => reject(new Error(`Error geolocalización: ${err.message}`)),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}
