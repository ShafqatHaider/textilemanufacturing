import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-other-sales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Other Commercial & Trading Item Sales
            <span class="text-xs font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Direct Trading Sales</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Sell non-manufactured items, designer embroidered patches, surplus trims, or accessories with multi-line invoices without BOM requirements.
          </p>
        </div>

        <button
          (click)="openSaleModal()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Trading Sales Invoice
        </button>
      </div>

      <!-- Invoices List -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Invoice #</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Customer</th>
                <th class="py-3 px-4">Items Summary</th>
                <th class="py-3 px-4 text-right">Subtotal</th>
                <th class="py-3 px-4 text-right">Tax Total</th>
                <th class="py-3 px-4 text-right">Net Amount</th>
                <th class="py-3 px-4 text-right">COGS</th>
                <th class="py-3 px-4 text-right">Gross Profit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (sale of erp.otherItemSales(); track sale.id) {
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono font-bold text-purple-400">{{ sale.invoiceNo }}</td>
                  <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ sale.date }}</td>
                  <td class="py-3 px-4 font-bold text-white">{{ sale.customerName }}</td>
                  <td class="py-3 px-4">
                    @for (item of sale.items; track item.itemId) {
                      <div class="text-white">{{ item.itemName }} &bull; {{ item.quantity }} {{ item.unit }} @ Rs. {{ item.rate }}</div>
                    }
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-300">Rs. {{ sale.subtotal.toLocaleString() }}</td>
                  <td class="py-3 px-4 text-right font-mono text-slate-400">Rs. {{ sale.taxTotal.toLocaleString() }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold text-white">
                    Rs. {{ sale.netAmount.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-slate-400">
                    Rs. {{ sale.totalCogs.toLocaleString() }}
                  </td>
                  <td class="py-3 px-4 text-right font-mono font-black text-emerald-400">
                    Rs. {{ sale.grossProfit.toLocaleString() }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="py-12 text-center text-slate-500">
                    No trading sales invoices recorded yet. Click "New Trading Sales Invoice" to issue one.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: NEW TRADING SALE -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">New Trading Sales Invoice</h3>
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

              <div>
                <label class="block text-slate-400 mb-1">Trading Item</label>
                <select formControlName="itemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  @for (item of tradingItems(); track item.id) {
                    <option [value]="item.id">{{ item.name }} (In Stock: {{ item.currentStock }} {{ item.unit }}) - Rate: Rs. {{ item.salesPrice }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quantity</label>
                  <input type="number" formControlName="quantity" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Rate (PKR)</label>
                  <input type="number" formControlName="rate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Discount (PKR)</label>
                  <input type="number" formControlName="discount" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Tax Rate (%)</label>
                  <input type="number" formControlName="taxRate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Payment Method</label>
                  <select formControlName="paymentType" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="CREDIT">Customer Credit</option>
                    <option value="CASH">Cash in Hand</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="form.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Post Trading Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class OtherSalesComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  showModal = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    customerId: ['', Validators.required],
    itemId: ['', Validators.required],
    quantity: [100, [Validators.required, Validators.min(1)]],
    rate: [320, [Validators.required, Validators.min(1)]],
    discount: [0],
    taxRate: [5],
    paymentType: ['CREDIT', Validators.required]
  });

  tradingItems = () => this.erp.products().filter(p => p.category === 'OTHER_TRADING');

  openSaleModal() {
    const custs = this.erp.customers();
    const items = this.tradingItems();

    this.form.patchValue({
      date: this.erp.currentDate(),
      customerId: custs.length ? custs[2]?.id || custs[0].id : '',
      itemId: items.length ? items[0].id : '',
      quantity: 100,
      rate: items.length ? items[0].salesPrice : 320,
      discount: 0,
      taxRate: 5,
      paymentType: 'CREDIT'
    });

    this.showModal.set(true);
  }

  submitSale() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const cust = this.erp.customers().find(c => c.id === val.customerId);
    const item = this.erp.products().find(p => p.id === val.itemId);

    if (!cust || !item) return;

    const sale = this.erp.createOtherItemSale({
      date: val.date,
      customerId: cust.id,
      customerName: cust.name,
      items: [
        {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          quantity: Number(val.quantity),
          unit: item.unit,
          rate: Number(val.rate),
          discount: Number(val.discount) || 0,
          taxRate: Number(val.taxRate) || 0,
          total: (Number(val.quantity) * Number(val.rate)) - (Number(val.discount) || 0),
          cogsUnitCost: item.purchasePrice
        }
      ],
      paymentType: val.paymentType
    });

    if (sale) {
      this.showModal.set(false);
    }
  }
}
