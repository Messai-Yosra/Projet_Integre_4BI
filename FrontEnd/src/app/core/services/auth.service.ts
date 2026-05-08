import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly SESSION_VERSION = '2';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.clearStaleSession();
    this.loadCurrentUser();
  }

  private clearStaleSession(): void {
    const v = localStorage.getItem('session_version');
    if (v !== this.SESSION_VERSION) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      localStorage.setItem('session_version', this.SESSION_VERSION);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('refresh_token', authResult.refresh_token);
    localStorage.setItem('current_user', JSON.stringify(authResult.user));
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  refreshToken(): Observable<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<{ access_token: string }>(
      `${environment.apiUrl}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
      })
    );
  }

  refreshCurrentUser(): void {
    this.http.get<User>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: (err) => console.error('Error refreshing user', err)
    });
  }
}
