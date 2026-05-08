import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.use(savedLang);
  }
}
