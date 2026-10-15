import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: () => number | string;
  group?: string;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <aside 
      class="bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 shrink-0 select-none z-30"
      [class.w-64]="!collapsed()"
      [class.w-20]="collapsed()"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30 shrink-0">
            T
          </div>
          @if (!collapsed()) {
            <div class="truncate">
              <h1 class="text-sm font-bold text-white tracking-wide truncate">TexFlow ERP</h1>
              <p class="text-[10px] text-indigo-400 font-medium truncate uppercase tracking-wider">Textile & Garment</p>
            </div>
          }
        </div>

        <button 
          (click)="toggleCollapse.emit()"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          [title]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            @if (collapsed()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      <!-- Navigation Items -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        @for (item of navItems; track item.id) {
          @if (item.group && (!navItems[$index - 1] || navItems[$index - 1].group !== item.group)) {
            @if (!collapsed()) {
              <div class="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {{ item.group }}
              </div>
            } @else {
              <div class="pt-3 pb-1 border-t border-slate-800 my-1"></div>
            }
          }

          <button
            (click)="selectModule.emit(item.id)"
            [class.bg-indigo-600]="activeModule() === item.id"
            [class.text-white]="activeModule() === item.id"
            [class.shadow-md]="activeModule() === item.id"
            [class.shadow-indigo-600/20]="activeModule() === item.id"
            [class.hover:bg-slate-800/80]="activeModule() !== item.id"
            [class.text-slate-400]="activeModule() !== item.id"
            [class.hover:text-slate-200]="activeModule() !== item.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative"
            [title]="collapsed() ? item.label : ''"
          >
            <!-- SVG Icon helper based on item.id -->
            <span class="shrink-0 transition-transform duration-200 group-hover:scale-110">
              @switch (item.id) {
                @case ('dashboard') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                }
                @case ('masters') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
                @case ('fabric-purchase') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                @case ('processing-mill') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                }
                @case ('fabric-inventory') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
                @case ('fabric-sales') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('stock-transfer') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
                @case ('garment-bom') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                }
                @case ('garment-production') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                @case ('raw-materials') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                }
                @case ('finished-goods') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
                @case ('other-sales') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                }
                @case ('accounting') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                @case ('reports') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                @case ('settings') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              }
            </span>

            @if (!collapsed()) {
              <span class="truncate flex-1 text-left">{{ item.label }}</span>

              @if (item.badge && item.badge()) {
                <span 
                  class="px-1.5 py-0.5 text-[10px] rounded-md font-semibold shrink-0"
                  [class.bg-indigo-500]="activeModule() === item.id"
                  [class.text-white]="activeModule() === item.id"
                  [class.bg-slate-800]="activeModule() !== item.id"
                  [class.text-indigo-400]="activeModule() !== item.id"
                >
                  {{ item.badge() }}
                </span>
              }
            }
          </button>
        }
      </nav>

      <!-- User footer -->
      <div class="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
            SH
          </div>
          @if (!collapsed()) {
            <div class="truncate text-left">
              <p class="text-xs font-medium text-white truncate">Shafqat Haider</p>
              <p class="text-[10px] text-emerald-400 truncate flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ERP Admin (PKR)
              </p>
            </div>
          }
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  erp = inject(ErpStorageService);
  collapsed = input<boolean>(false);
  activeModule = input<string>('dashboard');
  selectModule = output<string>();
  toggleCollapse = output<void>();

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', group: 'Core' },
    { id: 'masters', label: 'Master Data', icon: 'masters', group: 'Core' },
    
    { id: 'fabric-purchase', label: 'Fabric Purchase', icon: 'fabric-purchase', group: 'Textile Processing', badge: () => this.erp.fabricPurchases().length },
    { id: 'processing-mill', label: 'Processing Mill', icon: 'processing-mill', group: 'Textile Processing', badge: () => this.erp.processingChallans().filter(c => c.status === 'Dispatched').length },
    { id: 'fabric-inventory', label: 'Fabric Inventory', icon: 'fabric-inventory', group: 'Textile Processing' },
    { id: 'fabric-sales', label: 'Fabric Sales (Route A)', icon: 'fabric-sales', group: 'Textile Processing', badge: () => this.erp.fabricSales().length },
    { id: 'stock-transfer', label: 'Stock Transfer (Route B)', icon: 'stock-transfer', group: 'Textile Processing' },

    { id: 'garment-bom', label: 'Garment BOM', icon: 'garment-bom', group: 'Garment Manufacturing' },
    { id: 'garment-production', label: 'Garment Production', icon: 'garment-production', group: 'Garment Manufacturing', badge: () => this.erp.productionOrders().filter(o => o.status === 'In Production' || o.status === 'Planned').length },
    { id: 'raw-materials', label: 'Factory Raw Materials', icon: 'raw-materials', group: 'Garment Manufacturing' },
    { id: 'finished-goods', label: 'Finished Goods & Sales', icon: 'finished-goods', group: 'Garment Manufacturing' },
    
    { id: 'other-sales', label: 'Other Item Sales', icon: 'other-sales', group: 'Commercial' },
    { id: 'accounting', label: 'Double-Entry Accounting', icon: 'accounting', group: 'Financials' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'reports', group: 'Financials' },
    { id: 'settings', label: 'System & Architecture', icon: 'settings', group: 'System' }
  ];
}
