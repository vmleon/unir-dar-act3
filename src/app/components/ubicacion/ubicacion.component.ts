import { Component, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { GasolinerasService } from '../../services/gasolineras.service';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [],
  template: `
    <section class="ubicacion">
      <h2>📍 Tu Ubicación</h2>

      @if (cargandoGeo) {
        <p class="estado">Obteniendo ubicación...</p>
      } @else if (errorGeo) {
        <p class="error">{{ errorGeo }}</p>
        <button (click)="usarGeolocalizacion()" [disabled]="cargandoGeo">
          Reintentar geolocalización
        </button>
      } @else if (ubicacionObtenida) {
        <p class="estado exito">✓ Ubicación obtenida correctamente</p>
      }
    </section>
  `,
  styles: [
    `
      .ubicacion {
        padding-bottom: 1rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      h2 {
        margin-top: 0;
        color: #333;
      }
      button {
        padding: 0.6rem 1.2rem;
        cursor: pointer;
        margin: 0.5rem 0.5rem 0.5rem 0;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
      }
      button:hover:not(:disabled) {
        background: #0056b3;
      }
      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      .error {
        color: #dc3545;
        font-size: 0.9rem;
        margin-top: 0.5rem;
      }
      .estado {
        color: #555;
        font-size: 0.95rem;
        margin: 0.5rem 0;
      }
      .exito {
        color: #28a745;
        font-weight: 500;
      }
    `,
  ],
})
export class UbicacionComponent implements AfterViewInit {
  private svc = inject(GasolinerasService);
  private cdr = inject(ChangeDetectorRef);

  cargandoGeo = false;
  errorGeo: string | null = null;
  ubicacionObtenida = false;

  ngAfterViewInit(): void {
    queueMicrotask(() => this.usarGeolocalizacion());
  }

  async usarGeolocalizacion(): Promise<void> {
    this.cargandoGeo = true;
    this.errorGeo = null;
    this.cdr.detectChanges();

    try {
      await this.svc.obtenerUbicacionActual();
      this.ubicacionObtenida = true;
      this.cdr.detectChanges();
    } catch (e) {
      this.errorGeo = e instanceof Error ? e.message : 'Error desconocido';
      this.ubicacionObtenida = false;
      this.cdr.detectChanges();
    } finally {
      this.cargandoGeo = false;
      this.cdr.detectChanges();
    }
  }
}
