import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService

@Component({
  selector: 'app-random-decision',
  templateUrl: './random-decision.component.html',
  styleUrls: ['./random-decision.component.scss'],
  standalone: false // Explicitly set standalone to false
})
export class RandomDecisionComponent implements OnInit {
  options: string[] = [];
  newOption: string = '';
  selectedOption: string | null = null;
  private localStorageKey = 'randomDecisionData_v1';

  constructor(private translate: TranslateService) { } // Inject TranslateService

  ngOnInit(): void {
    this.loadState();

    // Log translations for debugging
    this.translate.get([
      'ADD_OPTION',
      'NO_OPTIONS_YET',
      'DELETE',
      'CLEAR_ALL_OPTIONS',
      'RANDOM_DECISION_TITLE', // Add a few more for broader testing
      'ENTER_OPTION_CONTENT',
      'OPTION_LIST'
    ]).subscribe((translations: any) => {
      console.log('Translations in RandomDecisionComponent:', translations);
    });

    // Also check current lang and loader
    console.log('Current language:', this.translate.currentLang);
    this.translate.onLangChange.subscribe((event) => {
        console.log('Language changed to:', event.lang);
        console.log('Translations after lang change:', event.translations);
        // Re-fetch and log specific keys after language change
        this.translate.get([
          'ADD_OPTION',
          'NO_OPTIONS_YET',
          'DELETE'
        ]).subscribe((newTranslations: any) => {
          console.log('Specific keys after lang change:', newTranslations);
        });
    });
  }

  addOption(): void {
    if (this.newOption.trim() !== '') {
      this.options.push(this.newOption.trim());
      this.newOption = '';
      this.selectedOption = null; 
      this.saveState();
    }
  }

  removeOption(index: number): void {
    if (index >= 0 && index < this.options.length) {
      this.options.splice(index, 1);
      if (this.options.length === 0) {
        this.selectedOption = null; 
      }
      this.saveState();
    }
  }

  selectRandomOption(): void {
    if (this.options.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.options.length);
      this.selectedOption = this.options[randomIndex];
    }
  }

  clearAllOptions(): void {
    this.options = [];
    this.selectedOption = null;
    this.newOption = ''; 
    this.saveState();
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.options));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  private loadState(): void {
    try {
      const savedState = localStorage.getItem(this.localStorageKey);
      if (savedState) {
        this.options = JSON.parse(savedState);
      }
    } catch (e) {
      console.error('Error loading state from localStorage', e);
      this.options = [];
    }
  }
}

