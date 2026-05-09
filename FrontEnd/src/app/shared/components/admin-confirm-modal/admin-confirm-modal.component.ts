import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminAuthService } from '@core/services/admin-auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-admin-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-confirm-modal.component.html',
  styleUrls: ['./admin-confirm-modal.component.css']
})
export class AdminConfirmModalComponent implements OnInit {
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private adminAuth: AdminAuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    // Already unlocked in this session — skip
    if (this.adminAuth.isUnlocked()) {
      this.confirmed.emit();
    }
  }

  submit(): void {
    if (!this.password) return;
    this.loading = true;
    this.error = '';
    this.adminAuth.unlock(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.notify.success('Zone admin déverrouillée (30 min)');
        this.confirmed.emit();
      },
      error: (err) => {
        this.error = err.error?.error || 'Mot de passe incorrect';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
