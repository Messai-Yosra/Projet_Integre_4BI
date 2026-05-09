import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { OnboardingProgress } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private _progress = new BehaviorSubject<OnboardingProgress | null>(null);
  progress$ = this._progress.asObservable();

  constructor(private http: HttpClient) {}

  load(): void {
    this.http.get<OnboardingProgress | null>(`${environment.apiUrl}/onboarding/progress`)
      .subscribe({ next: p => this._progress.next(p), error: () => {} });
  }

  getProgress(): OnboardingProgress | null {
    return this._progress.value;
  }

  shouldShow(): boolean {
    const p = this._progress.value;
    if (!p) return true; // No record yet → first login
    return !p.is_completed && !p.is_dismissed;
  }

  update(data: Partial<OnboardingProgress>): Observable<OnboardingProgress> {
    return this.http.put<OnboardingProgress>(
      `${environment.apiUrl}/onboarding/progress`, data
    ).pipe(tap(p => this._progress.next(p)));
  }

  dismiss(): void {
    this.update({ is_dismissed: true }).subscribe();
  }

  complete(): void {
    this.update({ is_completed: true }).subscribe();
  }

  advanceStep(step: number, completedSteps: number[]): void {
    this.update({ current_step: step, completed_steps: completedSteps }).subscribe();
  }
}
