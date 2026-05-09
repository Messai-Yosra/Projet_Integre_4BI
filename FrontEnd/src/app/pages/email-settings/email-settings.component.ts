import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { SmtpConfig } from '../../core/models/user.model';
import { AdminConfirmModalComponent } from '../../shared/components/admin-confirm-modal/admin-confirm-modal.component';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdminConfirmModalComponent],
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.css']
})
export class EmailSettingsComponent implements OnInit {
  showAdminConfirm = false;
  loading = false;
  saving = false;
  testing = false;
  testEmail = '';
  testResult: 'none' | 'success' | 'error' = 'none';
  testMessage = '';

  config: SmtpConfig = {
    host: '', port: 587, use_tls: true,
    username: '', password: '', from_email: '', from_name: '', is_active: false
  };

  constructor(
    private dashService: DashboardService,
    private notificationService: NotificationService,
    private adminAuth: AdminAuthService
  ) {}

  ngOnInit(): void {
    if (!this.adminAuth.isUnlocked()) {
      this.showAdminConfirm = true;
    } else {
      this.loadConfig();
    }
  }

  onAdminConfirmed(): void { this.showAdminConfirm = false; this.loadConfig(); }
  onAdminCancelled(): void { this.showAdminConfirm = false; history.back(); }

  loadConfig(): void {
    this.loading = true;
    this.dashService.getSmtpConfig().subscribe({
      next: cfg => {
        this.loading = false;
        if (cfg) this.config = cfg;
      },
      error: () => { this.loading = false; }
    });
  }

  saveConfig(): void {
    this.saving = true;
    this.dashService.saveSmtpConfig(this.config).subscribe({
      next: saved => {
        this.saving = false;
        this.config = saved;
        this.notificationService.success('email.saved');
      },
      error: err => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error saving SMTP');
      }
    });
  }

  sendTest(): void {
    if (!this.testEmail) return;
    this.testing = true;
    this.testResult = 'none';
    this.dashService.testSmtp(this.testEmail).subscribe({
      next: res => {
        this.testing = false;
        this.testResult = 'success';
        this.testMessage = res.message;
        this.notificationService.success('email.test_success');
      },
      error: err => {
        this.testing = false;
        this.testResult = 'error';
        this.testMessage = err.error?.error || 'SMTP test failed';
        this.notificationService.error('email.test_failed');
      }
    });
  }

  get portPreset(): string {
    if (this.config.port === 587) return 'STARTTLS (587)';
    if (this.config.port === 465) return 'SSL/TLS (465)';
    if (this.config.port === 25)  return 'SMTP (25)';
    return `Custom (${this.config.port})`;
  }

  setPort(port: number, tls: boolean): void {
    this.config.port = port;
    this.config.use_tls = tls;
  }
}
