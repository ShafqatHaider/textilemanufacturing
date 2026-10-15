import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            System Configuration & .NET Core / SQL Server Architecture
            <span class="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Production Ready</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            ERP settings, operational rules, local storage state management, and Clean Architecture blueprint for enterprise deployment.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="erp.runEntireScenario()"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Re-run 11-Step Scenario
          </button>

          <button
            (click)="erp.resetAllData()"
            class="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset All Records
          </button>
        </div>
      </div>

      <!-- System Specifications Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div class="font-bold text-white uppercase text-[11px] text-indigo-400">Localization & Currencies</div>
          <div class="flex justify-between text-slate-300">
            <span>Primary Currency:</span>
            <span class="font-mono font-bold text-emerald-400">PKR (Pakistani Rupee)</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Date Standard:</span>
            <span class="font-mono text-white">DD-MM-YYYY</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Measurement Units:</span>
            <span class="text-white">meters, yards, kg, pcs</span>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div class="font-bold text-white uppercase text-[11px] text-indigo-400">Accounting Rules</div>
          <div class="flex justify-between text-slate-300">
            <span>Inventory Method:</span>
            <span class="font-mono text-white">Perpetual FIFO</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Mill Cost Capitalization:</span>
            <span class="text-emerald-400 font-medium">Included in Asset Valuation</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Double-Entry Vouchers:</span>
            <span class="text-emerald-400 font-medium">Strict Debit = Credit Rule</span>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div class="font-bold text-white uppercase text-[11px] text-indigo-400">Storage & Persistence</div>
          <div class="flex justify-between text-slate-300">
            <span>Client State:</span>
            <span class="font-mono text-white">HTML5 LocalStorage</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Auto-Save:</span>
            <span class="text-emerald-400 font-medium">Active on every transaction</span>
          </div>
          <div class="flex justify-between text-slate-300">
            <span>Negative Stock Protection:</span>
            <span class="text-emerald-400 font-medium">Enforced at Source</span>
          </div>
        </div>
      </div>

      <!-- .NET Web API & SQL Server Production Migration Blueprint -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h4 class="text-base font-bold text-white flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
            .NET 8 / 9 Web API & SQL Server Enterprise Backend Schema
          </h4>
          <p class="text-xs text-slate-400 mt-1">
            The data structures and service contracts in this MVP are structured to map 1:1 to Entity Framework Core entities, DTOs, and REST API endpoints.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div class="font-bold text-indigo-300 uppercase text-[11px]">C# Controllers & Services</div>
            <ul class="text-slate-400 space-y-1 list-disc list-inside text-[11px]">
              <li><span class="text-white">FabricPurchasesController</span> &bull; PostPurchaseAsync()</li>
              <li><span class="text-white">ProcessingMillController</span> &bull; CreateChallanAsync(), ReceiveFabricAsync()</li>
              <li><span class="text-white">StockTransferController</span> &bull; PostInternalTransferAsync()</li>
              <li><span class="text-white">ProductionController</span> &bull; IssueMaterialsAsync(), CompleteOrderAsync()</li>
              <li><span class="text-white">SalesController</span> &bull; PostFabricInvoiceAsync(), PostGarmentInvoiceAsync()</li>
              <li><span class="text-white">AccountingService</span> &bull; PostBalancedJournalVoucherAsync()</li>
            </ul>
          </div>

          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div class="font-bold text-emerald-300 uppercase text-[11px]">SQL Server Relational Tables</div>
            <ul class="text-slate-400 space-y-1 list-disc list-inside text-[11px]">
              <li><span class="text-white">dbo.ProductItems</span> (Id, Code, Category, Stock, UnitCost)</li>
              <li><span class="text-white">dbo.FabricPurchases</span> (Id, PO_No, SupplierId, LotNo, Qty, Rate)</li>
              <li><span class="text-white">dbo.ProcessingChallans</span> (Id, ChallanNo, MillId, DispatchedQty)</li>
              <li><span class="text-white">dbo.ProcessingReceipts</span> (Id, ShortageQty, CapitalizedCost)</li>
              <li><span class="text-white">dbo.BOMs & dbo.BOMComponents</span> (BOMId, ItemId, Qty, Wastage)</li>
              <li><span class="text-white">dbo.JournalEntries & dbo.JournalLines</span> (Debit, Credit, Balanced)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  erp = inject(ErpStorageService);
}
