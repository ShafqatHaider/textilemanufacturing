import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-fabric-inventory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Top Metrics Ribbon -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw Greige Fabric Stock</div>
          <div class="mt-2 text-2xl font-black text-white font-mono">
            {{ totalRawMeters().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-1 text-xs text-slate-500">Stored at Central Warehouse</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Fabric Held at External Mills</div>
          <div class="mt-2 text-2xl font-black text-amber-400 font-mono">
            {{ erp.fabricAtMillsMeters().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-1 text-xs text-slate-500">In Dyeing / Printing / Sanforizing</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Processed & Ready Fabric Stock</div>
          <div class="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {{ erp.processedFabricStockMeters().toLocaleString() }} <span class="text-xs text-slate-400 font-sans font-normal">meters</span>
          </div>
          <div class="mt-1 text-xs text-slate-500">Available for Wholesale Sale or Garments</div>
        </div>
      </div>

      <!-- Lot-Wise Breakdown Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white">Fabric Inventory by Lot & Location</h3>
            <p class="text-xs text-slate-400">Granular lot traceability with perpetual FIFO cost valuation</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Warehouse / Location</th>
                <th class="py-3 px-4">Fabric Item</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Lot #</th>
                <th class="py-3 px-4 text-right">Quantity</th>
                <th class="py-3 px-4 text-right">Unit Valuation (PKR)</th>
                <th class="py-3 px-4 text-right">Total Inventory Value</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (stk of fabricWarehouseStocks(); track stk.warehouseId + stk.itemId + stk.lotNo) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-medium text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" [class.bg-indigo-400]="stk.warehouseId === 'WH-001'" [class.bg-amber-400]="stk.warehouseId === 'WH-MILL'" [class.bg-emerald-400]="stk.warehouseId === 'WH-002'"></span>
                    {{ stk.warehouseName }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-white">{{ stk.itemName }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-semibold"
                      [class.bg-slate-800]="stk.category === 'RAW_FABRIC'"
                      [class.text-slate-300]="stk.category === 'RAW_FABRIC'"
                      [class.bg-emerald-500/10]="stk.category === 'PROCESSED_FABRIC'"
                      [class.text-emerald-300]="stk.category === 'PROCESSED_FABRIC'"
                    >
                      {{ stk.category === 'RAW_FABRIC' ? 'Raw Greige' : 'Processed' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono font-semibold text-amber-400">
                    {{ stk.lotNo || 'General' }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    {{ stk.quantity.toLocaleString() }} {{ stk.unit }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-300">
                    Rs. {{ stk.unitCost.toFixed(2) }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rs. {{ stk.totalValue.toLocaleString() }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-500">
                    No fabric lots in stock. Follow Step 1 in Demo Banner to purchase raw fabric.
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
export class FabricInventoryComponent {
  erp = inject(ErpStorageService);

  totalRawMeters(): number {
    return this.erp.products()
      .filter(p => p.category === 'RAW_FABRIC')
      .reduce((sum, p) => sum + p.currentStock, 0);
  }

  fabricWarehouseStocks = () => {
    return this.erp.warehouseStocks().filter(s => 
      s.category === 'RAW_FABRIC' || s.category === 'PROCESSED_FABRIC'
    );
  };
}
