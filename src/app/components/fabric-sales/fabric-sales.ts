import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';
import { FabricSale } from '../../models/erp.types';

@Component({
  selector: 'app-fabric-sales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Direct Processed Fabric Wholesale Sales (Route A)
            <span class="text-xs font-normal text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">Route A Workflow</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Sell processed fabric directly to external apparel brands & retail chains without converting to garments.
          </p>
        </div>

        <button
          (click)="openSaleModal()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Fabric Sale Invoice
        </button>
      </div>

      <!-- Invoices Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Invoice #</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Customer</th>
                <th class="py-3 px-4">Fabric Item & Lot</th>
                <th class="py-3 px-4 text-right">Quantity</th>
                <th class="py-3 px-4 text-right">Sales Rate</th>
                <th class="py-3 px-4 text-right">Net Revenue</th>
                <th class="py-3 px-4 text-right">COGS (Cost)</th>
                <th class="py-3 px-4 text-right">Gross Profit</th>
                <th class="py-3 px-4 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (sale of erp.fabricSales(); track sale.id) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-sky-400">{{ sale.invoiceNo }}</td>
                  <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ sale.date }}</td>
                  <td class="py-3 px-4 font-bold text-white">{{ sale.customerName }}</td>
                  <td class="py-3 px-4">
                    <div class="font-medium text-white">{{ sale.fabricItemName }}</div>
                    <div class="text-[10px] text-indigo-400 font-mono">Lot #{{ sale.lotNo }}</div>
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    {{ sale.quantity }} {{ sale.unit }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-300">Rs. {{ sale.salesRate.toFixed(2) }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    Rs. {{ sale.netAmount.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-400">
                    Rs. {{ sale.totalCogs.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-black text-emerald-400">
                    Rs. {{ sale.grossProfit.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      (click)="viewInvoice(sale)"
                      class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium"
                    >
                      Print View
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="py-12 text-center text-slate-500">
                    No fabric sales recorded yet. Complete Step 4 in Demo Walkthrough to test Route A.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: NEW SALE INVOICE -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Issue Direct Fabric Sale Invoice (Route A)</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="form" (ngSubmit)="submitSale()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Invoice Date</label>
                  <input type="text" formControlName="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Customer</label>
                  <select formControlName="customerId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (c of erp.customers(); track c.id) {
                      <option [value]="c.id">{{ c.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Processed Fabric Item</label>
                  <select formControlName="fabricItemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (item of processedItems(); track item.id) {
                      <option [value]="item.id">{{ item.name }} (Available: {{ item.currentStock }}m)</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Lot Number</label>
                  <input type="text" formControlName="lotNo" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quantity (meters)</label>
                  <input type="number" formControlName="quantity" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Selling Rate (PKR/m)</label>
                  <input type="number" formControlName="salesRate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Discount (PKR)</label>
                  <input type="number" formControlName="discount" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Sales Tax Rate (%)</label>
                  <input type="number" formControlName="taxRate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Payment Type</label>
                  <select formControlName="paymentType" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="CREDIT">Customer Credit Receivable</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="BANK">Bank Transfer (Meezan Bank)</option>
                  </select>
                </div>
              </div>

              <!-- Computed Preview -->
              <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between text-slate-400">
                  <span>Gross Invoice Amount:</span>
                  <span class="text-white font-mono">Rs. {{ calcGross().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Estimated COGS (Cost):</span>
                  <span class="text-slate-300 font-mono">Rs. {{ calcCogs().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Projected Gross Profit:</span>
                  <span class="font-mono">Rs. {{ calcProfit().toLocaleString() }}</span>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="form.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Post Invoice & Record Profit
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: INVOICE PRINT VIEW -->
      @if (selectedInvoice()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 relative shadow-2xl">
            <div class="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <h4 class="text-lg font-bold text-white tracking-tight">TEXFLOW ERP &bull; COMMERCIAL INVOICE</h4>
                <p class="text-slate-400 text-[11px]">TexFlow Manufacturing (Pvt) Ltd &bull; NTN: 948192-3</p>
              </div>
              <button (click)="selectedInvoice.set(null)" class="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <div class="grid grid-cols-2 gap-4 py-4 border-b border-slate-800/80">
              <div>
                <div class="text-slate-500 uppercase text-[10px] font-bold">Billed To</div>
                <div class="font-bold text-white text-sm mt-0.5">{{ selectedInvoice()!.customerName }}</div>
                <div class="text-slate-400 text-[11px]">Payment Terms: {{ selectedInvoice()!.paymentType }}</div>
              </div>
              <div class="text-right">
                <div class="text-slate-500 uppercase text-[10px] font-bold">Invoice Details</div>
                <div class="font-mono font-bold text-indigo-400 text-sm mt-0.5">{{ selectedInvoice()!.invoiceNo }}</div>
                <div class="text-slate-400 font-mono">{{ selectedInvoice()!.date }}</div>
              </div>
            </div>

            <div class="py-4 space-y-2">
              <div class="flex justify-between font-semibold text-white">
                <span>{{ selectedInvoice()!.fabricItemName }} (Lot #{{ selectedInvoice()!.lotNo }})</span>
                <span class="font-mono">{{ selectedInvoice()!.quantity }} {{ selectedInvoice()!.unit }} @ Rs. {{ selectedInvoice()!.salesRate }}</span>
              </div>
              <div class="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Subtotal:</span>
                <span class="font-mono">Rs. {{ selectedInvoice()!.grossAmount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Sales Tax ({{ selectedInvoice()!.taxRate }}%):</span>
                <span class="font-mono">Rs. {{ selectedInvoice()!.taxAmount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-slate-800">
                <span>Total Net Payable:</span>
                <span class="font-mono">Rs. {{ selectedInvoice()!.netAmount.toLocaleString() }}</span>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-800 flex justify-end">
              <button (click)="selectedInvoice.set(null)" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class FabricSalesComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  showModal = signal<boolean>(false);
  selectedInvoice = signal<FabricSale | null>(null);

  form: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    customerId: ['', Validators.required],
    fabricItemId: ['', Validators.required],
    lotNo: ['', Validators.required],
    quantity: [300, [Validators.required, Validators.min(1)]],
    salesRate: [750, [Validators.required, Validators.min(1)]],
    discount: [0],
    taxRate: [5],
    paymentType: ['CREDIT', Validators.required]
  });

  processedItems = () => this.erp.products().filter(p => p.category === 'PROCESSED_FABRIC');

  openSaleModal() {
    const custs = this.erp.customers();
    const items = this.processedItems();

    this.form.patchValue({
      date: this.erp.currentDate(),
      customerId: custs.length ? custs[0].id : '',
      fabricItemId: items.length ? items[0].id : '',
      lotNo: 'LOT-C26-1001',
      quantity: 300,
      salesRate: items.length ? items[0].salesPrice : 750,
      discount: 0,
      taxRate: 5,
      paymentType: 'CREDIT'
    });

    this.showModal.set(true);
  }

  calcGross(): number {
    const qty = Number(this.form.get('quantity')?.value) || 0;
    const rate = Number(this.form.get('salesRate')?.value) || 0;
    const disc = Number(this.form.get('discount')?.value) || 0;
    return (qty * rate) - disc;
  }

  calcCogs(): number {
    const qty = Number(this.form.get('quantity')?.value) || 0;
    const itemId = this.form.get('fabricItemId')?.value;
    const item = this.erp.products().find(p => p.id === itemId);
    const unitCost = item ? item.purchasePrice : 477.86;
    return qty * unitCost;
  }

  calcProfit(): number {
    return this.calcGross() - this.calcCogs();
  }

  submitSale() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const cust = this.erp.customers().find(c => c.id === val.customerId);
    const item = this.erp.products().find(p => p.id === val.fabricItemId);

    if (!cust || !item) return;

    const sale = this.erp.createFabricSale({
      date: val.date,
      customerId: cust.id,
      customerName: cust.name,
      fabricItemId: item.id,
      fabricItemName: item.name,
      lotNo: val.lotNo,
      quantity: Number(val.quantity),
      unit: item.unit,
      salesRate: Number(val.salesRate),
      discount: Number(val.discount) || 0,
      taxRate: Number(val.taxRate) || 0,
      cogsUnitCost: item.purchasePrice,
      paymentType: val.paymentType
    });

    if (sale) {
      this.showModal.set(false);
    }
  }

  viewInvoice(sale: FabricSale) {
    this.selectedInvoice.set(sale);
  }
}
