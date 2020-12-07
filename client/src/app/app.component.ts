import { Component } from '@angular/core';
import { CandidatesService } from './candidates.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';
  candidates: any;

  constructor(candidateService: CandidatesService) {
    candidateService.getCandidates()
      .subscribe((candidates) => this.candidates = candidates);
  }
}
