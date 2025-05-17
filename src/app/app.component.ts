import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Corrected from styleUrl to styleUrls
  standalone: false // Explicitly set standalone to false
})
export class AppComponent {
  title = 'decision_maker_app';
  supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'fr', name: 'Français' }
  ];

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'zh', 'fr']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    const defaultLang = browserLang && browserLang.match(/en|zh|fr/) ? browserLang : 'en';
    translate.use(defaultLang);
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }
}

