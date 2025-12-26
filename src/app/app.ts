import { Component, inject, OnInit } from '@angular/core';
import { UbicacionComponent } from './components/ubicacion/ubicacion.component';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { ResultadosComponent } from './components/resultados/resultados.component';
import { GasolinerasService } from './services/gasolineras.service';

@Component({
  selector: 'app-root',
  imports: [UbicacionComponent, FiltrosComponent, ResultadosComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private svc = inject(GasolinerasService);

  ngOnInit(): void {
    this.svc.cargarEstaciones();
  }
}
