import { Component, OnInit } from '@angular/core';

interface Option {
  name: string;
  totalWeightedScore?: number;
}

interface Criteria {
  name: string;
  weight: number;
}

interface WeightedScoringState {
  options: Option[];
  criteria: Criteria[];
  scores: (number | null)[][];
  newOptionName?: string; 
  newCriteriaName?: string; 
  newCriteriaWeight?: number | null; 
}

@Component({
  selector: 'app-weighted-scoring',
  templateUrl: './weighted-scoring.component.html',
  styleUrls: ['./weighted-scoring.component.scss'],
  standalone: false 
})
export class WeightedScoringComponent implements OnInit {
  options: Option[] = [];
  criteria: Criteria[] = [];
  scores: (number | null)[][] = [];

  newOptionName: string = '';
  newCriteriaName: string = '';
  newCriteriaWeight: number | null = null;

  bestOption: Option | null = null;
  sortedOptions: Option[] = [];

  private localStorageKey = 'weightedScoringData_v1';

  constructor() { }

  ngOnInit(): void {
    this.loadState();
  }

  getDisplayedColumns(): string[] {
    const baseColumns = ['optionName'];
    const criteriaColumns = this.criteria.map((crit, index) => 'criteria_' + index);
    const totalScoreColumn = ['totalWeightedScore'];
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
      this.options = [...this.options]; // Trigger change detection
      this.scores.splice(index, 1);
      this.calculateTotalScores();
      if(this.options.length === 0) {
        this.clearResults();
      }
      this.saveState();
    }
  }

  addCriteria(): void {
    if (this.newCriteriaName.trim() !== '' && this.newCriteriaWeight !== null && this.newCriteriaWeight >= 0) {
      this.criteria.push({ name: this.newCriteriaName.trim(), weight: this.newCriteriaWeight });
      this.newCriteriaName = '';
      this.newCriteriaWeight = null;
      this.initializeScores();
      this.clearResults();
      this.saveState();
    }
  }

  removeCriteria(index: number): void {
    if (index >= 0 && index < this.criteria.length) {
      this.criteria.splice(index, 1);
      for (let i = 0; i < this.scores.length; i++) {
        if (this.scores[i]) { 
            this.scores[i].splice(index, 1);
        }
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
      let totalWeighted = 0;
      let allScoresEnteredForOption = true;
      if (this.scores[i] && this.criteria.length > 0) {
        for (let j = 0; j < this.criteria.length; j++) {
          const score = this.scores[i][j];
          const weight = this.criteria[j]?.weight; 
          if (score !== null && score !== undefined && weight !== null && weight !== undefined) {
            totalWeighted += Number(score) * Number(weight);
          } else {
            allScoresEnteredForOption = false;
          }
        }
      } else if (this.criteria.length > 0) {
        allScoresEnteredForOption = false;
      }
      option.totalWeightedScore = allScoresEnteredForOption && this.criteria.length > 0 ? totalWeighted : undefined;
    });
    this.options = [...this.options]; // Trigger change detection
  }

  canCalculate(): boolean {
    if (this.options.length === 0 || this.criteria.length === 0) {
      return false;
    }
    for (let i = 0; i < this.options.length; i++) {
      if (!this.scores[i]) return false;
      for (let j = 0; j < this.criteria.length; j++) {
        if (this.scores[i][j] === null || this.scores[i][j] === undefined || this.criteria[j]?.weight === null || this.criteria[j]?.weight === undefined) {
          return false;
        }
      }
    }
    return true;
  }

  calculateAndShowResults(): void {
    this.calculateTotalScores();
    if (this.options.every(opt => opt.totalWeightedScore !== undefined)) {
        this.sortedOptions = [...this.options].sort((a, b) => (b.totalWeightedScore ?? -Infinity) - (a.totalWeightedScore ?? -Infinity));
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
    this.newCriteriaWeight = null;
    this.clearResults();
    this.saveState();
  }

  clearResults(): void {
    this.bestOption = null;
    this.sortedOptions = [];
    this.options.forEach(opt => opt.totalWeightedScore = undefined);
    this.options = [...this.options]; // Trigger change detection
  }

  private saveState(): void {
    try {
      const state: WeightedScoringState = {
        options: this.options,
        criteria: this.criteria,
        scores: this.scores,
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage for WeightedScoring', e);
    }
  }

  private loadState(): void {
    try {
      const savedStateString = localStorage.getItem(this.localStorageKey);
      if (savedStateString) {
        const savedState: WeightedScoringState = JSON.parse(savedStateString);
        this.options = savedState.options || [];
        this.criteria = savedState.criteria || [];
        this.scores = savedState.scores || [];
        this.initializeScores();
        this.calculateAndShowResults();
      }
    } catch (e) {
      console.error('Error loading state from localStorage for WeightedScoring', e);
      this.options = [];
      this.criteria = [];
      this.scores = [];
    }
  }
}

