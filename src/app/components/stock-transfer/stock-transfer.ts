import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-stock-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Internal Stock Transfer to Factory (Route B)
            <span class="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Route B Workflow</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Transfer processed fabric from Central Warehouse to Garment Factory Warehouse at cost with zero revenue recognition.
          </p>
        </div>

        <button
          (click)="openTransferModal()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transfer Fabric to Factory
        </button>
      </div>

      <!-- Transfers List -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Transfer #</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Origin Warehouse</th>
                <th class="py-3 px-4">Destination Factory</th>
                <th class="py-3 px-4">Fabric Item & Lot</th>
                <th class="py-3 px-4 text-right">Quantity</th>
                <th class="py-3 px-4 text-right">Preserved Unit Cost</th>
                <th class="py-3 px-4 text-right">Total Transferred Value</th>
                <th class="py-3 px-4 text-center">Accounting Impact</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (tr of erp.stockTransfers(); track tr.id) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-emerald-400">{{ tr.transferNo }}</td>
                  <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ tr.date }}</td>
                  <td class="py-3 px-4 text-slate-300">{{ tr.sourceWarehouseName }}</td>
                  <td class="py-3 px-4 font-bold text-white">{{ tr.destinationWarehouseName }}</td>
                  <td class="py-3 px-4">
                    <div class="font-bold text-white">{{ tr.itemName }}</div>
                    <div class="text-[10px] text-indigo-400 font-mono">Lot #{{ tr.lotNo }}</div>
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    {{ tr.quantity }} {{ tr.unit }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-300">Rs. {{ tr.unitCost.toFixed(2) }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rs. {{ tr.totalValue.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Zero Profit / At Cost
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="py-12 text-center text-slate-500">
                    No factory transfers yet. Complete Step 5 in the Demo scenario or transfer fabric to factory warehouse.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: NEW TRANSFER -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 class="text-base font-bold text-white">Issue Stock Transfer to Factory</h3>
                <p class="text-xs text-slate-400">Transfers fabric into Garment Factory inventory ready for BOM cutting.</p>
              </div>
              <button (click)="showModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="form" (ngSubmit)="submitTransfer()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Transfer Date</label>
                  <input type="text" formControlName="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Lot Number</label>
                  <input type="text" formControlName="lotNo" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Source Warehouse (Central)</label>
                  <select formControlName="sourceWarehouseId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="WH-001">Central Raw & Fabric Warehouse</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Destination Factory</label>
                  <select formControlName="destinationWarehouseId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="WH-002">Garment Factory Warehouse (SITE/Korangi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-slate-400 mb-1">Fabric Item to Transfer</label>
                <select formControlName="itemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  @for (p of processedItems(); track p.id) {
                    <option [value]="p.id">{{ p.name }} (Available: {{ p.currentStock }}m)</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quantity (meters)</label>
                  <input type="number" formControlName="quantity" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Notes / Purpose</label>
                  <input type="text" formControlName="notes" placeholder="e.g. Allocation for Men Dress Shirt batch" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="form.invalid" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Execute Stock Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class StockTransferComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  showModal = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    sourceWarehouseId: ['WH-001', Validators.required],
    destinationWarehouseId: ['WH-002', Validators.required],
    itemId: ['', Validators.required],
    lotNo: ['LOT-C26-1001', Validators.required],
    quantity: [500, [Validators.required, Validators.min(1)]],
    notes: ['Internal transfer for garment production program']
  });

  processedItems = () => this.erp.products().filter(p => p.category === 'PROCESSED_FABRIC');

  openTransferModal() {
    const items = this.processedItems();
    this.form.patchValue({
      date: this.erp.currentDate(),
      sourceWarehouseId: 'WH-001',
      destinationWarehouseId: 'WH-002',
      itemId: items.length ? items[0].id : '',
      lotNo: 'LOT-C26-1001',
      quantity: 500,
      notes: 'Transfer for Men Shirt Program'
    });
    this.showModal.set(true);
  }

  submitTransfer() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const item = this.erp.products().find(p => p.id === val.itemId);
    const src = this.erp.warehouses().find(w => w.id === val.sourceWarehouseId);
    const dest = this.erp.warehouses().find(w => w.id === val.destinationWarehouseId);

    if (!item || !src || !dest) return;

    const transfer = this.erp.createStockTransfer({
      date: val.date,
      sourceWarehouseId: src.id,
      sourceWarehouseName: src.name,
      destinationWarehouseId: dest.id,
      destinationWarehouseName: dest.name,
      itemId: item.id,
      itemName: item.name,
      lotNo: val.lotNo,
      quantity: Number(val.quantity),
      unit: item.unit,
      unitCost: item.purchasePrice,
      notes: val.notes
    });

    if (transfer) {
      this.showModal.set(false);
    }
  }
}
