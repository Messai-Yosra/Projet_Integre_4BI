import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DashboardService } from '@core/services/dashboard.service';
import { Dashboard } from '@core/models/user.model';

const DASHBOARD_META: Record<string, { icon: string; gradient: string; accent: string }> = {
  overview:    { icon: 'dashboard',   gradient: 'linear-gradient(135deg,#667eea,#764ba2)', accent: '#667eea' },
  operational: { icon: 'settings',    gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', accent: '#f093fb' },
  equipment:   { icon: 'inventory_2', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', accent: '#4facfe' },
  sponsorship: { icon: 'handshake',   gradient: 'linear-gradient(135deg,#fa709a,#fee140)', accent: '#fa709a' },
  sdg:         { icon: 'eco',         gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', accent: '#43e97b' },
};

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent implements OnInit {
  dashboard: Dashboard | null = null;
  loading = true;
  slug = '';
  safeEmbedUrl: SafeResourceUrl | null = null;
  isEmbedReady = false;

  get meta() {
    return DASHBOARD_META[this.slug] ?? DASHBOARD_META['overview'];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      this.loadDashboard();
    });
  }

  private loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getMyDashboards().subscribe({
      next: (dashboards) => {
        this.dashboard = dashboards.find(d => d.slug === this.slug) ?? null;
        if (!this.dashboard) {
          this.router.navigate(['/home']);
          return;
        }
        const embedUrl = this.dashboard.embed_url || '';
        if (embedUrl) {
          this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
          this.isEmbedReady = true;
        }
        this.loading = false;
      },
      error: () => this.router.navigate(['/home'])
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
