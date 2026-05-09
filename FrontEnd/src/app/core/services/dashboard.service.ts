import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Dashboard, SmtpConfig } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getMyDashboards(): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(`${environment.apiUrl}/dashboards/my-dashboards`);
  }

  getAllDashboards(): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(`${environment.apiUrl}/dashboards`);
  }

  createDashboard(data: Partial<Dashboard>): Observable<Dashboard> {
    return this.http.post<Dashboard>(`${environment.apiUrl}/dashboards`, data);
  }

  updateDashboard(id: number, data: Partial<Dashboard>): Observable<Dashboard> {
    return this.http.put<Dashboard>(`${environment.apiUrl}/dashboards/${id}`, data);
  }

  deleteDashboard(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/dashboards/${id}`);
  }

  // ── SMTP ──────────────────────────────────────────────────────────────────

  getSmtpConfig(): Observable<SmtpConfig | null> {
    return this.http.get<SmtpConfig | null>(`${environment.apiUrl}/admin/smtp`);
  }

  saveSmtpConfig(config: SmtpConfig): Observable<SmtpConfig> {
    return this.http.put<SmtpConfig>(`${environment.apiUrl}/admin/smtp`, config);
  }

  testSmtp(toEmail: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/admin/smtp/test`, { to_email: toEmail }
    );
  }
}
