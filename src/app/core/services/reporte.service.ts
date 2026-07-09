import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private http: HttpClient) {}

  obtenerDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/reportes/dashboard`);
  }
}