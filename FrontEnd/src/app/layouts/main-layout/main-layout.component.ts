import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { User, Dashboard, AppNotification } from '../../core/models/user.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { OnboardingComponent } from '../../shared/components/onboarding/onboarding.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ToastComponent, OnboardingComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dashboards: Dashboard[] = [];
  sidebarOpen = true;
  darkMode = false;
  currentLang = 'en';
  showUserMenu = false;
  showNotifications = false;
  showDashboardsDropdown = false;
  showOnboarding = false;

  notifications: AppNotification[] = [];
  unreadCount = 0;

  private subs = new Subscription();

  get isAdmin(): boolean {
    return this.currentUser?.role?.name === 'Admin';
  }

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private notificationsService: NotificationsService,
    private onboardingService: OnboardingService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.loadDashboards();
    this.loadTheme();
    this.currentLang = this.translate.currentLang || 'en';

    // Real notifications
    this.notificationsService.startPolling();
    this.subs.add(
      this.notificationsService.notifications$.subscribe(n => this.notifications = n)
    );
    this.subs.add(
      this.notificationsService.unreadCount$.subscribe(c => this.unreadCount = c)
    );

    // Onboarding
    this.onboardingService.load();
    setTimeout(() => {
      if (this.onboardingService.shouldShow()) {
        this.showOnboarding = true;
      }
    }, 800);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.notificationsService.stopPolling();
  }

  loadDashboards(): void {
    this.dashboardService.getMyDashboards().subscribe({
      next: (dashboards) => { this.dashboards = dashboards; },
      error: (err) => console.error('Error loading dashboards', err)
    });
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  logout(): void { this.authService.logout(); }

  private loadTheme(): void {
    const theme = localStorage.getItem('theme');
    this.darkMode = theme === 'dark';
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleDashboardsDropdown(): void {
    this.showDashboardsDropdown = !this.showDashboardsDropdown;
  }

  markAllRead(): void {
    this.notificationsService.markAllRead();
  }

  markRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationsService.markRead(id);
  }

  openOnboarding(): void {
    this.showOnboarding = true;
    this.showUserMenu = false;
  }

  onOnboardingClosed(): void {
    this.showOnboarding = false;
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

  getNotificationIcon(type: string): string {
    const map: Record<string, string> = {
      success: 'check_circle', warning: 'warning', error: 'error', info: 'info'
    };
    return map[type] || 'info';
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    return `Il y a ${Math.floor(hours / 24)} j`;
  }
}
