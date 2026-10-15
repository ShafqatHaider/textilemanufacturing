import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-raw-materials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Garment Factory Raw Materials & Trims Inventory
            <span class="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Factory Floor Stock</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Monitor factory stock of transferred fabrics, buttons, threads, labels, and packaging consumed during garment production.
          </p>
        </div>
      </div>

      <!-- Factory Stock Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">SKU / Code</th>
                <th class="py-3 px-4">Material / Accessory Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4 text-center">Unit</th>
                <th class="py-3 px-4 text-right">Unit Cost (PKR)</th>
                <th class="py-3 px-4 text-right">Factory Warehouse Stock</th>
                <th class="py-3 px-4 text-right">Total Inventory Value</th>
                <th class="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (item of factoryMaterials(); track item.id) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-indigo-400">{{ item.code }}</td>
                  <td class="py-3 px-4 font-bold text-white">{{ item.name }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {{ item.category === 'PROCESSED_FABRIC' ? 'Transferred Fabric' : 'Trims & Accessory' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono">{{ item.unit }}</td>
                  <td class="py-3 px-4 text-right font-mono text-slate-300">Rs. {{ item.purchasePrice.toFixed(2) }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    {{ getFactoryStock(item.id) }} {{ item.unit }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rs. {{ (getFactoryStock(item.id) * item.purchasePrice).toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    @if (getFactoryStock(item.id) === 0) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300">Depleted</span>
                    } @else if (getFactoryStock(item.id) < item.minStockLevel) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300">Low Stock</span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">Available</span>
                    }
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
export class RawMaterialsComponent {
  erp = inject(ErpStorageService);

  factoryMaterials = () => {
    return this.erp.products().filter(p => 
      p.category === 'TRIMS_ACCESSORIES' || p.category === 'PROCESSED_FABRIC' || p.category === 'RAW_MATERIAL'
    );
  };

  getFactoryStock(itemId: string): number {
    return this.erp.getWarehouseStock('WH-002', itemId);
  }
}
