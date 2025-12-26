# Buscador de Gasolineras - Angular v21

Aplicación web standalone Angular v21 para buscar gasolineras en España usando la API del Ministerio de Energía.

## Características

- ✅ Geolocalización automática o manual
- ✅ Filtros por tipo de combustible (Gasóleo A, Gasolina 95, etc.)
- ✅ Filtros por marcas (whitelist/blacklist)
- ✅ Radio de búsqueda configurable (1-50 km)
- ✅ Muestra gasolinera más cercana y más barata
- ✅ Caché inteligente con localStorage (TTL 30 minutos)
- ✅ Estado reactivo con Angular Signals

## Requisitos

- Node.js 18+ o 20+
- Angular CLI v21

## Instalación

```bash
# Si es la primera vez, instalar dependencias
npm install
```

## Desarrollo

```bash
# Ejecutar servidor de desarrollo
ng serve

# La aplicación estará disponible en http://localhost:4200
```

## Build para producción

```bash
# Build estándar
ng build

# Build para GitHub Pages (ajustar base-href según tu repositorio)
ng build --base-href="/nombre-repositorio/"
```

El output estará en `dist/gasolineras-app/browser/`

## Estructura del proyecto

```
src/app/
├── app.ts                    # Componente raíz
├── app.config.ts             # Configuración
├── models/
│   └── gasolinera.interface.ts  # Interfaces TypeScript
├── services/
│   └── gasolineras.service.ts   # Servicio con Signals + caché
└── components/
    ├── ubicacion/            # Componente de ubicación
    ├── filtros/              # Componente de filtros
    └── resultados/           # Componente de resultados
```

## Tecnologías

- Angular 21 (Standalone Components)
- TypeScript
- Angular Signals para estado reactivo
- Fetch API nativo (sin HttpClient)
- localStorage para caché
- CSS3 con variables

## API utilizada

Ministerio para la Transición Ecológica:
```
https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
```

## Caché

La aplicación guarda los datos de gasolineras en localStorage con un TTL de 30 minutos para evitar descargas repetidas innecesarias (~10MB de datos).
