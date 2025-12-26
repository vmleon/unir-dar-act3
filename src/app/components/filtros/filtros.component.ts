import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GasolinerasService } from '../../services/gasolineras.service';
import {
  TipoCombustible,
  NOMBRES_COMBUSTIBLE,
} from '../../models/gasolinera.interface';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="filtros">
      <h2>⚙️ Filtros</h2>

      <label>
        Tipo de combustible:
        <select
          [(ngModel)]="tipoCombustible"
          (ngModelChange)="onTipoChange($event)"
        >
          @for (tipo of tiposCombustible; track tipo) {
            <option [value]="tipo">{{ nombresCombustible[tipo] }}</option>
          }
        </select>
      </label>

      <label>
        Radio de búsqueda:
        <input
          type="range"
          [(ngModel)]="radioKm"
          (ngModelChange)="onRadioChange($event)"
          min="1"
          max="50"
          step="1"
        />
        <span class="radio-value">{{ radioKm }} km</span>
      </label>

      <div class="marcas">
        <label>
          Marcas permitidas (separadas por coma, vacío = todas):
          <input
            type="text"
            [(ngModel)]="marcasPermitidas"
            (ngModelChange)="onMarcasPermitidasChange($event)"
            placeholder="REPSOL, CEPSA, BP"
          />
        </label>

        <label>
          Marcas excluidas:
          <input
            type="text"
            [(ngModel)]="marcasBloqueadas"
            (ngModelChange)="onMarcasBloqueadasChange($event)"
            placeholder="SHELL, GALP"
          />
        </label>
      </div>
    </section>
  `,
  styles: [
    `
      .filtros {
      }
      h2 {
        margin-top: 0;
        color: #333;
      }
      label {
        display: block;
        margin: 0.75rem 0;
        color: #555;
      }
      select,
      input[type='text'] {
        padding: 0.4rem;
        margin-left: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      select {
        cursor: pointer;
      }
      input[type='range'] {
        vertical-align: middle;
        margin: 0 0.5rem;
        width: 150px;
      }
      .radio-value {
        font-weight: 600;
        color: #007bff;
      }
      .marcas input {
        width: 250px;
      }
      .marcas {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }
    `,
  ],
})
export class FiltrosComponent {
  private svc = inject(GasolinerasService);

  tiposCombustible: TipoCombustible[] = [
    'gasoleoA',
    'gasoleoB',
    'gasoleoPremium',
    'gasolina95',
    'gasolina98',
    'glp',
    'gnc',
  ];
  nombresCombustible = NOMBRES_COMBUSTIBLE;

  tipoCombustible: TipoCombustible = 'gasoleoA';
  radioKm = 10;
  marcasPermitidas = '';
  marcasBloqueadas = '';

  onTipoChange(tipo: TipoCombustible): void {
    this.svc.setTipoCombustible(tipo);
  }

  onRadioChange(km: number): void {
    this.svc.setRadio(km);
  }

  onMarcasPermitidasChange(valor: string): void {
    const marcas = valor
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m);
    this.svc.setMarcasPermitidas(marcas);
  }

  onMarcasBloqueadasChange(valor: string): void {
    const marcas = valor
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m);
    this.svc.setMarcasBloqueadas(marcas);
  }
}
