import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';
import { GarmentSale } from '../../models/erp.types';

@Component({
  selector: 'app-finished-goods',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Ready-Made Garments Inventory & Commercial Invoicing
            <span class="text-xs font-normal text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">Steps 9 & 10</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Monitor finished cut-and-sewn apparel stock in factory warehouse and issue retail/wholesale garment sales invoices.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="activeTab.set('inventory')"
            [class.bg-slate-800]="activeTab() === 'inventory'"
            [class.text-white]="activeTab() === 'inventory'"
            [class.text-slate-400]="activeTab() !== 'inventory'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            Finished Stock
          </button>

          <button
            (click)="activeTab.set('sales')"
            [class.bg-slate-800]="activeTab() === 'sales'"
            [class.text-white]="activeTab() === 'sales'"
            [class.text-slate-400]="activeTab() !== 'sales'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            Garment Invoices ({{ erp.garmentSales().length }})
          </button>

          <button
            (click)="openSaleModal()"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Sell Finished Garments
          </button>
        </div>
      </div>

      <!-- TAB 1: INVENTORY -->
      @if (activeTab() === 'inventory') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">SKU / Code</th>
                  <th class="py-3 px-4">Product Name & Design</th>
                  <th class="py-3 px-4">Size & Color</th>
                  <th class="py-3 px-4">Warehouse</th>
                  <th class="py-3 px-4 text-right">Production Cost / Unit</th>
                  <th class="py-3 px-4 text-right">Selling Price</th>
                  <th class="py-3 px-4 text-right">Available Stock</th>
                  <th class="py-3 px-4 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (item of garmentItems(); track item.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-teal-400">{{ item.code }}</td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ item.name }}</div>
                      <div class="text-[11px] text-slate-400">{{ item.design || 'Executive Cut' }}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-300">
                      {{ item.size || 'Medium (40)' }} &bull; {{ item.color || 'Navy' }}
                    </td>
                    <td class="py-3 px-4 text-slate-400">Garment Factory WH</td>
                    <td class="py-3 px-4 text-right font-mono font-medium text-slate-200">
                      Rs. {{ item.purchasePrice.toFixed(2) }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      Rs. {{ item.salesPrice.toFixed(2) }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-black text-white text-sm">
                      {{ item.currentStock }} pcs
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-teal-300">
                      Rs. {{ (item.currentStock * item.purchasePrice).toLocaleString() }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="py-12 text-center text-slate-500">
                      No ready-made garments in stock. Follow Steps 6 to 9 in the Demo scenario.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: GARMENT SALES INVOICES -->
      @if (activeTab() === 'sales') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Invoice #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Customer</th>
                  <th class="py-3 px-4">Garment</th>
                  <th class="py-3 px-4 text-right">Quantity</th>
                  <th class="py-3 px-4 text-right">Rate</th>
                  <th class="py-3 px-4 text-right">Net Revenue</th>
                  <th class="py-3 px-4 text-right">COGS</th>
                  <th class="py-3 px-4 text-right">Gross Profit</th>
                  <th class="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (sale of erp.garmentSales(); track sale.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-teal-400">{{ sale.invoiceNo }}</td>
                    <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ sale.date }}</td>
                    <td class="py-3 px-4 font-bold text-white">{{ sale.customerName }}</td>
                    <td class="py-3 px-4">
                      <div class="font-medium text-white">{{ sale.garmentName }}</div>
                      <div class="text-[10px] text-slate-400">{{ sale.size }} &bull; {{ sale.color }}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">
                      {{ sale.quantity }} pcs
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
                        (click)="selectedInvoice.set(sale)"
                        class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px]"
                      >
                        Print View
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="10" class="py-12 text-center text-slate-500">
                      No garment sales invoices yet. Complete Step 10 in the Demo scenario.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: SELL GARMENTS -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Issue Ready-Made Garment Sales Invoice</h3>
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
                <label class="block text-slate-400 mb-1">Garment Item</label>
                <select formControlName="garmentItemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  @for (item of garmentItems(); track item.id) {
                    <option [value]="item.id">{{ item.name }} (Available: {{ item.currentStock }} pcs) - Cost: Rs. {{ item.purchasePrice }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quantity (pcs)</label>
                  <input type="number" formControlName="quantity" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Sales Rate (PKR / piece)</label>
                  <input type="number" formControlName="salesRate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Discount (Total PKR)</label>
                  <input type="number" formControlName="discount" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Sales Tax (%)</label>
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

              <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between text-slate-400">
                  <span>Gross Sales:</span>
                  <span class="text-white font-mono">Rs. {{ calcGross().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>COGS:</span>
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
                  Post Garment Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: PRINT INVOICE -->
      @if (selectedInvoice()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-xs text-slate-300 relative shadow-2xl">
            <div class="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <h4 class="text-lg font-bold text-white tracking-tight">TEXFLOW ERP &bull; GARMENT SALES INVOICE</h4>
                <p class="text-slate-400 text-[11px]">Factory Direct &bull; Ready-Made Apparel Division</p>
              </div>
              <button (click)="selectedInvoice.set(null)" class="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <div class="grid grid-cols-2 gap-4 py-4 border-b border-slate-800/80">
              <div>
                <div class="text-slate-500 uppercase text-[10px] font-bold">Customer</div>
                <div class="font-bold text-white text-sm mt-0.5">{{ selectedInvoice()!.customerName }}</div>
                <div class="text-slate-400 text-[11px]">Terms: {{ selectedInvoice()!.paymentType }}</div>
              </div>
              <div class="text-right">
                <div class="text-slate-500 uppercase text-[10px] font-bold">Invoice Ref</div>
                <div class="font-mono font-bold text-teal-400 text-sm mt-0.5">{{ selectedInvoice()!.invoiceNo }}</div>
                <div class="text-slate-400 font-mono">{{ selectedInvoice()!.date }}</div>
              </div>
            </div>

            <div class="py-4 space-y-2">
              <div class="flex justify-between font-semibold text-white">
                <span>{{ selectedInvoice()!.garmentName }} ({{ selectedInvoice()!.size }}, {{ selectedInvoice()!.color }})</span>
                <span class="font-mono">{{ selectedInvoice()!.quantity }} pcs @ Rs. {{ selectedInvoice()!.salesRate }}</span>
              </div>
              <div class="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Gross:</span>
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
export class FinishedGoodsComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);

  activeTab = signal<'inventory' | 'sales'>('inventory');
  showModal = signal<boolean>(false);
  selectedInvoice = signal<GarmentSale | null>(null);

  form: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    customerId: ['', Validators.required],
    garmentItemId: ['', Validators.required],
    quantity: [150, [Validators.required, Validators.min(1)]],
    salesRate: [2450, [Validators.required, Validators.min(1)]],
    discount: [5000],
    taxRate: [5],
    paymentType: ['CREDIT', Validators.required]
  });

  garmentItems = () => this.erp.products().filter(p => p.category === 'FINISHED_GARMENT');

  openSaleModal() {
    const custs = this.erp.customers();
    const garments = this.garmentItems();

    this.form.patchValue({
      date: this.erp.currentDate(),
      customerId: custs.length ? custs[1]?.id || custs[0].id : '',
      garmentItemId: garments.length ? garments[0].id : '',
      quantity: 150,
      salesRate: garments.length ? garments[0].salesPrice : 2450,
      discount: 5000,
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
    const itemId = this.form.get('garmentItemId')?.value;
    const item = this.erp.products().find(p => p.id === itemId);
    const cost = item ? item.purchasePrice : 1220.23;
    return qty * cost;
  }

  calcProfit(): number {
    return this.calcGross() - this.calcCogs();
  }

  submitSale() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const cust = this.erp.customers().find(c => c.id === val.customerId);
    const item = this.erp.products().find(p => p.id === val.garmentItemId);

    if (!cust || !item) return;

    const sale = this.erp.createGarmentSale({
      date: val.date,
      customerId: cust.id,
      customerName: cust.name,
      garmentItemId: item.id,
      garmentName: item.name,
      styleName: item.design || 'Executive Slim Fit',
      size: item.size || 'Medium (40)',
      color: item.color || 'Navy Blue',
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
      this.activeTab.set('sales');
    }
  }
}
