import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  success(message: string): void {
    this.notificationSubject.next({ message, type: 'success' });
  }

  error(message: string): void {
    this.notificationSubject.next({ message, type: 'error' });
  }

  info(message: string): void {
    this.notificationSubject.next({ message, type: 'info' });
  }

  warning(message: string): void {
    this.notificationSubject.next({ message, type: 'warning' });
  }
}
