import { Component, OnInit } from '@angular/core';

interface Option {
  name: string;
  totalScore?: number;
}

interface Criteria {
  name: string;
}

interface EqualScoringState {
  options: Option[];
  criteria: Criteria[];
  scores: (number | null)[][];
}

@Component({
  selector: 'app-equal-scoring',
  templateUrl: './equal-scoring.component.html',
  styleUrls: ['./equal-scoring.component.scss'],
  standalone: false // Explicitly set standalone to false
})
export class EqualScoringComponent implements OnInit {
  options: Option[] = [];
  criteria: Criteria[] = [];
  scores: (number | null)[][] = [];

  newOptionName: string = '';
  newCriteriaName: string = '';

  bestOption: Option | null = null;
  sortedOptions: Option[] = [];

  private localStorageKey = 'equalScoringData_v1';

  constructor() { }

  ngOnInit(): void {
    this.loadState();
  }

  getDisplayedColumns(): string[] {
    const baseColumns = ['optionName'];
    const criteriaColumns = this.criteria.map((crit, index) => 'criteria_' + index);
    const totalScoreColumn = ['totalScore'];
    return [...baseColumns, ...criteriaColumns, ...totalScoreColumn];
  }

  addOption(): void {
    if (this.newOptionName.trim() !== '') {
      this.options = [...this.options, { name: this.newOptionName.trim() }];
      this.newOptionName = '';
      this.initializeScores();
      this.clearResults();
      this.saveState();
    }
  }

  removeOption(index: number): void {
    if (index >= 0 && index < this.options.length) {
      this.options.splice(index, 1);
      this.options = [...this.options]; // Trigger change detection for table
      this.scores.splice(index, 1);
      this.calculateTotalScores();
      if(this.options.length === 0) {
        this.clearResults();
      }
      this.saveState();
    }
  }

  addCriteria(): void {
    if (this.newCriteriaName.trim() !== '') {
      this.criteria.push({ name: this.newCriteriaName.trim() });
      this.newCriteriaName = '';
      this.initializeScores();
      this.clearResults();
      this.saveState();
    }
  }

  removeCriteria(index: number): void {
    if (index >= 0 && index < this.criteria.length) {
      this.criteria.splice(index, 1);
      for (let i = 0; i < this.scores.length; i++) {
        this.scores[i].splice(index, 1);
      }
      this.calculateTotalScores();
      if(this.criteria.length === 0){
        this.clearResults();
      }
      this.saveState();
    }
  }

  initializeScores(): void {
    const newScores: (number | null)[][] = [];
    for (let i = 0; i < this.options.length; i++) {
      newScores[i] = [];
      for (let j = 0; j < this.criteria.length; j++) {
        newScores[i][j] = (this.scores[i] && this.scores[i][j] !== undefined) ? this.scores[i][j] : null;
      }
    }
    this.scores = newScores;
    this.calculateTotalScores();
  }

  handleScoreChange(): void {
    this.calculateTotalScores();
    this.saveState();
  }

  calculateTotalScores(): void {
    this.options.forEach((option, i) => {
      let total = 0;
      let allScoresEnteredForOption = true;
      if (this.scores[i] && this.criteria.length > 0) {
        for (let j = 0; j < this.criteria.length; j++) {
          const score = this.scores[i][j];
          if (score !== null && score !== undefined) {
            total += Number(score);
          } else {
            allScoresEnteredForOption = false; 
          }
        }
      } else if (this.criteria.length > 0) {
        allScoresEnteredForOption = false;
      }
      option.totalScore = allScoresEnteredForOption && this.criteria.length > 0 ? total : undefined;
    });
    this.options = [...this.options]; // Trigger change detection for table update
  }

  canCalculate(): boolean {
    if (this.options.length === 0 || this.criteria.length === 0) {
      return false;
    }
    for (let i = 0; i < this.options.length; i++) {
      if (!this.scores[i]) return false;
      for (let j = 0; j < this.criteria.length; j++) {
        if (this.scores[i][j] === null || this.scores[i][j] === undefined) {
          return false;
        }
      }
    }
    return true;
  }

  calculateAndShowResults(): void {
    this.calculateTotalScores();
    if (this.options.every(opt => opt.totalScore !== undefined)) {
        this.sortedOptions = [...this.options].sort((a, b) => (b.totalScore ?? -Infinity) - (a.totalScore ?? -Infinity));
        this.bestOption = this.sortedOptions.length > 0 ? this.sortedOptions[0] : null;
    } else {
        this.bestOption = null;
        this.sortedOptions = [];
    }
  }

  resetAll(): void {
    this.options = [];
    this.criteria = [];
    this.scores = [];
    this.newOptionName = '';
    this.newCriteriaName = '';
    this.clearResults();
    this.saveState();
  }

  clearResults(): void {
    this.bestOption = null;
    this.sortedOptions = [];
    this.options.forEach(opt => opt.totalScore = undefined);
    this.options = [...this.options]; // Trigger change detection
  }

  private saveState(): void {
    try {
      const state: EqualScoringState = {
        options: this.options,
        criteria: this.criteria,
        scores: this.scores
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage for EqualScoring', e);
    }
  }

  private loadState(): void {
    try {
      const savedStateString = localStorage.getItem(this.localStorageKey);
      if (savedStateString) {
        const savedState: EqualScoringState = JSON.parse(savedStateString);
        this.options = savedState.options || [];
        this.criteria = savedState.criteria || [];
        this.scores = savedState.scores || [];
        this.initializeScores();
        this.calculateAndShowResults();
      }
    } catch (e) {
      console.error('Error loading state from localStorage for EqualScoring', e);
      this.options = [];
      this.criteria = [];
      this.scores = [];
    }
  }
}

