import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  editMode = false;
  changePasswordMode = false;
  saving = false;
  passwordError = '';

  profileForm = {
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  };

  passwordForm = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm = {
          username: user.username,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || ''
        };
      }
    });
    // Refresh user data from server
    this.authService.refreshCurrentUser();
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.first_name[0]}${this.currentUser.last_name[0]}`.toUpperCase();
    }
    return this.currentUser.username[0].toUpperCase();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return this.currentUser.username;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.currentUser) {
      this.profileForm = {
        username: this.currentUser.username,
        email: this.currentUser.email,
        first_name: this.currentUser.first_name || '',
        last_name: this.currentUser.last_name || ''
      };
    }
  }

  saveProfile(): void {
    if (!this.currentUser) return;
    this.saving = true;
    this.userService.updateUser(this.currentUser.id, this.profileForm).subscribe({
      next: () => {
        this.authService.refreshCurrentUser();
        this.editMode = false;
        this.saving = false;
        this.notificationService.success('Profile updated successfully');
      },
      error: (err) => {
        console.error('Error updating profile', err);
        this.saving = false;
        this.notificationService.error('Failed to update profile');
      }
    });
  }

  toggleChangePassword(): void {
    this.changePasswordMode = !this.changePasswordMode;
    this.passwordError = '';
    if (!this.changePasswordMode) {
      this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
    }
  }

  changePassword(): void {
    this.passwordError = '';
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      this.passwordError = 'Passwords do not match';
      return;
    }
    if (this.passwordForm.new_password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }
    if (!this.currentUser) return;

    this.userService.changePassword(this.currentUser.id, {
      current_password: this.passwordForm.current_password,
      new_password: this.passwordForm.new_password
    }).subscribe({
      next: () => {
        this.changePasswordMode = false;
        this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
        this.notificationService.success('Password changed successfully');
      },
      error: (err) => {
        console.error('Error changing password', err);
        this.passwordError = 'Current password is incorrect';
        this.notificationService.error('Failed to change password');
      }
    });
  }
}
