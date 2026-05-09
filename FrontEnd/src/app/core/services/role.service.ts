import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/roles`);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${environment.apiUrl}/roles/${id}`);
  }

  create(data: { name: string; description?: string }): Observable<Role> {
    return this.http.post<Role>(`${environment.apiUrl}/roles`, data);
  }

  update(id: number, data: { name?: string; description?: string }): Observable<Role> {
    return this.http.put<Role>(`${environment.apiUrl}/roles/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/roles/${id}`);
  }

  addPermission(roleId: number, dashboardId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/roles/${roleId}/permissions`,
      { dashboard_id: dashboardId });
  }

  removePermission(roleId: number, dashboardId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/roles/${roleId}/permissions/${dashboardId}`
    );
  }
}
