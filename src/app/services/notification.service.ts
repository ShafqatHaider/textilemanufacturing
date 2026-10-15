import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, durationMs = 4500) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      timestamp: Date.now()
    };

    this.toasts.update(toasts => [newToast, ...toasts.slice(0, 4)]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  success(title: string, message: string) {
    this.show('success', title, message);
  }

  error(title: string, message: string) {
    this.show('error', title, message, 6000);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }

  dismiss(id: string) {
    this.updateToasts(id);
  }

  private updateToasts(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
