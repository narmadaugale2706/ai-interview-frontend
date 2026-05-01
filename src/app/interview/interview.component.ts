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

  // =========================
  // STATE
  // =========================
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

    this.roleError = '';

    if (!this.role?.trim()) {
      this.roleError = "⚠ Job role is required";
      return;
    }

    this.setLoading('GENERATING', '🧠 Generating your interview question...');

    this.question = '';
    this.answer = '';
    this.feedback = [];

    const payload = {
      role: this.role
    };

    this.http.post<any>(`${this.baseUrl}/generate-question`, payload)
      .subscribe({
        next: (res) => {

          console.log("🔥 Generate Question Response:", res);

          // ✅ SAFE RESPONSE HANDLING (fixes 90% UI issues)
          this.question =
            res?.question ||
            res?.data?.question ||
            '';

          this.stopLoading();
        },

        error: (err) => {
          console.error("❌ Generate Question Error:", err);
          this.roleError = "Failed to fetch question. Check backend/API.";
          this.stopLoading();
        }
      });
  }

  // =========================
  // EVALUATE ANSWER
  // =========================
  evaluateAnswer() {

    if (!this.answer?.trim()) return;

    this.setLoading('EVALUATING', '🧠 Evaluating your answer...');

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

          console.log("🔥 Evaluation Response:", res);

          // ✅ SAFE fallback handling
          this.feedback = res?.feedback || res?.data?.feedback || [];

          this.stopLoading();
        },

        error: (err) => {
          console.error("❌ Evaluation Error:", err);
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
  // LOADING HELPERS
  // =========================
  private setLoading(
    state: 'GENERATING' | 'EVALUATING',
    message: string
  ) {
    this.loadingState = state;
    this.loadingMessage = message;
  }

  private stopLoading() {
    this.loadingState = 'IDLE';
    this.loadingMessage = '';
  }

  // =========================
  // UI HELPERS
  // =========================
  hasData(): boolean {
    return !!(this.role || this.question || this.answer || this.feedback.length);
  }

  getScoreClass(score: number): string {
    if (score >= 8) return 'text-success fw-bold';
    if (score >= 5) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  }
}