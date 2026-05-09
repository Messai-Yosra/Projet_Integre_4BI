import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, Dashboard } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  accessibleDashboards: Dashboard[] = [];
  saving = false;
  apiBase = environment.apiUrl.replace('/api', '');

  // Photo upload
  photoFile: File | null = null;
  photoPreview: string | null = null;
  uploadingPhoto = false;

  // Profile edit
  editMode = false;
  profileForm = { first_name: '', last_name: '' };

  // Password change
  showPasswordPanel = false;
  passwordForm = { current_password: '', new_password: '', confirm_password: '' };
  passwordError = '';
  passwordStrength = 0;
  savingPassword = false;

  // Email change OTP flow  (idle | otp_sent | done)
  emailStep: 'idle' | 'otp_sent' | 'done' = 'idle';
  newEmail = '';
  emailOtpCode = '';
  emailError = '';
  sendingOtp = false;
  confirmingEmail = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm = { first_name: user.first_name || '', last_name: user.last_name || '' };
      }
    });
    this.authService.refreshCurrentUser();
    this.loadDashboards();
  }

  private loadDashboards(): void {
    this.dashboardService.getMyDashboards().subscribe({
      next: d => this.accessibleDashboards = d,
      error: () => {}
    });
  }

  // ── Avatar ────────────────────────────────────────────────────────────────

  getPhotoUrl(): string | null {
    if (!this.currentUser?.profile_image) return null;
    if (this.currentUser.profile_image.startsWith('http')) return this.currentUser.profile_image;
    return `${this.apiBase}${this.currentUser.profile_image}`;
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.first_name[0]}${this.currentUser.last_name[0]}`.toUpperCase();
    }
    return this.currentUser.username[0].toUpperCase();
  }

  getDisplayName(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return this.currentUser.username;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.currentUser) return;
    const file = input.files[0];
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = e => this.photoPreview = e.target?.result as string;
    reader.readAsDataURL(file);
    this.uploadingPhoto = true;
    this.userService.uploadPhoto(this.currentUser.id, file).subscribe({
      next: () => {
        this.uploadingPhoto = false;
        this.notificationService.success('Photo updated');
        this.authService.refreshCurrentUser();
      },
      error: () => {
        this.uploadingPhoto = false;
        this.notificationService.error('Photo upload failed');
        this.photoPreview = null;
      }
    });
  }

  // ── Profile Edit ──────────────────────────────────────────────────────────

  openEdit(): void {
    if (!this.currentUser) return;
    this.profileForm = { first_name: this.currentUser.first_name || '', last_name: this.currentUser.last_name || '' };
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveProfile(): void {
    if (!this.currentUser) return;
    this.saving = true;
    this.userService.updateUser(this.currentUser.id, this.profileForm).subscribe({
      next: () => {
        this.saving = false;
        this.editMode = false;
        this.notificationService.success('Profile updated');
        this.authService.refreshCurrentUser();
      },
      error: () => {
        this.saving = false;
        this.notificationService.error('Failed to update profile');
      }
    });
  }

  // ── Password Change ───────────────────────────────────────────────────────

  computeStrength(pw: string): void {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    this.passwordStrength = s;
  }

  get strengthLabel(): string {
    return ['', 'profile.pw_weak', 'profile.pw_medium', 'profile.pw_strong', 'profile.pw_very_strong'][this.passwordStrength];
  }

  get strengthClass(): string {
    return ['', 'weak', 'medium', 'strong', 'very-strong'][this.passwordStrength];
  }

  cancelPassword(): void {
    this.showPasswordPanel = false;
    this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
    this.passwordError = '';
    this.passwordStrength = 0;
  }

  savePassword(): void {
    this.passwordError = '';
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      this.passwordError = 'profile.pw_mismatch';
      return;
    }
    if (this.passwordForm.new_password.length < 8) {
      this.passwordError = 'profile.pw_too_short';
      return;
    }
    if (!this.currentUser) return;
    this.savingPassword = true;
    this.userService.changePassword(this.currentUser.id, {
      current_password: this.passwordForm.current_password,
      new_password: this.passwordForm.new_password
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.cancelPassword();
        this.notificationService.success('Password changed');
      },
      error: () => {
        this.savingPassword = false;
        this.passwordError = 'profile.pw_wrong_current';
      }
    });
  }

  // ── Email Change OTP ──────────────────────────────────────────────────────

  sendEmailOtp(): void {
    if (!this.newEmail) return;
    this.emailError = '';
    this.sendingOtp = true;
    this.userService.requestEmailChange(this.newEmail).subscribe({
      next: () => {
        this.sendingOtp = false;
        this.emailStep = 'otp_sent';
      },
      error: () => {
        this.sendingOtp = false;
        this.emailError = 'profile.email_otp_error';
      }
    });
  }

  confirmEmailChange(): void {
    if (!this.emailOtpCode) return;
    this.emailError = '';
    this.confirmingEmail = true;
    this.userService.confirmEmailChange(this.newEmail, this.emailOtpCode).subscribe({
      next: () => {
        this.confirmingEmail = false;
        this.emailStep = 'done';
        this.notificationService.success('Email updated');
        this.authService.refreshCurrentUser();
      },
      error: () => {
        this.confirmingEmail = false;
        this.emailError = 'profile.email_otp_invalid';
      }
    });
  }

  cancelEmailChange(): void {
    this.emailStep = 'idle';
    this.newEmail = '';
    this.emailOtpCode = '';
    this.emailError = '';
  }
}
