import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, Role } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  showModal = false;
  showDeleteModal = false;
  editMode = false;
  editingUserId: number | null = null;
  currentUser: User | null = null;
  userToDelete: User | null = null;
  searchTerm = '';
  loading = false;
  errorMessage = '';

  formData = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role_id: 0
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.errorMessage = 'Failed to load users. Make sure the backend is running.';
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        if (roles.length > 0 && this.formData.role_id === 0) {
          this.formData.role_id = roles[0].id;
        }
      },
      error: (err) => console.error('Error loading roles', err)
    });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.first_name?.toLowerCase() || '').includes(term) ||
      (user.last_name?.toLowerCase() || '').includes(term) ||
      (user.role?.name.toLowerCase() || '').includes(term)
    );
  }

  openCreateModal(): void {
    this.editMode = false;
    this.editingUserId = null;
    this.formData = {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role_id: this.roles[0]?.id || 0
    };
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.editMode = true;
    this.editingUserId = user.id;
    this.formData = {
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
      role_id: user.role_id
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editMode = false;
    this.editingUserId = null;
  }

  saveUser(): void {
    // Cast role_id to number (select returns string)
    const payload = {
      ...this.formData,
      role_id: Number(this.formData.role_id)
    };

    if (this.editMode && this.editingUserId) {
      // Remove password if empty on edit
      if (!payload.password) {
        const { password, ...rest } = payload;
        this.userService.updateUser(this.editingUserId, rest).subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
            this.notificationService.success('User updated successfully');
          },
          error: (err) => {
            console.error('Error updating user', err);
            this.notificationService.error('Failed to update user');
          }
        });
      } else {
        this.userService.updateUser(this.editingUserId, payload).subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
            this.notificationService.success('User updated successfully');
          },
          error: (err) => {
            console.error('Error updating user', err);
            this.notificationService.error('Failed to update user');
          }
        });
      }
    } else {
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
          this.notificationService.success('User created successfully');
        },
        error: (err) => {
          console.error('Error creating user', err);
          this.notificationService.error('Failed to create user');
        }
      });
    }
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDeleteModal();
          this.notificationService.success('User deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.notificationService.error('Failed to delete user');
        }
      });
    }
  }

  getUserInitials(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  }

  getAvatarColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return colors[index % colors.length];
  }
}
