import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { Dashboard } from '../../core/models/user.model';
import { AdminConfirmModalComponent } from '../../shared/components/admin-confirm-modal/admin-confirm-modal.component';

@Component({
  selector: 'app-dashboards-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdminConfirmModalComponent],
  templateUrl: './dashboards-admin.component.html',
  styleUrls: ['./dashboards-admin.component.css']
})
export class DashboardsAdminComponent implements OnInit {
  dashboards: Dashboard[] = [];
  loading = false;
  showAdminConfirm = false;

  // Create / Edit modal
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  saving = false;
  formData: Partial<Dashboard> = this.emptyForm();

  // Delete modal
  showDeleteModal = false;
  dashToDelete: Dashboard | null = null;
  deleting = false;

  readonly iconOptions = [
    'analytics', 'bar_chart', 'show_chart', 'pie_chart', 'insights',
    'dashboard', 'leaderboard', 'trending_up', 'sports_tennis', 'stadium'
  ];

  constructor(
    private dashService: DashboardService,
    private notificationService: NotificationService,
    private adminAuth: AdminAuthService
  ) {}

  ngOnInit(): void {
    if (!this.adminAuth.isUnlocked()) {
      this.showAdminConfirm = true;
    } else {
      this.loadDashboards();
    }
  }

  onAdminConfirmed(): void { this.showAdminConfirm = false; this.loadDashboards(); }
  onAdminCancelled(): void { this.showAdminConfirm = false; history.back(); }

  private emptyForm(): Partial<Dashboard> {
    return { name: '', slug: '', description: '', icon: 'analytics', embed_url: '', is_active: true, order_index: 0 };
  }

  loadDashboards(): void {
    this.loading = true;
    this.dashService.getAllDashboards().subscribe({
      next: d => { this.dashboards = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // ── Create / Edit ─────────────────────────────────────────────────────────

  openCreate(): void {
    this.editMode = false;
    this.editingId = null;
    this.formData = this.emptyForm();
    this.showModal = true;
  }

  openEdit(d: Dashboard): void {
    this.editMode = true;
    this.editingId = d.id;
    this.formData = {
      name: d.name, slug: d.slug, description: d.description || '',
      icon: d.icon || 'analytics', embed_url: d.embed_url || '',
      is_active: d.is_active, order_index: d.order_index
    };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  autoSlug(): void {
    if (!this.editMode && this.formData.name) {
      this.formData.slug = this.formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }

  saveDashboard(): void {
    if (!this.formData.name?.trim() || !this.formData.slug?.trim()) return;
    this.saving = true;
    const obs = this.editMode && this.editingId
      ? this.dashService.updateDashboard(this.editingId, this.formData)
      : this.dashService.createDashboard(this.formData);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.notificationService.success(this.editMode ? 'bi.updated' : 'bi.created');
        this.loadDashboards();
      },
      error: err => {
        this.saving = false;
        this.notificationService.error(err.error?.error || 'Error');
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  openDelete(d: Dashboard): void {
    this.dashToDelete = d;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.dashToDelete) return;
    this.deleting = true;
    this.dashService.deleteDashboard(this.dashToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.dashToDelete = null;
        this.notificationService.success('bi.deleted');
        this.loadDashboards();
      },
      error: err => {
        this.deleting = false;
        this.notificationService.error(err.error?.error || 'Error');
      }
    });
  }

  // ── Toggle active ─────────────────────────────────────────────────────────

  toggleActive(d: Dashboard): void {
    this.dashService.updateDashboard(d.id, { is_active: !d.is_active }).subscribe({
      next: () => { d.is_active = !d.is_active; },
      error: () => {}
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  get activeCount(): number { return this.dashboards.filter(d => d.is_active).length; }
  get withEmbedCount(): number { return this.dashboards.filter(d => !!d.embed_url).length; }
}
