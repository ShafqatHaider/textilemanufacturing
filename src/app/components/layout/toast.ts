import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      @for (toast of notification.toasts(); track toast.id) {
        <div
          class="pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 flex items-start gap-3"
          [class.bg-emerald-950]="toast.type === 'success'"
          [class.border-emerald-800]="toast.type === 'success'"
          [class.text-emerald-100]="toast.type === 'success'"
          [class.bg-rose-950]="toast.type === 'error'"
          [class.border-rose-800]="toast.type === 'error'"
          [class.text-rose-100]="toast.type === 'error'"
          [class.bg-amber-950]="toast.type === 'warning'"
          [class.border-amber-800]="toast.type === 'warning'"
          [class.text-amber-100]="toast.type === 'warning'"
          [class.bg-slate-900]="toast.type === 'info'"
          [class.border-slate-700]="toast.type === 'info'"
          [class.text-slate-100]="toast.type === 'info'"
        >
          <div class="mt-0.5 shrink-0">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            } @else if (toast.type === 'error') {
              <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else {
              <svg class="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>
          <div class="flex-1 text-sm">
            <h4 class="font-semibold text-white tracking-tight">{{ toast.title }}</h4>
            <p class="mt-0.5 text-xs opacity-90 whitespace-pre-line leading-relaxed">{{ toast.message }}</p>
          </div>
          <button
            (click)="notification.dismiss(toast.id)"
            class="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  notification = inject(NotificationService);
}
