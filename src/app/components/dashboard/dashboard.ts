import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Top Overview Stats Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <!-- 1. Total Fabric Purchased -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Fabric Purchased</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-white font-mono">
            {{ erp.totalFabricPurchasedMeters().toLocaleString() }} <span class="text-xs text-indigo-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Amount: Rs. {{ erp.totalPurchasesAmount().toLocaleString() }}</span>
          </div>
          <div class="absolute top-3 right-3 text-indigo-500/30 group-hover:text-indigo-400/50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <!-- 2. Fabric at Processing Mills -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Fabric at Mills</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {{ erp.fabricAtMillsMeters().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            <span>Active Job Work Dyeing/Wash</span>
          </div>
          <div class="absolute top-3 right-3 text-amber-500/30 group-hover:text-amber-400/50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>

        <!-- 3. Processed Fabric Stock -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Processed Fabric Stock</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {{ erp.processedFabricStockMeters().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            <span>Dyed & Ready in Stock</span>
          </div>
          <div class="absolute top-3 right-3 text-emerald-500/30 group-hover:text-emerald-400/50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        <!-- 4. Fabric Sold Directly (Route A) -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Fabric Sold Directly</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-sky-400 font-mono">
            {{ erp.fabricSoldMeters().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            <span>Route A Direct Wholesale</span>
          </div>
          <div class="absolute top-3 right-3 text-sky-500/30 group-hover:text-sky-400/50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- 5. Garments Produced -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Garments Produced</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-violet-400 font-mono">
            {{ erp.garmentsProducedCount().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">pcs</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            <span>QC Accepted & Packaged</span>
          </div>
          <div class="absolute top-3 right-3 text-violet-500/30 group-hover:text-violet-400/50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <!-- 6. Finished Garments Stock -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Garments in Stock</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-teal-400 font-mono">
            {{ erp.garmentsStockCount().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">pcs</span>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">
            <span>Ready for Retail Dispatch</span>
          </div>
          <div class="absolute top-3 right-3 text-teal-500/30 group-hover:text-teal-400/50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Financial Metrics Ribbon (PKR) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Sales Revenue -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
            <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-white font-mono">
            Rs. {{ erp.totalSalesAmount().toLocaleString() }}
          </div>
          <div class="mt-1 text-xs text-emerald-400">
            Fabric + Garments + Trading
          </div>
        </div>

        <!-- Cost of Goods Sold (COGS) -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total COGS (FIFO)</span>
            <span class="p-1.5 rounded-lg bg-slate-800 text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-200 font-mono">
            Rs. {{ erp.totalCostOfGoodsSold().toLocaleString() }}
          </div>
          <div class="mt-1 text-xs text-slate-500">
            Perpetual inventory relief
          </div>
        </div>

        <!-- Estimated Gross Profit -->
        <div class="bg-slate-900/90 border border-indigo-900/40 rounded-2xl p-5 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Estimated Gross Profit</span>
            <span class="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div class="mt-2 text-2xl font-black text-indigo-300 font-mono">
            Rs. {{ erp.estimatedGrossProfit().toLocaleString() }}
          </div>
          <div class="mt-1 text-xs text-indigo-400">
            Margin: {{ calculateMargin() }}%
          </div>
        </div>

        <!-- Customer Receivables & Supplier Payables -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receivables & Payables</span>
            <span class="text-xs text-slate-500">PKR</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div class="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
              <div class="text-slate-400 text-[10px]">Customer Rec.</div>
              <div class="font-bold text-white font-mono mt-0.5">Rs. {{ erp.totalCustomerReceivables().toLocaleString() }}</div>
            </div>
            <div class="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
              <div class="text-slate-400 text-[10px]">Supplier Pay.</div>
              <div class="font-bold text-amber-300 font-mono mt-0.5">Rs. {{ erp.totalSupplierPayables().toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Quick Workflow Launchers
          </span>
          <span class="text-xs text-slate-500">Instant Transaction Creation</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            (click)="navigate('fabric-purchase')"
            class="p-2.5 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all group"
          >
            <div class="text-[10px] text-indigo-400 font-medium">Step 1</div>
            <div class="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">Buy Raw Fabric</div>
          </button>
          
          <button
            (click)="navigate('processing-mill')"
            class="p-2.5 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition-all group"
          >
            <div class="text-[10px] text-amber-400 font-medium">Step 2-3</div>
            <div class="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">Mill Job-Work</div>
          </button>

          <button
            (click)="navigate('fabric-sales')"
            class="p-2.5 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 transition-all group"
          >
            <div class="text-[10px] text-sky-400 font-medium">Route A</div>
            <div class="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">Sell Processed Fabric</div>
          </button>

          <button
            (click)="navigate('stock-transfer')"
            class="p-2.5 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all group"
          >
            <div class="text-[10px] text-emerald-400 font-medium">Route B</div>
            <div class="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">Transfer to Factory</div>
          </button>

          <button
            (click)="navigate('garment-production')"
            class="p-2.5 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-violet-500/50 transition-all group"
          >
            <div class="text-[10px] text-violet-400 font-medium">Step 6-8</div>
            <div class="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">Garment Production</div>
          </button>

          <button
            (click)="navigate('finished-goods')"
            class="p-2.5 text-left rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/50 transition-all group"
          >
            <div class="text-[10px] text-teal-400 font-medium">Step 10</div>
            <div class="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">Sell Garments</div>
          </button>
        </div>
      </div>

      <!-- Charts & Visual Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. Fabric Pipeline Status -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-bold text-white">Fabric Inventory by Pipeline Status</h3>
              <p class="text-xs text-slate-400">Total volume in meters across lifecycle stages</p>
            </div>
            <span class="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">Meters (m)</span>
          </div>

          <div class="space-y-4 pt-2">
            <!-- Raw Greige at Warehouse -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Raw Greige Fabric (Central WH)
                </span>
                <span class="text-white font-mono font-bold">{{ rawFabricStockMeters() }} m</span>
              </div>
              <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-slate-400 h-full transition-all duration-500" [style.width.%]="getPercent(rawFabricStockMeters(), totalPipelineFabric())"></div>
              </div>
            </div>

            <!-- In-Transit / At Mill -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Dispatched to Mill (In Processing)
                </span>
                <span class="text-amber-400 font-mono font-bold">{{ erp.fabricAtMillsMeters() }} m</span>
              </div>
              <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full transition-all duration-500" [style.width.%]="getPercent(erp.fabricAtMillsMeters(), totalPipelineFabric())"></div>
              </div>
            </div>

            <!-- Processed Ready Fabric -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Processed Fabric (Central & Factory)
                </span>
                <span class="text-emerald-400 font-mono font-bold">{{ erp.processedFabricStockMeters() }} m</span>
              </div>
              <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full transition-all duration-500" [style.width.%]="getPercent(erp.processedFabricStockMeters(), totalPipelineFabric())"></div>
              </div>
            </div>

            <!-- Sold Directly -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Sold Directly (Wholesale Route A)
                </span>
                <span class="text-sky-400 font-mono font-bold">{{ erp.fabricSoldMeters() }} m</span>
              </div>
              <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-sky-500 h-full transition-all duration-500" [style.width.%]="getPercent(erp.fabricSoldMeters(), totalPipelineFabric())"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Garment Production vs Sales -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-bold text-white">Garments Production vs Sales</h3>
              <p class="text-xs text-slate-400">Manufactured vs Delivered pieces (pcs)</p>
            </div>
            <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">Pieces</span>
          </div>

          <div class="grid grid-cols-3 gap-3 my-4">
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400 uppercase">Manufactured</div>
              <div class="text-xl font-bold text-violet-400 font-mono mt-1">{{ erp.garmentsProducedCount() }}</div>
              <div class="text-[10px] text-slate-500">Accepted Qty</div>
            </div>
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400 uppercase">Sold</div>
              <div class="text-xl font-bold text-teal-400 font-mono mt-1">{{ totalGarmentsSold() }}</div>
              <div class="text-[10px] text-slate-500">Dispatched</div>
            </div>
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400 uppercase">In Factory WH</div>
              <div class="text-xl font-bold text-white font-mono mt-1">{{ erp.garmentsStockCount() }}</div>
              <div class="text-[10px] text-slate-500">Available</div>
            </div>
          </div>

          <!-- Production Cost Breakdown Formula -->
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
            <div class="font-semibold text-slate-300">Production Costing Formula:</div>
            <div class="font-mono text-[11px] text-indigo-300">
              Unit Cost = (Material Cost + Labor + Overheads) / Accepted Finished Qty
            </div>
            <div class="text-slate-400 text-[11px]">
              Total Production Expenses: <span class="font-bold text-white">Rs. {{ erp.totalProductionCosts().toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Table & Audit Stream -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white">Live Stock Movements & Audit Log</h3>
            <p class="text-xs text-slate-400">Traceable movements across Central Warehouse, Mill, and Factory</p>
          </div>
          <button
            (click)="navigate('reports')"
            class="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View All Reports &rarr;
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Reference</th>
                <th class="py-3 px-4">Item & Lot</th>
                <th class="py-3 px-4">Movement Type</th>
                <th class="py-3 px-4">Warehouse</th>
                <th class="py-3 px-4 text-right">Quantity</th>
                <th class="py-3 px-4 text-right">Unit Cost</th>
                <th class="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (move of erp.stockMovements().slice(0, 7); track move.id) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">{{ move.date }}</td>
                  <td class="py-2.5 px-4 font-mono font-medium text-white">{{ move.referenceNo }}</td>
                  <td class="py-2.5 px-4">
                    <div class="font-medium text-white">{{ move.itemName }}</div>
                    @if (move.lotNo) {
                      <div class="text-[10px] text-indigo-400 font-mono">Lot #{{ move.lotNo }}</div>
                    }
                  </td>
                  <td class="py-2.5 px-4">
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-semibold"
                      [class.bg-emerald-500/10]="move.quantity > 0"
                      [class.text-emerald-400]="move.quantity > 0"
                      [class.bg-rose-500/10]="move.quantity < 0"
                      [class.text-rose-400]="move.quantity < 0"
                    >
                      {{ formatMovementType(move.movementType) }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-slate-300">{{ move.warehouseName }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold" [class.text-emerald-400]="move.quantity > 0" [class.text-rose-400]="move.quantity < 0">
                    {{ move.quantity > 0 ? '+' : '' }}{{ move.quantity }} {{ move.unit }}
                  </td>
                  <td class="py-2.5 px-4 text-right font-mono text-slate-400">Rs. {{ move.unitCost.toFixed(2) }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-medium text-slate-200">{{ move.balanceAfter }} {{ move.unit }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-8 text-center text-slate-500">
                    No transactions posted yet. Click "Run Demo" above to seed and test the full 11-step manufacturing workflow.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  erp = inject(ErpStorageService);
  moduleSelected = output<string>();

  navigate(mod: string) {
    this.moduleSelected.emit(mod);
  }

  rawFabricStockMeters(): number {
    return this.erp.products()
      .filter(p => p.category === 'RAW_FABRIC')
      .reduce((sum, p) => sum + p.currentStock, 0);
  }

  totalPipelineFabric(): number {
    const raw = this.rawFabricStockMeters();
    const mill = this.erp.fabricAtMillsMeters();
    const proc = this.erp.processedFabricStockMeters();
    const sold = this.erp.fabricSoldMeters();
    return Math.max(1, raw + mill + proc + sold);
  }

  getPercent(val: number, total: number): number {
    return Math.min(100, Math.round((val / total) * 100));
  }

  totalGarmentsSold(): number {
    return this.erp.garmentSales().reduce((sum, s) => sum + s.quantity, 0);
  }

  calculateMargin(): string {
    const sales = this.erp.totalSalesAmount();
    if (sales === 0) return '0.0';
    const profit = this.erp.estimatedGrossProfit();
    return ((profit / sales) * 100).toFixed(1);
  }

  formatMovementType(type: string): string {
    return type.replace(/_/g, ' ');
  }
}
