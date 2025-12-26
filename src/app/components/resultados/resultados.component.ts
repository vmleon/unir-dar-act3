import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { GasolinerasService } from '../../services/gasolineras.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="resultados">
      <h2>📊 Resultados</h2>

      @if (svc.loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando estaciones...</p>
        </div>
      }

      @if (svc.errorMsg()) {
        <p class="error">Error: {{ svc.errorMsg() }}</p>
      }

      <div class="destacadas-container">
        @if (svc.masCercana(); as cercana) {
          <div class="destacada cercana">
            <h3>🎯 Más cercana</h3>
            <p class="nombre"><strong>{{ cercana.rotulo }}</strong></p>
            <p>{{ cercana.direccion }}, {{ cercana.localidad }}</p>
            <p class="distancia">Distancia: {{ cercana.distancia | number : '1.2-2' }} km</p>
            <p class="horario">Horario: {{ cercana.horario }}</p>
          </div>
        }

        @if (svc.masBarata(); as barata) {
          <div class="destacada barata">
            <h3>💰 Más barata en tu radio</h3>
            <p class="nombre"><strong>{{ barata.rotulo }}</strong></p>
            <p>{{ barata.direccion }}, {{ barata.localidad }}</p>
            <p class="distancia">Distancia: {{ barata.distancia | number : '1.2-2' }} km</p>
            <p class="horario">Horario: {{ barata.horario }}</p>
          </div>
        }
      </div>

      <h3>Lista completa ({{ svc.estacionesFiltradas().length }} estaciones)</h3>

      <ul class="lista">
        @for (estacion of svc.estacionesFiltradas(); track estacion.id) {
          <li>
            <strong>{{ estacion.rotulo }}</strong> - {{ estacion.distancia | number : '1.2-2' }} km
            <br />
            <small>{{ estacion.direccion }}, {{ estacion.localidad }}</small>
            <br />
            <small class="horario-small">Horario: {{ estacion.horario }}</small>
          </li>
        } @empty {
          <li class="empty">
            No se encontraron estaciones con los filtros seleccionados.
            @if (!svc.loading()) {
              <br />
              <small>Intenta aumentar el radio de búsqueda o cambiar los filtros.</small>
            }
          </li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .resultados {
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
      }
      h2 {
        margin-top: 0;
        color: #333;
      }
      .loading {
        text-align: center;
        padding: 2rem;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .destacadas-container {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
      }
      .destacada {
        flex: 1;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid;
      }
      .destacada h3 {
        margin-top: 0;
      }
      .cercana {
        background: #e8f5e9;
        border-color: #4caf50;
      }
      .barata {
        background: #fff3e0;
        border-color: #ff9800;
      }
      .nombre {
        font-size: 1.1rem;
        margin: 0.5rem 0;
      }
      .distancia {
        color: #007bff;
        font-weight: 600;
      }
      .horario {
        color: #666;
        font-size: 0.9rem;
      }
      .lista {
        max-height: 400px;
        overflow-y: auto;
        padding: 0;
        margin-top: 1rem;
        border-top: 1px solid #eee;
      }
      .lista li {
        list-style: none;
        padding: 0.75rem;
        border-bottom: 1px solid #eee;
      }
      .lista li:hover {
        background: #f8f9fa;
      }
      .horario-small {
        color: #666;
      }
      .empty {
        text-align: center;
        color: #666;
        padding: 2rem 1rem;
      }
      .error {
        color: #dc3545;
        background: #f8d7da;
        padding: 1rem;
        border-radius: 4px;
        border: 1px solid #f5c6cb;
      }
    `,
  ],
})
export class ResultadosComponent {
  svc = inject(GasolinerasService);
}
