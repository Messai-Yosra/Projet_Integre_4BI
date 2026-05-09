import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription, switchMap, startWith } from 'rxjs';
import { environment } from '@environments/environment';
import { AppNotification, NotificationsResponse } from '../models/user.model';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  private _unreadCount = new BehaviorSubject<number>(0);
  private pollSub?: Subscription;

  notifications$ = this._notifications.asObservable();
  unreadCount$ = this._unreadCount.asObservable();

  constructor(private http: HttpClient) {}

  startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = interval(POLL_INTERVAL_MS)
      .pipe(startWith(0), switchMap(() => this.http.get<NotificationsResponse>(
        `${environment.apiUrl}/notifications`
      )))
      .subscribe({
        next: (res) => {
          this._notifications.next(res.notifications);
          this._unreadCount.next(res.unread_count);
        },
        error: () => {}
      });
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  refresh(): void {
    this.http.get<NotificationsResponse>(`${environment.apiUrl}/notifications`)
      .subscribe({
        next: (res) => {
          this._notifications.next(res.notifications);
          this._unreadCount.next(res.unread_count);
        },
        error: () => {}
      });
  }

  markRead(id: number): void {
    this.http.put(`${environment.apiUrl}/notifications/${id}/read`, {}).subscribe({
      next: () => this.refresh(),
      error: () => {}
    });
  }

  markAllRead(): void {
    this.http.put(`${environment.apiUrl}/notifications/read-all`, {}).subscribe({
      next: () => this.refresh(),
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
