import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-fabric-purchase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Raw Fabric Procurement Register
            <span class="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Step 1 of Manufacturing Workflow</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Purchase greige/raw fabric with lot tracking, stock capitalization, and automatic double-entry payables voucher.
          </p>
        </div>

        <button
          (click)="openPurchaseModal()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Fabric Purchase
        </button>
      </div>

      <!-- Purchases List -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">PO Number</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Supplier</th>
                <th class="py-3 px-4">Fabric Item & Specs</th>
                <th class="py-3 px-4">Lot #</th>
                <th class="py-3 px-4 text-right">Quantity</th>
                <th class="py-3 px-4 text-right">Rate (PKR)</th>
                <th class="py-3 px-4 text-right">Total Amount (PKR)</th>
                <th class="py-3 px-4 text-center">Payment Status</th>
                <th class="py-3 px-4 text-center">Voucher</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (po of erp.fabricPurchases(); track po.id) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-indigo-400">{{ po.purchaseNo }}</td>
                  <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ po.date }}</td>
                  <td class="py-3 px-4 font-bold text-white">{{ po.supplierName }}</td>
                  <td class="py-3 px-4">
                    <div class="font-medium text-white">{{ po.fabricItemName }}</div>
                    <div class="text-[11px] text-slate-400">{{ po.fabricType }} &bull; {{ po.color }}</div>
                  </td>
                  <td class="py-3 px-4 font-mono font-semibold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded">
                    {{ po.lotNo }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    {{ po.quantity.toLocaleString() }} {{ po.unit }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-300">Rs. {{ po.rate.toFixed(2) }}</td>
                  <td class="py-3 px-4 text-right font-mono font-black text-emerald-400">
                    Rs. {{ po.totalAmount.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      [class.bg-rose-500/20]="po.paymentStatus === 'UNPAID'"
                      [class.text-rose-300]="po.paymentStatus === 'UNPAID'"
                      [class.bg-emerald-500/20]="po.paymentStatus === 'PAID'"
                      [class.text-emerald-300]="po.paymentStatus === 'PAID'"
                    >
                      {{ po.paymentStatus }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Posted
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="py-12 text-center text-slate-500">
                    No fabric purchases recorded yet. Click "New Fabric Purchase" or run Step 1 in the Demo Banner.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: NEW PURCHASE ENTRY -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 class="text-base font-bold text-white">Record Raw Fabric Purchase</h3>
                <p class="text-xs text-slate-400">Posts inventory to Central Warehouse & creates AP journal voucher.</p>
              </div>
              <button (click)="showModal.set(false)" class="text-slate-400 hover:text-white text-xl">&times;</button>
            </div>

            <form [formGroup]="form" (ngSubmit)="submitPurchase()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Purchase Date</label>
                  <input type="text" formControlName="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-slate-400 mb-1">Supplier</label>
                  <select formControlName="supplierId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (s of erp.suppliers(); track s.id) {
                      <option [value]="s.id">{{ s.name }} ({{ s.code }})</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Raw Fabric Item</label>
                  <select formControlName="fabricItemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (item of rawFabricItems(); track item.id) {
                      <option [value]="item.id">{{ item.name }} ({{ item.code }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Lot Number / Batch</label>
                  <input type="text" formControlName="lotNo" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quantity (meters/yds/kg)</label>
                  <input type="number" formControlName="quantity" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Unit</label>
                  <select formControlName="unit" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="meters">meters</option>
                    <option value="yards">yards</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Rate per Unit (PKR)</label>
                  <input type="number" formControlName="rate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Discount (PKR)</label>
                  <input type="number" formControlName="discount" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Additional Freight</label>
                  <input type="number" formControlName="additionalCharges" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Tax Rate (%)</label>
                  <input type="number" formControlName="taxRate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Receiving Warehouse</label>
                  <select formControlName="warehouseId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (w of erp.warehouses(); track w.id) {
                      <option [value]="w.id">{{ w.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Payment Status</label>
                  <select formControlName="paymentStatus" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="UNPAID">Unpaid (Credit Supplier Payable)</option>
                    <option value="PAID">Paid in Full (Cash/Bank)</option>
                  </select>
                </div>
              </div>

              <!-- Computed Preview Box -->
              <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between text-slate-400">
                  <span>Gross Fabric Amount:</span>
                  <span class="text-white font-mono font-medium">Rs. {{ computedGross().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Tax Amount:</span>
                  <span class="text-white font-mono">Rs. {{ computedTax().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span class="font-mono">Rs. {{ computedTotal().toLocaleString() }}</span>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="form.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Post Purchase & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class FabricPurchaseComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  showModal = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    supplierId: ['', Validators.required],
    fabricItemId: ['', Validators.required],
    lotNo: ['', Validators.required],
    quantity: [1000, [Validators.required, Validators.min(1)]],
    unit: ['meters', Validators.required],
    rate: [380, [Validators.required, Validators.min(1)]],
    discount: [0],
    additionalCharges: [0],
    taxRate: [0],
    warehouseId: ['WH-001', Validators.required],
    paymentStatus: ['UNPAID', Validators.required],
    notes: ['']
  });

  rawFabricItems = () => {
    return this.erp.products().filter(p => p.category === 'RAW_FABRIC');
  };

  openPurchaseModal() {
    const rawItems = this.rawFabricItems();
    const suppliers = this.erp.suppliers();
    const randomLot = 'LOT-C26-' + Math.floor(1000 + Math.random() * 9000);

    this.form.patchValue({
      date: this.erp.currentDate(),
      supplierId: suppliers.length ? suppliers[0].id : '',
      fabricItemId: rawItems.length ? rawItems[0].id : '',
      lotNo: randomLot,
      quantity: 1000,
      unit: 'meters',
      rate: rawItems.length ? rawItems[0].purchasePrice : 380,
      discount: 0,
      additionalCharges: 0,
      taxRate: 0,
      warehouseId: 'WH-001',
      paymentStatus: 'UNPAID',
      notes: ''
    });

    this.showModal.set(true);
  }

  computedGross(): number {
    const qty = Number(this.form.get('quantity')?.value) || 0;
    const rate = Number(this.form.get('rate')?.value) || 0;
    const disc = Number(this.form.get('discount')?.value) || 0;
    const add = Number(this.form.get('additionalCharges')?.value) || 0;
    return (qty * rate) - disc + add;
  }

  computedTax(): number {
    const gross = this.computedGross();
    const taxRate = Number(this.form.get('taxRate')?.value) || 0;
    return (gross * taxRate) / 100;
  }

  computedTotal(): number {
    return this.computedGross() + this.computedTax();
  }

  submitPurchase() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const supplier = this.erp.suppliers().find(s => s.id === val.supplierId);
    const fabricItem = this.erp.products().find(p => p.id === val.fabricItemId);

    if (!supplier || !fabricItem) return;

    this.erp.createFabricPurchase({
      date: val.date,
      supplierId: supplier.id,
      supplierName: supplier.name,
      fabricItemId: fabricItem.id,
      fabricItemName: fabricItem.name,
      fabricType: fabricItem.composition || 'Cotton Greige',
      color: fabricItem.color || 'Natural',
      design: fabricItem.design || 'Plain',
      lotNo: val.lotNo,
      quantity: Number(val.quantity),
      unit: val.unit,
      rate: Number(val.rate),
      discount: Number(val.discount) || 0,
      additionalCharges: Number(val.additionalCharges) || 0,
      taxRate: Number(val.taxRate) || 0,
      paidAmount: val.paymentStatus === 'PAID' ? this.computedTotal() : 0,
      paymentStatus: val.paymentStatus,
      paymentAccountCode: val.paymentStatus === 'PAID' ? '1010' : undefined,
      warehouseId: val.warehouseId,
      notes: val.notes
    });

    this.showModal.set(false);
  }
}
