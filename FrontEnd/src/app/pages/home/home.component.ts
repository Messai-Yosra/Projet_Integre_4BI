import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { Dashboard, User } from '../../core/models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  dashboards: Dashboard[] = [];
  currentUser: User | null = null;
  loading = false;

  private readonly dashboardMeta: Record<string, { desc: string; tags: string[] }> = {
    overview: {
      desc: 'Executive summary of tournament performance, revenue trends, and key business outcomes across all FIP events.',
      tags: ['Revenue', 'KPIs', 'Executive']
    },
    operational: {
      desc: 'Track tournament logistics, scheduling efficiency, and on-ground operational performance in real time.',
      tags: ['Operations', 'Scheduling', 'Efficiency']
    },
    equipment: {
      desc: 'Analyse brand partnerships, equipment usage, and sponsorship asset performance across competitions.',
      tags: ['Brands', 'Equipment', 'Partnerships']
    },
    sponsorship: {
      desc: 'Measure sponsorship ROI, partner visibility, and commercial deal performance across the season.',
      tags: ['ROI', 'Commercial', 'Partners']
    },
    sdg: {
      desc: 'Monitor sustainable development goals, social impact initiatives, and environmental commitments.',
      tags: ['Sustainability', 'SDG', 'Impact']
    }
  };

  private readonly dashboardIcons: Record<string, string> = {
    overview:    'leaderboard',
    operational: 'tune',
    equipment:   'sports_tennis',
    sponsorship: 'handshake',
    sdg:         'eco'
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadDashboards();
  }

  loadDashboards(): void {
    this.loading = true;
    this.dashboardService.getMyDashboards().subscribe({
      next: (dashboards) => {
        this.dashboards = dashboards;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboards', err);
        this.loading = false;
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  getDisplayName(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.first_name) return this.currentUser.first_name;
    return this.currentUser.username;
  }

  getDashboardIcon(slug: string): string {
    return this.dashboardIcons[slug] ?? 'analytics';
  }

  getDashboardDesc(slug: string): string {
    return this.dashboardMeta[slug]?.desc ?? 'Access your business intelligence report for this area.';
  }

  getDashboardTags(slug: string): string[] {
    return this.dashboardMeta[slug]?.tags ?? [];
  }
}
