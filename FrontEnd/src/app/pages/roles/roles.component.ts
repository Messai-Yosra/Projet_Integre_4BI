import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RoleService } from '../../core/services/role.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { Role, Dashboard } from '../../core/models/user.model';
import { AdminConfirmModalComponent } from '../../shared/components/admin-confirm-modal/admin-confirm-modal.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdminConfirmModalComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  allDashboards: Dashboard[] = [];
  loading = false;
  showAdminConfirm = false;

  // Create / Edit modal
  showModal = false;
  editMode = false;
  editingRoleId: number | null = null;
  saving = false;
  formData = { name: '', description: '' };

  // Delete modal
  showDeleteModal = false;
  roleToDelete: Role | null = null;
  deleting = false;

  // Permissions modal
  showPermissionsModal = false;
  selectedRole: Role | null = null;
  togglingId: number | null = null;

  // Members modal
  showMembersModal = false;
  membersRole: Role | null = null;

  constructor(
    private roleService: RoleService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private adminAuth: AdminAuthService
  ) {}

  ngOnInit(): void {
    if (!this.adminAuth.isUnlocked()) {
      this.showAdminConfirm = true;
    } else {
      this.init();
    }
  }

  onAdminConfirmed(): void { this.showAdminConfirm = false; this.init(); }
  onAdminCancelled(): void { this.showAdminConfirm = false; history.back(); }

  private init(): void {
    this.loadRoles();
    this.dashboardService.getAllDashboards().subscribe({
      next: d => this.allDashboards = d, error: () => {}
    });
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: r => { this.roles = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // ── Create / Edit ─────────────────────────────────────────────────────────

  openCreate(): void {
    this.editMode = false;
    this.editingRoleId = null;
    this.formData = { name: '', description: '' };
    this.showModal = true;
  }

  openEdit(role: Role): void {
    this.editMode = true;
    this.editingRoleId = role.id;
    this.formData = { name: role.name, description: role.description || '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  saveRole(): void {
    if (!this.formData.name.trim()) return;
    this.saving = true;
    const obs = this.editMode && this.editingRoleId
      ? this.roleService.update(this.editingRoleId, this.formData)
      : this.roleService.create(this.formData);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.notificationService.success(this.editMode ? 'roles.updated' : 'roles.created');
        this.loadRoles();
      },
      error: err => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error');
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  openDelete(role: Role): void {
    this.roleToDelete = role;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;
    this.deleting = true;
    this.roleService.delete(this.roleToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.roleToDelete = null;
        this.notificationService.success('roles.deleted');
        this.loadRoles();
      },
      error: err => {
        this.deleting = false;
        this.notificationService.error(err.error?.error || 'Cannot delete role');
      }
    });
  }

  // ── Permissions ───────────────────────────────────────────────────────────

  openPermissions(role: Role): void {
    this.roleService.getById(role.id).subscribe({
      next: r => { this.selectedRole = r; this.showPermissionsModal = true; },
      error: () => { this.selectedRole = role; this.showPermissionsModal = true; }
    });
  }

  hasPermission(dashboardId: number): boolean {
    return !!this.selectedRole?.dashboard_permissions?.some(
      p => p.dashboard_id === dashboardId && p.can_view
    );
  }

  togglePermission(dashboard: Dashboard): void {
    if (!this.selectedRole || this.togglingId === dashboard.id) return;
    this.togglingId = dashboard.id;
    const has = this.hasPermission(dashboard.id);
    const obs = has
      ? this.roleService.removePermission(this.selectedRole.id, dashboard.id)
      : this.roleService.addPermission(this.selectedRole.id, dashboard.id);

    obs.subscribe({
      next: () => {
        this.togglingId = null;
        this.roleService.getById(this.selectedRole!.id).subscribe({
          next: r => { this.selectedRole = r; this.loadRoles(); }
        });
      },
      error: () => { this.togglingId = null; }
    });
  }

  // ── Members ───────────────────────────────────────────────────────────────

  openMembers(role: Role): void {
    this.roleService.getById(role.id).subscribe({
      next: r => { this.membersRole = r; this.showMembersModal = true; },
      error: () => {}
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getPermissionNames(role: Role): string[] {
    return (role.dashboard_permissions || [])
      .filter(p => p.can_view)
      .map(p => p.dashboard_name);
  }

  getRoleGradient(index: number): string {
    const g = [
      'linear-gradient(135deg,#667eea,#764ba2)',
      'linear-gradient(135deg,#f093fb,#f5576c)',
      'linear-gradient(135deg,#4facfe,#00f2fe)',
      'linear-gradient(135deg,#43e97b,#38f9d7)',
      'linear-gradient(135deg,#fa709a,#fee140)'
    ];
    return g[index % g.length];
  }

  getInitial(role: Role): string {
    return role.name[0].toUpperCase();
  }
}
