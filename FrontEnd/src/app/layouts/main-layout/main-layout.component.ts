import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { User, Dashboard } from '../../core/models/user.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ToastComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  dashboards: Dashboard[] = [];
  sidebarOpen = true;
  darkMode = false;
  currentLang = 'en';
  showUserMenu = false;
  showNotifications = false;
  showDashboardsDropdown = false;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadDashboards();
    this.loadTheme();
    this.currentLang = this.translate.currentLang || 'en';
  }

  loadDashboards(): void {
    this.dashboardService.getMyDashboards().subscribe({
      next: (dashboards) => {
        this.dashboards = dashboards;
      },
      error: (err) => console.error('Error loading dashboards', err)
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

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

  logout(): void {
    this.authService.logout();
  }

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
}
