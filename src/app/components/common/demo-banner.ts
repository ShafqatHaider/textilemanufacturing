import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-demo-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden mb-6">
      <!-- Glow ambient background -->
      <div class="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Interactive MVP Walkthrough
            </span>
            <span class="text-xs text-slate-400">
              {{ completedStepsCount() }}/11 Steps Executed
            </span>
          </div>
          <h2 class="text-lg font-bold text-white mt-1">
            End-to-End Textile & Garment Manufacturing Scenario
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Follow the guided lifecycle from raw fabric procurement and processing mill job-work (with shortage tracking) to Route A direct wholesale, Route B factory transfer, BOM material issuance, garment production costing, and finished goods sales.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            (click)="isOpen.set(!isOpen())"
            class="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4 text-indigo-400 transition-transform duration-200" [class.rotate-180]="isOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ isOpen() ? 'Hide Steps' : 'View All 11 Steps' }}
          </button>

          <button
            (click)="erp.runEntireScenario()"
            class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/30 rounded-xl flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Full 11-Step Scenario (1-Click)
          </button>

          <button
            (click)="erp.resetAllData()"
            title="Reset to fresh clean data"
            class="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Step Stepper Bar -->
      <div class="mt-4 pt-4 border-t border-slate-800/80">
        <!-- Progress line -->
        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
          <div 
            class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
            [style.width.%]="(completedStepsCount() / 11) * 100"
          ></div>
        </div>

        @if (isOpen()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
            @for (step of erp.demoSteps(); track step.step) {
              <div 
                class="p-3 rounded-xl border transition-all text-xs flex flex-col justify-between"
                [class.bg-emerald-950/30]="step.completed"
                [class.border-emerald-700/50]="step.completed"
                [class.bg-slate-900/60]="!step.completed"
                [class.border-slate-800]="!step.completed"
              >
                <div>
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="font-bold" [class.text-emerald-400]="step.completed" [class.text-indigo-300]="!step.completed">
                      Step {{ step.step }}: {{ step.title }}
                    </span>
                    @if (step.completed) {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                        Done
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                        Pending
                      </span>
                    }
                  </div>
                  <p class="text-slate-400 text-[11px] leading-snug mb-3">
                    {{ step.description }}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-auto">
                  <button
                    (click)="navigateTo(step.module)"
                    class="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    View Module &rarr;
                  </button>
                  <button
                    (click)="erp.runDemoStep(step.step)"
                    [disabled]="step.completed"
                    class="px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors"
                    [class.bg-emerald-600]="step.completed"
                    [class.text-emerald-100]="step.completed"
                    [class.opacity-60]="step.completed"
                    [class.bg-indigo-600]="!step.completed"
                    [class.hover:bg-indigo-500]="!step.completed"
                    [class.text-white]="!step.completed"
                  >
                    {{ step.completed ? 'Completed' : 'Execute' }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class DemoBannerComponent {
  erp = inject(ErpStorageService);
  isOpen = signal<boolean>(false);
  navigated = output<string>();

  completedStepsCount = () => {
    return this.erp.demoSteps().filter(s => s.completed).length;
  };

  navigateTo(module: string) {
    this.navigated.emit(module);
  }
}
