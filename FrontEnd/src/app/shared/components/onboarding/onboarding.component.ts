import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OnboardingService } from '@core/services/onboarding.service';

export interface OnboardingStep {
  icon: string;
  titleKey: string;
  descKey: string;
  highlight?: string;
  gradient: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { icon: 'waving_hand',         titleKey: 'onboarding.s0_title',  descKey: 'onboarding.s0_desc',  gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'home',                titleKey: 'onboarding.s1_title',  descKey: 'onboarding.s1_desc',  gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'dashboard',           titleKey: 'onboarding.s2_title',  descKey: 'onboarding.s2_desc',  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: 'leaderboard',         titleKey: 'onboarding.s3_title',  descKey: 'onboarding.s3_desc',  gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'tune',                titleKey: 'onboarding.s4_title',  descKey: 'onboarding.s4_desc',  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: 'sports_tennis',       titleKey: 'onboarding.s5_title',  descKey: 'onboarding.s5_desc',  gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { icon: 'handshake',           titleKey: 'onboarding.s6_title',  descKey: 'onboarding.s6_desc',  gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { icon: 'eco',                 titleKey: 'onboarding.s7_title',  descKey: 'onboarding.s7_desc',  gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { icon: 'psychology',          titleKey: 'onboarding.s8_title',  descKey: 'onboarding.s8_desc',  gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'model_training',      titleKey: 'onboarding.s9_title',  descKey: 'onboarding.s9_desc',  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: 'query_stats',         titleKey: 'onboarding.s10_title', descKey: 'onboarding.s10_desc', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { icon: 'notifications',       titleKey: 'onboarding.s11_title', descKey: 'onboarding.s11_desc', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { icon: 'account_circle',      titleKey: 'onboarding.s12_title', descKey: 'onboarding.s12_desc', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'photo_camera',        titleKey: 'onboarding.s13_title', descKey: 'onboarding.s13_desc', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { icon: 'lock',                titleKey: 'onboarding.s14_title', descKey: 'onboarding.s14_desc', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: 'manage_accounts',     titleKey: 'onboarding.s15_title', descKey: 'onboarding.s15_desc', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'badge',               titleKey: 'onboarding.s16_title', descKey: 'onboarding.s16_desc', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: 'bar_chart',           titleKey: 'onboarding.s17_title', descKey: 'onboarding.s17_desc', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { icon: 'email',               titleKey: 'onboarding.s18_title', descKey: 'onboarding.s18_desc', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { icon: 'language',            titleKey: 'onboarding.s19_title', descKey: 'onboarding.s19_desc', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { icon: 'dark_mode',           titleKey: 'onboarding.s20_title', descKey: 'onboarding.s20_desc', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { icon: 'admin_panel_settings',titleKey: 'onboarding.s21_title', descKey: 'onboarding.s21_desc', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { icon: 'public',              titleKey: 'onboarding.s22_title', descKey: 'onboarding.s22_desc', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { icon: 'verified',            titleKey: 'onboarding.s23_title', descKey: 'onboarding.s23_desc', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { icon: 'support_agent',       titleKey: 'onboarding.s24_title', descKey: 'onboarding.s24_desc', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { icon: 'emoji_events',        titleKey: 'onboarding.s25_title', descKey: 'onboarding.s25_desc', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  steps = ONBOARDING_STEPS;
  currentIndex = 0;
  completedSteps: number[] = [];

  get current(): OnboardingStep { return this.steps[this.currentIndex]; }
  get isLast(): boolean { return this.currentIndex === this.steps.length - 1; }
  get progress(): number { return Math.round((this.currentIndex / (this.steps.length - 1)) * 100); }

  constructor(private onboardingService: OnboardingService) {}

  ngOnInit(): void {
    const p = this.onboardingService.getProgress();
    if (p) {
      this.currentIndex = Math.min(p.current_step, this.steps.length - 1);
      this.completedSteps = p.completed_steps || [];
    }
  }

  next(): void {
    if (!this.completedSteps.includes(this.currentIndex)) {
      this.completedSteps = [...this.completedSteps, this.currentIndex];
    }
    if (this.isLast) {
      this.finish();
      return;
    }
    this.currentIndex++;
    this.save();
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.save();
    }
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.save();
  }

  dismiss(): void {
    this.onboardingService.dismiss();
    this.closed.emit();
  }

  finish(): void {
    this.completedSteps = this.steps.map((_, i) => i);
    this.onboardingService.update({
      current_step: this.steps.length - 1,
      completed_steps: this.completedSteps,
      is_completed: true
    }).subscribe();
    this.closed.emit();
  }

  private save(): void {
    this.onboardingService.advanceStep(this.currentIndex, this.completedSteps);
  }

  isCompleted(index: number): boolean {
    return this.completedSteps.includes(index);
  }
}
