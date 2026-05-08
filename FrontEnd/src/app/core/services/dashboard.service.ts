import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Dashboard } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getMyDashboards(): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(`${environment.apiUrl}/dashboards/my-dashboards`);
  }

  getAllDashboards(): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(`${environment.apiUrl}/dashboards`);
  }
}
