import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Enterprise Reporting & Operational Intelligence
            <span class="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Live Calculated Data</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Real-time audit registers, lot-wise cost traceability, mill shortage losses, production yields, and customer receivables.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="exportCSV()"
            class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Active Report (CSV)
          </button>
        </div>
      </div>

      <!-- Report Selector Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs">
        @for (rep of reportTypes; track rep.id) {
          <button
            (click)="activeReport.set(rep.id)"
            [class.bg-indigo-600]="activeReport() === rep.id"
            [class.text-white]="activeReport() === rep.id"
            [class.bg-slate-900]="activeReport() !== rep.id"
            [class.text-slate-400]="activeReport() !== rep.id"
            class="px-3 py-1.5 rounded-xl border border-slate-800 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>{{ rep.name }}</span>
          </button>
        }
      </div>

      <!-- REPORT 1: INVENTORY VALUATION REPORT -->
      @if (activeReport() === 'inventory-val') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 class="text-sm font-bold text-white">Perpetual Inventory Valuation & Stock On-Hand</h4>
            <span class="text-xs font-mono font-bold text-emerald-400">Total Stock Value: Rs. {{ erp.totalInventoryValuation().toLocaleString() }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Item Code</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4 text-right">Current Stock</th>
                  <th class="py-3 px-4 text-right">Cost Price (PKR)</th>
                  <th class="py-3 px-4 text-right">Total Valuation (PKR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (item of erp.products(); track item.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-bold text-indigo-400">{{ item.code }}</td>
                    <td class="py-2.5 px-4 font-medium text-white">{{ item.name }}</td>
                    <td class="py-2.5 px-4 text-slate-400">{{ item.category }}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-white">{{ item.currentStock }} {{ item.unit }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-300">Rs. {{ item.purchasePrice.toFixed(2) }}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                      Rs. {{ (item.currentStock * item.purchasePrice).toLocaleString() }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- REPORT 2: PROCESSING & SHORTAGES -->
      @if (activeReport() === 'processing') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 class="text-sm font-bold text-white">External Mill Processing, Shortages & Cost Capitalization</h4>
            <span class="text-xs font-mono text-amber-400">Fabric at Mills: {{ erp.fabricAtMillsMeters() }} m</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Receipt #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Mill Name</th>
                  <th class="py-3 px-4">Fabric Item & Lot</th>
                  <th class="py-3 px-4 text-right">Dispatched</th>
                  <th class="py-3 px-4 text-right">Received</th>
                  <th class="py-3 px-4 text-right">Shortage</th>
                  <th class="py-3 px-4 text-right">Loss %</th>
                  <th class="py-3 px-4 text-right">Capitalized Unit Cost</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (r of erp.processingReceipts(); track r.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-bold text-amber-400">{{ r.receiptNo }}</td>
                    <td class="py-2.5 px-4 font-mono text-slate-400">{{ r.date }}</td>
                    <td class="py-2.5 px-4 font-bold text-white">{{ r.millName }}</td>
                    <td class="py-2.5 px-4">{{ r.processedItemName }} (Lot #{{ r.lotNo }})</td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-300">{{ r.quantitySent }} m</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">{{ r.quantityReceived }} m</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-rose-400">{{ r.wastageShortage }} m</td>
                    <td class="py-2.5 px-4 text-right font-mono text-rose-300">{{ ((r.wastageShortage / r.quantitySent) * 100).toFixed(1) }}%</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">Rs. {{ r.finalValuationUnitCost }}/m</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="py-8 text-center text-slate-500">No mill receipts recorded yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- REPORT 3: SALES & PROFITABILITY -->
      @if (activeReport() === 'profitability') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 class="text-sm font-bold text-white">Sales Invoicing & Gross Profitability Register</h4>
            <span class="text-xs font-mono font-bold text-emerald-400">Estimated Gross Margin: Rs. {{ erp.estimatedGrossProfit().toLocaleString() }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Invoice #</th>
                  <th class="py-3 px-4">Channel / Stream</th>
                  <th class="py-3 px-4">Customer</th>
                  <th class="py-3 px-4 text-right">Net Sales (PKR)</th>
                  <th class="py-3 px-4 text-right">COGS (PKR)</th>
                  <th class="py-3 px-4 text-right">Gross Profit (PKR)</th>
                  <th class="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (s of erp.fabricSales(); track s.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-bold text-sky-400">{{ s.invoiceNo }}</td>
                    <td class="py-2.5 px-4 text-slate-400">Route A: Processed Fabric</td>
                    <td class="py-2.5 px-4 font-bold text-white">{{ s.customerName }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-white">Rs. {{ s.netAmount.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-400">Rs. {{ s.totalCogs.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">Rs. {{ s.grossProfit.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-indigo-400">{{ ((s.grossProfit / s.netAmount) * 100).toFixed(1) }}%</td>
                  </tr>
                }
                @for (g of erp.garmentSales(); track g.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-bold text-teal-400">{{ g.invoiceNo }}</td>
                    <td class="py-2.5 px-4 text-slate-400">Ready-Made Garments</td>
                    <td class="py-2.5 px-4 font-bold text-white">{{ g.customerName }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-white">Rs. {{ g.netAmount.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-400">Rs. {{ g.totalCogs.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">Rs. {{ g.grossProfit.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-indigo-400">{{ ((g.grossProfit / g.netAmount) * 100).toFixed(1) }}%</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- REPORT 4: CUSTOMER OUTSTANDINGS -->
      @if (activeReport() === 'customers') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 class="text-sm font-bold text-white">Customer Receivables & Aging Ledger</h4>
            <span class="text-xs font-mono font-bold text-emerald-400">Total Outstanding: Rs. {{ erp.totalCustomerReceivables().toLocaleString() }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Customer Code</th>
                  <th class="py-3 px-4">Customer Name</th>
                  <th class="py-3 px-4">Contact Phone</th>
                  <th class="py-3 px-4 text-right">Credit Limit</th>
                  <th class="py-3 px-4 text-right">Current Balance (Receivable)</th>
                  <th class="py-3 px-4 text-center">Credit Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (c of erp.customers(); track c.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-bold text-indigo-400">{{ c.code }}</td>
                    <td class="py-2.5 px-4 font-bold text-white">{{ c.name }}</td>
                    <td class="py-2.5 px-4 text-slate-400">{{ c.phone }}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-slate-400">Rs. {{ c.creditLimit.toLocaleString() }}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                      Rs. {{ c.balance.toLocaleString() }}
                    </td>
                    <td class="py-2.5 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active Account
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class ReportsComponent {
  erp = inject(ErpStorageService);

  reportTypes = [
    { id: 'inventory-val', name: 'Inventory Valuation' },
    { id: 'processing', name: 'Mill Processing & Shortages' },
    { id: 'profitability', name: 'Sales & Profitability Register' },
    { id: 'customers', name: 'Customer Receivables' }
  ];

  activeReport = signal<string>('inventory-val');

  exportCSV() {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const rep = this.activeReport();

    if (rep === 'inventory-val') {
      csvContent += 'SKU,Item Name,Category,Unit,Current Stock,Unit Cost (PKR),Valuation (PKR)\n';
      this.erp.products().forEach(p => {
        csvContent += `"${p.code}","${p.name}","${p.category}","${p.unit}",${p.currentStock},${p.purchasePrice},${p.currentStock * p.purchasePrice}\n`;
      });
    } else if (rep === 'processing') {
      csvContent += 'Receipt No,Date,Mill Name,Item,Lot No,Sent (m),Received (m),Shortage (m),Cost Capitalized\n';
      this.erp.processingReceipts().forEach(r => {
        csvContent += `"${r.receiptNo}","${r.date}","${r.millName}","${r.processedItemName}","${r.lotNo}",${r.quantitySent},${r.quantityReceived},${r.wastageShortage},${r.finalValuationUnitCost}\n`;
      });
    } else {
      csvContent += 'Date,Type,Customer,Net Amount,COGS,Gross Profit\n';
      this.erp.fabricSales().forEach(s => {
        csvContent += `"${s.date}","Fabric Sale","${s.customerName}",${s.netAmount},${s.totalCogs},${s.grossProfit}\n`;
      });
      this.erp.garmentSales().forEach(s => {
        csvContent += `"${s.date}","Garment Sale","${s.customerName}",${s.netAmount},${s.totalCogs},${s.grossProfit}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TexFlow_Report_${rep}_${this.erp.currentDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
