import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { User, Role, Dashboard } from '../../core/models/user.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminConfirmModalComponent } from '../../shared/components/admin-confirm-modal/admin-confirm-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdminConfirmModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  allDashboards: Dashboard[] = [];
  loading = false;
  showModal = false;
  showDeleteModal = false;
  showPrivilegesModal = false;
  showAdminConfirm = false;
  editMode = false;
  editingUserId: number | null = null;
  userToDelete: User | null = null;
  viewingUser: User | null = null;
  searchTerm = '';
  filterRole = '';
  photoFile: File | null = null;
  photoPreview: string | null = null;
  apiBase = environment.apiUrl.replace('/api', '');

  formData = {
    username: '', email: '', first_name: '', last_name: '',
    password: '', role_id: 0, is_active: true
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private adminAuth: AdminAuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    if (!this.adminAuth.isUnlocked()) {
      this.showAdminConfirm = true;
    } else {
      this.init();
    }
  }

  onAdminConfirmed(): void {
    this.showAdminConfirm = false;
    this.init();
  }

  onAdminCancelled(): void {
    this.showAdminConfirm = false;
    history.back();
  }

  private init(): void {
    this.loadUsers();
    this.loadRoles();
    this.dashboardService.getAllDashboards().subscribe({
      next: d => this.allDashboards = d, error: () => {}
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  get totalUsers(): number { return this.users.length; }
  get activeUsers(): number { return this.users.filter(u => u.is_active).length; }
  get inactiveUsers(): number { return this.users.filter(u => !u.is_active).length; }
  get adminUsers(): number { return this.users.filter(u => u.role?.name === 'Admin').length; }

  // ── Filtering ─────────────────────────────────────────────────────────────

  get filteredUsers(): User[] {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u => {
      const matchSearch = !term ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.first_name?.toLowerCase() || '').includes(term) ||
        (u.last_name?.toLowerCase() || '').includes(term);
      const matchRole = !this.filterRole || String(u.role_id) === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: r => {
        this.roles = r;
        if (r.length > 0 && !this.formData.role_id) {
          this.formData.role_id = r[0].id;
        }
      }
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────

  openCreate(): void {
    this.editMode = false;
    this.editingUserId = null;
    this.photoFile = null;
    this.photoPreview = null;
    this.formData = {
      username: '', email: '', first_name: '', last_name: '',
      password: '', role_id: this.roles[0]?.id || 0, is_active: true
    };
    this.showModal = true;
  }

  openEdit(user: User): void {
    this.editMode = true;
    this.editingUserId = user.id;
    this.photoFile = null;
    this.photoPreview = null;
    this.formData = {
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
      role_id: user.role_id,
      is_active: user.is_active
    };
    this.showModal = true;
  }

  openPrivileges(user: User): void {
    this.viewingUser = user;
    this.showPrivilegesModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.photoFile = null;
    this.photoPreview = null;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = e => this.photoPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  saveUser(): void {
    const payload = { ...this.formData, role_id: Number(this.formData.role_id) };

    const afterSave = (userId: number) => {
      if (this.photoFile) {
        this.userService.uploadPhoto(userId, this.photoFile).subscribe({
          next: () => { this.loadUsers(); this.closeModal(); },
          error: () => { this.loadUsers(); this.closeModal(); }
        });
      } else {
        this.loadUsers();
        this.closeModal();
      }
    };

    if (this.editMode && this.editingUserId) {
      const data = payload.password ? payload : (() => { const {password, ...rest} = payload; return rest; })();
      this.userService.updateUser(this.editingUserId, data).subscribe({
        next: (u) => {
          this.notificationService.success('Utilisateur mis à jour');
          afterSave(u.id);
        },
        error: err => this.notificationService.error(err.error?.error || 'Erreur mise à jour')
      });
    } else {
      this.userService.createUser(payload).subscribe({
        next: (u) => {
          this.notificationService.success('Utilisateur créé');
          afterSave(u.id);
        },
        error: err => this.notificationService.error(err.error?.error || 'Erreur création')
      });
    }
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Utilisateur supprimé');
        this.loadUsers();
        this.showDeleteModal = false;
        this.userToDelete = null;
      },
      error: err => this.notificationService.error(err.error?.error || 'Erreur suppression')
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  getInitials(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  }

  getAvatarGradient(index: number): string {
    const g = [
      'linear-gradient(135deg,#667eea,#764ba2)',
      'linear-gradient(135deg,#f093fb,#f5576c)',
      'linear-gradient(135deg,#4facfe,#00f2fe)',
      'linear-gradient(135deg,#43e97b,#38f9d7)',
      'linear-gradient(135deg,#fa709a,#fee140)'
    ];
    return g[index % g.length];
  }

  getUserDashboards(user: User): Dashboard[] {
    if (!user.role) return [];
    const role = this.roles.find(r => r.id === user.role_id);
    if (!role?.dashboard_permissions) return [];
    const ids = role.dashboard_permissions.filter(p => p.can_view).map(p => p.dashboard_id);
    return this.allDashboards.filter(d => ids.includes(d.id));
  }

  getPhotoUrl(user: User): string | null {
    if (!user.profile_image) return null;
    if (user.profile_image.startsWith('http')) return user.profile_image;
    return `${this.apiBase}${user.profile_image}`;
  }
}
