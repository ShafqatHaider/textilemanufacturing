import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';
import { ProcessingChallan } from '../../models/erp.types';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-processing-mill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            External Processing Mill Management & Job-Work
            <span class="text-xs font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">Steps 2 & 3 of Manufacturing Workflow</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Dispatch raw fabric for dyeing, printing, or washing. Track mill inventory, shortages, and capitalize processing costs into finished fabric valuation.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="activeTab.set('challans')"
            [class.bg-slate-800]="activeTab() === 'challans'"
            [class.text-white]="activeTab() === 'challans'"
            [class.text-slate-400]="activeTab() !== 'challans'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            Challans Dispatched ({{ erp.processingChallans().length }})
          </button>

          <button
            (click)="activeTab.set('receipts')"
            [class.bg-slate-800]="activeTab() === 'receipts'"
            [class.text-white]="activeTab() === 'receipts'"
            [class.text-slate-400]="activeTab() !== 'receipts'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            Processed Receipts ({{ erp.processingReceipts().length }})
          </button>

          <button
            (click)="openChallanModal()"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Dispatch to Mill
          </button>
        </div>
      </div>

      <!-- TAB 1: CHALLANS -->
      @if (activeTab() === 'challans') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Challan #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Processing Mill</th>
                  <th class="py-3 px-4">Fabric Item & Lot</th>
                  <th class="py-3 px-4">Operation</th>
                  <th class="py-3 px-4 text-right">Qty Sent</th>
                  <th class="py-3 px-4 text-right">Qty Received</th>
                  <th class="py-3 px-4 text-right">Shortage</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (ch of erp.processingChallans(); track ch.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-amber-400">{{ ch.challanNo }}</td>
                    <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ ch.date }}</td>
                    <td class="py-3 px-4 font-bold text-white">{{ ch.millName }}</td>
                    <td class="py-3 px-4">
                      <div class="font-medium text-white">{{ ch.fabricItemName }}</div>
                      <div class="text-[10px] text-indigo-400 font-mono">Lot #{{ ch.lotNo }}</div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {{ ch.processingType }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">
                      {{ ch.quantityDispatched.toLocaleString() }} {{ ch.unit }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-400">
                      {{ ch.quantityReceivedTotal.toLocaleString() }} {{ ch.unit }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-rose-400">
                      {{ ch.quantityShortageTotal }} {{ ch.unit }}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span 
                        class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        [class.bg-amber-500/20]="ch.status === 'Dispatched'"
                        [class.text-amber-300]="ch.status === 'Dispatched'"
                        [class.bg-sky-500/20]="ch.status === 'Partially Received'"
                        [class.text-sky-300]="ch.status === 'Partially Received'"
                        [class.bg-emerald-500/20]="ch.status === 'Completed'"
                        [class.text-emerald-300]="ch.status === 'Completed'"
                      >
                        {{ ch.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      @if (ch.status === 'Dispatched' || ch.status === 'Partially Received') {
                        <button
                          (click)="openReceiveModal(ch)"
                          class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Receive Fabric
                        </button>
                      } @else {
                        <span class="text-slate-500 text-[11px]">&mdash;</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="10" class="py-12 text-center text-slate-500">
                      No mill dispatch challans recorded yet. Click "Dispatch to Mill" or execute Step 2 in Demo Walkthrough.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: RECEIPTS -->
      @if (activeTab() === 'receipts') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Receipt #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Challan Ref</th>
                  <th class="py-3 px-4">Processing Mill</th>
                  <th class="py-3 px-4">Processed Product</th>
                  <th class="py-3 px-4 text-right">Sent / Recv</th>
                  <th class="py-3 px-4 text-right">Shortage</th>
                  <th class="py-3 px-4 text-right">Mill Charges</th>
                  <th class="py-3 px-4 text-right">Capitalized Unit Cost</th>
                  <th class="py-3 px-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (rc of erp.processingReceipts(); track rc.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-emerald-400">{{ rc.receiptNo }}</td>
                    <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ rc.date }}</td>
                    <td class="py-3 px-4 font-mono text-slate-300">{{ rc.challanNo }}</td>
                    <td class="py-3 px-4 font-medium text-white">{{ rc.millName }}</td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ rc.processedItemName }}</div>
                      <div class="text-[10px] text-indigo-400 font-mono">Lot #{{ rc.lotNo }}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono">
                      <span class="text-slate-400">{{ rc.quantitySent }}m &rarr;</span>
                      <span class="font-bold text-emerald-400 ml-1">{{ rc.quantityReceived }}m</span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {{ rc.wastageShortage }}m
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-300">
                      Rs. {{ rc.totalProcessingCost.toLocaleString() }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-300">
                      Rs. {{ rc.finalValuationUnitCost }}/m
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {{ rc.qualityGrade }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="10" class="py-12 text-center text-slate-500">
                      No processed receipts yet. Complete Step 3 in the Demo scenario or receive against a dispatched challan.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: DISPATCH CHALLAN -->
      @if (showChallanModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Create Processing Job Challan</h3>
              <button (click)="showChallanModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="challanForm" (ngSubmit)="submitChallan()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Challan Date</label>
                  <input type="text" formControlName="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Processing Mill</label>
                  <select formControlName="millId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (m of erp.mills(); track m.id) {
                      <option [value]="m.id">{{ m.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Raw Fabric Item</label>
                  <select formControlName="fabricItemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (item of rawItems(); track item.id) {
                      <option [value]="item.id">{{ item.name }} (Stock: {{ item.currentStock }}m)</option>
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
                  <label class="block text-slate-400 mb-1">Quantity Dispatched</label>
                  <input type="number" formControlName="quantityDispatched" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Processing Operation</label>
                  <select formControlName="processingType" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="Dyeing">Reactive Dyeing</option>
                    <option value="Printing">Rotary Printing</option>
                    <option value="Washing">Enzyme Washing</option>
                    <option value="Finishing">Sanforizing / Finishing</option>
                    <option value="Combined">Dyeing & Soft Finish</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Processing Rate (PKR/m)</label>
                  <input type="number" formControlName="processingRate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Source Warehouse</label>
                  <select formControlName="sourceWarehouseId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (w of centralWarehouses(); track w.id) {
                      <option [value]="w.id">{{ w.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Expected Return Date</label>
                  <input type="text" formControlName="expectedReturnDate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showChallanModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="challanForm.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Dispatch Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: RECEIVE PROCESSED FABRIC -->
      @if (showReceiveModal() && selectedChallan()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 class="text-base font-bold text-white">Receive Fabric from {{ selectedChallan()!.millName }}</h3>
                <p class="text-xs text-slate-400">Against Challan {{ selectedChallan()!.challanNo }} (Dispatched: {{ selectedChallan()!.quantityDispatched }}m)</p>
              </div>
              <button (click)="showReceiveModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="receiveForm" (ngSubmit)="submitReceive()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Receipt Date</label>
                  <input type="text" formControlName="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Processed Product Item</label>
                  <select formControlName="processedItemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (p of processedItems(); track p.id) {
                      <option [value]="p.id">{{ p.name }} ({{ p.code }})</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quantity Sent (m)</label>
                  <input type="number" formControlName="quantitySent" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Quantity Received (m)</label>
                  <input type="number" formControlName="quantityReceived" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Shortage / Wastage (m)</label>
                  <input type="number" [value]="calcShortage()" readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-rose-400 font-mono font-bold" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Processing Charges (PKR)</label>
                  <input type="number" formControlName="processingCharges" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Transport / Freight</label>
                  <input type="number" formControlName="transportCharges" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Quality Inspection Grade</label>
                  <select formControlName="qualityGrade" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="Grade A">Grade A (Premium Export Quality)</option>
                    <option value="Grade B">Grade B (Minor Defect)</option>
                    <option value="Seconds">Seconds (Reject)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Receiving Warehouse</label>
                  <select formControlName="receivingWarehouseId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (w of centralWarehouses(); track w.id) {
                      <option [value]="w.id">{{ w.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Capitalized Cost Calculation Display -->
              <div class="bg-slate-950/70 p-3.5 rounded-xl border border-indigo-900/40 space-y-1">
                <div class="text-[11px] font-semibold text-indigo-300">Inventory Capitalization Breakdown:</div>
                <div class="text-slate-400 text-[11px]">
                  Formula: (Raw Cost Sent + Mill Charges + Freight) / Received Qty
                </div>
                <div class="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span class="text-slate-300">Capitalized Inventory Unit Cost:</span>
                  <span class="font-bold text-emerald-400 font-mono text-sm">
                    Rs. {{ calcCapitalizedUnitCost() }}/m
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showReceiveModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="receiveForm.invalid" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Post Receipt & Capitalize Valuation
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ProcessingMillComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  notification = inject(NotificationService);

  activeTab = signal<'challans' | 'receipts'>('challans');
  showChallanModal = signal<boolean>(false);
  showReceiveModal = signal<boolean>(false);
  selectedChallan = signal<ProcessingChallan | null>(null);

  challanForm: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    millId: ['', Validators.required],
    fabricItemId: ['', Validators.required],
    lotNo: ['', Validators.required],
    quantityDispatched: [1000, [Validators.required, Validators.min(1)]],
    unit: ['meters', Validators.required],
    processingType: ['Dyeing', Validators.required],
    processingRate: [85, [Validators.required, Validators.min(0)]],
    sourceWarehouseId: ['WH-001', Validators.required],
    expectedReturnDate: [this.erp.currentDate(), Validators.required]
  });

  receiveForm: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    processedItemId: ['', Validators.required],
    quantitySent: [1000, [Validators.required, Validators.min(1)]],
    quantityReceived: [980, [Validators.required, Validators.min(1)]],
    processingCharges: [83300, [Validators.required, Validators.min(0)]],
    transportCharges: [5000],
    qualityGrade: ['Grade A', Validators.required],
    receivingWarehouseId: ['WH-001', Validators.required]
  });

  rawItems = () => this.erp.products().filter(p => p.category === 'RAW_FABRIC');
  processedItems = () => this.erp.products().filter(p => p.category === 'PROCESSED_FABRIC');
  centralWarehouses = () => this.erp.warehouses().filter(w => w.type === 'CENTRAL');

  openChallanModal() {
    const raw = this.rawItems();
    const mills = this.erp.mills();
    const latestPurchase = this.erp.fabricPurchases()[0];

    this.challanForm.patchValue({
      date: this.erp.currentDate(),
      millId: mills.length ? mills[0].id : '',
      fabricItemId: latestPurchase ? latestPurchase.fabricItemId : (raw[0]?.id || ''),
      lotNo: latestPurchase ? latestPurchase.lotNo : 'LOT-C26-1001',
      quantityDispatched: latestPurchase ? Math.min(1000, latestPurchase.quantity) : 1000,
      unit: 'meters',
      processingType: 'Dyeing',
      processingRate: 85,
      sourceWarehouseId: 'WH-001',
      expectedReturnDate: this.erp.currentDate()
    });

    this.showChallanModal.set(true);
  }

  submitChallan() {
    if (this.challanForm.invalid) return;
    const val = this.challanForm.value;
    const mill = this.erp.mills().find(m => m.id === val.millId);
    const item = this.erp.products().find(p => p.id === val.fabricItemId);

    if (!mill || !item) return;

    const estimatedCharges = Number(val.quantityDispatched) * Number(val.processingRate);

    const challan = this.erp.createProcessingChallan({
      date: val.date,
      millId: mill.id,
      millName: mill.name,
      fabricItemId: item.id,
      fabricItemName: item.name,
      lotNo: val.lotNo,
      quantityDispatched: Number(val.quantityDispatched),
      unit: val.unit,
      processingType: val.processingType,
      expectedReturnDate: val.expectedReturnDate,
      processingRate: Number(val.processingRate),
      estimatedCharges,
      transportCharges: 5000,
      sourceWarehouseId: val.sourceWarehouseId
    });

    if (challan) {
      this.showChallanModal.set(false);
    }
  }

  openReceiveModal(challan: ProcessingChallan) {
    this.selectedChallan.set(challan);
    const proc = this.processedItems();
    const remainingSent = challan.quantityDispatched - challan.quantityReceivedTotal;
    const estimatedReceived = Math.max(1, Math.round(remainingSent * 0.98)); // 2% typical loss
    const charges = estimatedReceived * challan.processingRate;

    this.receiveForm.patchValue({
      date: this.erp.currentDate(),
      processedItemId: proc.length ? proc[0].id : '',
      quantitySent: remainingSent,
      quantityReceived: estimatedReceived,
      processingCharges: charges,
      transportCharges: 5000,
      qualityGrade: 'Grade A',
      receivingWarehouseId: 'WH-001'
    });

    this.showReceiveModal.set(true);
  }

  calcShortage(): number {
    const sent = Number(this.receiveForm.get('quantitySent')?.value) || 0;
    const rec = Number(this.receiveForm.get('quantityReceived')?.value) || 0;
    return Math.max(0, sent - rec);
  }

  calcCapitalizedUnitCost(): string {
    const challan = this.selectedChallan();
    if (!challan) return '0.00';
    const sent = Number(this.receiveForm.get('quantitySent')?.value) || 0;
    const rec = Number(this.receiveForm.get('quantityReceived')?.value) || 0;
    const charges = Number(this.receiveForm.get('processingCharges')?.value) || 0;
    const freight = Number(this.receiveForm.get('transportCharges')?.value) || 0;

    const rawItem = this.erp.products().find(p => p.id === challan.fabricItemId);
    const rawCost = rawItem ? rawItem.purchasePrice : 380;

    const totalCost = (sent * rawCost) + charges + freight;
    return rec > 0 ? (totalCost / rec).toFixed(2) : '0.00';
  }

  submitReceive() {
    if (this.receiveForm.invalid || !this.selectedChallan()) return;
    const val = this.receiveForm.value;
    const challan = this.selectedChallan()!;
    const procItem = this.erp.products().find(p => p.id === val.processedItemId);

    if (!procItem) return;

    const sent = Number(val.quantitySent);
    const rec = Number(val.quantityReceived);
    const shortage = Math.max(0, sent - rec);

    const receipt = this.erp.receiveProcessedFabric({
      date: val.date,
      challanId: challan.id,
      challanNo: challan.challanNo,
      millId: challan.millId,
      millName: challan.millName,
      sourceItemId: challan.fabricItemId,
      sourceItemName: challan.fabricItemName,
      processedItemId: procItem.id,
      processedItemName: procItem.name,
      lotNo: challan.lotNo,
      quantitySent: sent,
      quantityReceived: rec,
      wastageShortage: shortage,
      processingCharges: Number(val.processingCharges),
      transportCharges: Number(val.transportCharges) || 0,
      qualityGrade: val.qualityGrade,
      receivingWarehouseId: val.receivingWarehouseId
    });

    if (receipt) {
      this.showReceiveModal.set(false);
      this.activeTab.set('receipts');
    }
  }
}
