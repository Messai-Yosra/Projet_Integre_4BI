import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  step: Step = 1;
  loading = false;
  error = '';
  success = '';

  // Step 1
  email = '';

  // Step 2
  otpCode = '';

  // Step 3
  newPassword = '';
  confirmPassword = '';
  resetToken = '';
  showPassword = false;

  constructor(private http: HttpClient, private router: Router) {}

  get passwordStrength(): number {
    const p = this.newPassword;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  get strengthLabel(): string {
    const labels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    return labels[this.passwordStrength] || '';
  }

  get strengthClass(): string {
    const classes = ['', 'weak', 'medium', 'strong', 'very-strong'];
    return classes[this.passwordStrength] || '';
  }

  submitEmail(): void {
    if (!this.email) return;
    this.loading = true;
    this.error = '';
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: () => {
          this.loading = false;
          this.step = 2;
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de l\'envoi';
          this.loading = false;
        }
      });
  }

  submitOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6) return;
    this.loading = true;
    this.error = '';
    this.http.post<{ reset_token: string }>(
      `${environment.apiUrl}/auth/verify-otp`,
      { email: this.email, token: this.otpCode }
    ).subscribe({
      next: (res) => {
        this.resetToken = res.reset_token;
        this.loading = false;
        this.step = 3;
      },
      error: (err) => {
        this.error = err.error?.error || 'Code invalide ou expiré';
        this.loading = false;
      }
    });
  }

  submitReset(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }
    if (this.passwordStrength < 2) {
      this.error = 'Le mot de passe est trop faible';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post(
      `${environment.apiUrl}/auth/reset-password`,
      { email: this.email, reset_token: this.resetToken, new_password: this.newPassword }
    ).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Mot de passe réinitialisé avec succès !';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de la réinitialisation';
        this.loading = false;
      }
    });
  }

  resendOtp(): void {
    this.otpCode = '';
    this.step = 1;
    this.submitEmail();
  }
}
