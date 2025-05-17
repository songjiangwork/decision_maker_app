import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RandomDecisionComponent } from './random-decision/random-decision.component';
import { EqualScoringComponent } from './equal-scoring/equal-scoring.component';
import { WeightedScoringComponent } from './weighted-scoring/weighted-scoring.component';

const routes: Routes = [
  { path: '', redirectTo: '/random-decision', pathMatch: 'full' },
  { path: 'random-decision', component: RandomDecisionComponent },
  { path: 'equal-scoring', component: EqualScoringComponent },
  { path: 'weighted-scoring', component: WeightedScoringComponent },
  { path: '**', redirectTo: '/random-decision' } // Fallback route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

