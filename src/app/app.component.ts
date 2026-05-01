import { Component } from '@angular/core';
import { InterviewComponent } from './interview/interview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [InterviewComponent],
  template: `<app-interview></app-interview>`
})
export class AppComponent {}