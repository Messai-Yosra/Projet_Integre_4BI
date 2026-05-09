import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';

const SESSION_KEY = 'admin_session_until';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(private http: HttpClient) {}

  isUnlocked(): boolean {
    const until = localStorage.getItem(SESSION_KEY);
    if (!until) return false;
    return Date.now() < Number(until);
  }

  unlock(password: string): Observable<{ verified: boolean; expires_in: number }> {
    return this.http
      .post<{ verified: boolean; expires_in: number }>(
        `${environment.apiUrl}/auth/verify-admin-password`,
        { password }
      )
      .pipe(
        tap(() => {
          localStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_DURATION_MS));
        })
      );
  }

  lock(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  getRemainingMs(): number {
    const until = localStorage.getItem(SESSION_KEY);
    if (!until) return 0;
    return Math.max(0, Number(until) - Date.now());
  }
}
