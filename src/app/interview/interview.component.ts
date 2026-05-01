import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.css'
})
export class InterviewComponent {

  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  role: string = '';
  question: string = '';
  answer: string = '';

  feedback: any[] = [];

  roleError: string = '';

  loadingState: 'IDLE' | 'GENERATING' | 'EVALUATING' = 'IDLE';
  loadingMessage: string = '';

  currentYear: number = new Date().getFullYear();

  constructor(private http: HttpClient) {}

  // =========================
  // GET QUESTION
  // =========================
  getQuestion() {

    if (!this.role?.trim()) {
      this.roleError = "⚠ Job role is required";
      return;
    }

    this.loadingState = 'GENERATING';
    this.loadingMessage = 'Generating question...';

    this.question = '';
    this.answer = '';
    this.feedback = [];

    this.http.post<any>(`${this.baseUrl}/generate-question`, {
      role: this.role
    }).subscribe({
      next: (res) => {
        console.log("QUESTION RESPONSE:", res);

        this.question = res?.question || '';
        this.stopLoading();
      },
      error: (err) => {
        console.error(err);
        this.roleError = "Failed to generate question";
        this.stopLoading();
      }
    });
  }

  // =========================
  // EVALUATE ANSWER
  // =========================
  evaluateAnswer() {

    if (!this.answer?.trim()) return;

    this.loadingState = 'EVALUATING';
    this.loadingMessage = 'Evaluating answer...';

    const payload = {
      role: this.role,
      answers: [
        {
          question: this.question,
          answer: this.answer
        }
      ]
    };

    this.http.post<any>(`${this.baseUrl}/evaluate-answers`, payload)
      .subscribe({
        next: (res) => {
          console.log("EVALUATION RESPONSE:", res);

          const rawFeedback = res?.feedback || res || [];

          // ✅ SAFE MAPPING (THIS FIXES YOUR ISSUE)
          this.feedback = rawFeedback.map((f: any) => ({
            score: f.score ?? 0,
            good: f.good ?? f.goodPoints ?? '',
            missing: f.missing ?? f.missingPoints ?? '',
            improvedAnswer: f.improvedAnswer ?? f.improved_answer ?? ''
          }));

          this.stopLoading();
        },
        error: (err) => {
          console.error(err);
          this.stopLoading();
        }
      });
  }

  // =========================
  // NEXT QUESTION
  // =========================
  nextQuestion() {
    this.getQuestion();
  }

  // =========================
  // RESET
  // =========================
  resetInterview() {
    this.role = '';
    this.question = '';
    this.answer = '';
    this.feedback = [];
    this.roleError = '';
    this.stopLoading();
  }

  // =========================
  // HELPERS
  // =========================
  stopLoading() {
    this.loadingState = 'IDLE';
    this.loadingMessage = '';
  }

  hasData(): boolean {
    return !!(this.role || this.question || this.answer || this.feedback.length);
  }

  getScoreClass(score: number): string {
    if (score >= 8) return 'text-success fw-bold';
    if (score >= 5) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  }
}