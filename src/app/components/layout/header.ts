import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <!-- Left: Title and Breadcrumb -->
      <div class="flex items-center gap-3 min-w-0">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-white capitalize tracking-tight flex items-center gap-2 truncate">
            {{ formatTitle(activeModule()) }}
          </h2>
          <p class="text-xs text-slate-400 hidden sm:block">
            Textile Processing & Garment ERP &bull; 
            <span class="text-indigo-400 font-medium">Enterprise Edition</span>
          </p>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2.5 sm:gap-3">
        <!-- Date Badge DD-MM-YYYY -->
        <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
          <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-mono font-medium text-slate-200">{{ erp.currentDate() }}</span>
        </div>

        <!-- Currency Badge -->
        <div class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-indigo-300 text-xs font-semibold">
          <span class="text-emerald-400 font-mono">PKR</span>
          <span class="text-slate-400 text-[11px] hidden lg:inline">(Rs.)</span>
        </div>

        <!-- Quick 1-Click Demo Runner -->
        <button
          (click)="erp.runEntireScenario()"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Run Demo</span>
        </button>

        <!-- Reset Button -->
        <button
          (click)="erp.resetAllData()"
          title="Reset ERP demo state"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- System Architecture Pill -->
        <div class="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-[11px] font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>FIFO Perpetual Accounting</span>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  erp = inject(ErpStorageService);
  activeModule = input<string>('dashboard');

  formatTitle(mod: string): string {
    const titles: Record<string, string> = {
      'dashboard': 'Executive Overview & Live KPIs',
      'masters': 'Master Data & Entities',
      'fabric-purchase': 'Raw Fabric Procurement',
      'processing-mill': 'External Processing Mill Job-Work',
      'fabric-inventory': 'Fabric Stock & Lot Traceability',
      'fabric-sales': 'Processed Fabric Sales (Route A)',
      'stock-transfer': 'Factory Stock Transfer (Route B)',
      'garment-bom': 'Garment Bill of Materials (BOM)',
      'garment-production': 'Garment Production & Costing',
      'raw-materials': 'Factory Raw Materials & Trims',
      'finished-goods': 'Finished Garments Stock & Invoicing',
      'other-sales': 'Other Commercial Item Sales',
      'accounting': 'Double-Entry Accounting & Ledger',
      'reports': 'Reports & Financial Statements',
      'settings': 'Settings & .NET Architecture'
    };
    return titles[mod] || mod;
  }
}
