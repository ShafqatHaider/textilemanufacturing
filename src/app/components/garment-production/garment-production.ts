import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';
import { ProductionOrder } from '../../models/erp.types';

@Component({
  selector: 'app-garment-production',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Garment Production & Actual Costing Engine
            <span class="text-xs font-normal text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">Steps 6, 7 & 8 of Workflow</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Manage cut-to-pack operations: Production Orders &rarr; Factory Material Issuance (WIP) &rarr; Production Completion & QC Rejection Allocation.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="activeTab.set('orders')"
            [class.bg-slate-800]="activeTab() === 'orders'"
            [class.text-white]="activeTab() === 'orders'"
            [class.text-slate-400]="activeTab() !== 'orders'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            Production Orders ({{ erp.productionOrders().length }})
          </button>

          <button
            (click)="activeTab.set('completions')"
            [class.bg-slate-800]="activeTab() === 'completions'"
            [class.text-white]="activeTab() === 'completions'"
            [class.text-slate-400]="activeTab() !== 'completions'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            Completion Receipts ({{ erp.productionCompletions().length }})
          </button>

          <button
            (click)="openOrderModal()"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Production Order
          </button>
        </div>
      </div>

      <!-- TAB 1: PRODUCTION ORDERS -->
      @if (activeTab() === 'orders') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Order #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Garment Item & Style</th>
                  <th class="py-3 px-4">Size & Color</th>
                  <th class="py-3 px-4">BOM Ref</th>
                  <th class="py-3 px-4 text-right">Planned Qty</th>
                  <th class="py-3 px-4 text-center">Material Status</th>
                  <th class="py-3 px-4 text-center">Production Status</th>
                  <th class="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (o of erp.productionOrders(); track o.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-violet-400">{{ o.orderNo }}</td>
                    <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ o.date }}</td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ o.garmentName }}</div>
                      <div class="text-[11px] text-slate-400">{{ o.styleName }}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-300">{{ o.size }} &bull; {{ o.color }}</td>
                    <td class="py-3 px-4 font-mono text-slate-400">{{ o.bomNo }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">
                      {{ o.plannedQty }} pcs
                    </td>
                    <td class="py-3 px-4 text-center">
                      @if (o.materialIssued) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Issued to Floor (WIP)
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Materials Not Issued
                        </span>
                      }
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span 
                        class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        [class.bg-slate-800]="o.status === 'Planned'"
                        [class.text-slate-300]="o.status === 'Planned'"
                        [class.bg-amber-500/20]="o.status === 'In Production'"
                        [class.text-amber-300]="o.status === 'In Production'"
                        [class.bg-emerald-500/20]="o.status === 'Completed'"
                        [class.text-emerald-300]="o.status === 'Completed'"
                      >
                        {{ o.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      @if (!o.materialIssued) {
                        <button
                          (click)="issueMaterials(o)"
                          class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Issue Materials
                        </button>
                      } @else if (o.status === 'In Production') {
                        <button
                          (click)="openCompleteModal(o)"
                          class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Complete Order
                        </button>
                      } @else {
                        <span class="text-emerald-400 font-mono text-[11px]">&check; Completed</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="py-12 text-center text-slate-500">
                      No production orders yet. Click "Create Production Order" or follow Step 6 in the Demo scenario.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: PRODUCTION COMPLETIONS -->
      @if (activeTab() === 'completions') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Completion #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Order Ref</th>
                  <th class="py-3 px-4">Garment Produced</th>
                  <th class="py-3 px-4 text-right">Accepted Qty</th>
                  <th class="py-3 px-4 text-right">Rejected Qty</th>
                  <th class="py-3 px-4 text-right">Actual Material Cost</th>
                  <th class="py-3 px-4 text-right">Direct Labor</th>
                  <th class="py-3 px-4 text-right">Factory Overhead</th>
                  <th class="py-3 px-4 text-right">Final Unit Cost</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (pc of erp.productionCompletions(); track pc.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-emerald-400">{{ pc.completionNo }}</td>
                    <td class="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{{ pc.date }}</td>
                    <td class="py-3 px-4 font-mono text-slate-300">{{ pc.orderNo }}</td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ pc.garmentName }}</div>
                      <div class="text-[10px] text-slate-400">{{ pc.styleName }} &bull; {{ pc.size }} &bull; {{ pc.color }}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-black text-emerald-400">
                      {{ pc.acceptedQty }} pcs
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {{ pc.rejectedQty }} pcs
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-300">
                      Rs. {{ pc.actualMaterialCost.toLocaleString() }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-300">
                      Rs. {{ pc.directLaborCost.toLocaleString() }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-300">
                      Rs. {{ pc.factoryOverhead.toLocaleString() }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-black text-emerald-300 text-sm">
                      Rs. {{ pc.unitCost.toFixed(2) }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="10" class="py-12 text-center text-slate-500">
                      No production completions yet. Complete Step 8 in the Demo scenario.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: NEW PRODUCTION ORDER -->
      @if (showOrderModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Create Garment Production Order</h3>
              <button (click)="showOrderModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="orderForm" (ngSubmit)="submitOrder()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Order Date</label>
                  <input type="text" formControlName="date" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Target Completion Date</label>
                  <input type="text" formControlName="plannedCompletionDate" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div>
                <label class="block text-slate-400 mb-1">Select BOM (Recipe)</label>
                <select formControlName="bomId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  @for (b of erp.boms(); track b.id) {
                    <option [value]="b.id">{{ b.garmentName }} &bull; {{ b.styleName }} ({{ b.bomNo }}) - Est: Rs. {{ b.estimatedUnitCost.toFixed(2) }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Planned Quantity (pcs)</label>
                  <input type="number" formControlName="plannedQty" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Size</label>
                  <input type="text" formControlName="size" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Color</label>
                  <input type="text" formControlName="color" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div>
                <label class="block text-slate-400 mb-1">Manufacturing Factory Warehouse</label>
                <select formControlName="factoryWarehouseId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  @for (w of factoryWarehouses(); track w.id) {
                    <option [value]="w.id">{{ w.name }}</option>
                  }
                </select>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showOrderModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="orderForm.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Release Production Order
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: COMPLETE PRODUCTION -->
      @if (showCompleteModal() && selectedOrder()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 class="text-base font-bold text-white">Complete Production & Allocate Costs</h3>
                <p class="text-xs text-slate-400">Order: {{ selectedOrder()!.orderNo }} (Planned: {{ selectedOrder()!.plannedQty }} pcs)</p>
              </div>
              <button (click)="showCompleteModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="completeForm" (ngSubmit)="submitCompletion()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Total Finished (pcs)</label>
                  <input type="number" formControlName="completedQty" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Accepted A-Grade (pcs)</label>
                  <input type="number" formControlName="acceptedQty" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Rejected Flaws (pcs)</label>
                  <input type="number" formControlName="rejectedQty" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Direct Labor Cost (Total PKR)</label>
                  <input type="number" formControlName="directLaborCost" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Factory Overhead (Total PKR)</label>
                  <input type="number" formControlName="factoryOverhead" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <!-- Costing Calculation Display -->
              <div class="bg-slate-950/70 p-3.5 rounded-xl border border-indigo-900/40 space-y-1.5">
                <div class="flex justify-between text-slate-400">
                  <span>Actual Issued Material Cost (from WIP):</span>
                  <span class="font-mono text-white">Rs. {{ getIssuedMaterialCost().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Labor + Overheads Applied:</span>
                  <span class="font-mono text-white">Rs. {{ (Number(completeForm.get('directLaborCost')?.value) + Number(completeForm.get('factoryOverhead')?.value)).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800">
                  <span class="text-indigo-300 font-bold">Computed Finished Goods Unit Cost:</span>
                  <span class="font-black text-emerald-400 font-mono text-base">
                    Rs. {{ calcFinishedUnitCost() }} / shirt
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showCompleteModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="completeForm.invalid" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Post Completion to Finished Goods
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class GarmentProductionComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  Number = Number;

  activeTab = signal<'orders' | 'completions'>('orders');
  showOrderModal = signal<boolean>(false);
  showCompleteModal = signal<boolean>(false);
  selectedOrder = signal<ProductionOrder | null>(null);

  orderForm: FormGroup = this.fb.group({
    date: [this.erp.currentDate(), Validators.required],
    bomId: ['', Validators.required],
    plannedQty: [200, [Validators.required, Validators.min(1)]],
    size: ['Medium (40)', Validators.required],
    color: ['Navy Blue', Validators.required],
    factoryWarehouseId: ['WH-002', Validators.required],
    plannedCompletionDate: [this.erp.currentDate(), Validators.required]
  });

  completeForm: FormGroup = this.fb.group({
    completedQty: [200, [Validators.required, Validators.min(1)]],
    acceptedQty: [195, [Validators.required, Validators.min(1)]],
    rejectedQty: [5, [Validators.required, Validators.min(0)]],
    directLaborCost: [44000, [Validators.required, Validators.min(0)]],
    factoryOverhead: [26000, [Validators.required, Validators.min(0)]]
  });

  factoryWarehouses = () => this.erp.warehouses().filter(w => w.isFactory);

  openOrderModal() {
    const boms = this.erp.boms();
    this.orderForm.patchValue({
      date: this.erp.currentDate(),
      bomId: boms.length ? boms[0].id : '',
      plannedQty: 200,
      size: 'Medium (40)',
      color: 'Navy Blue',
      factoryWarehouseId: 'WH-002',
      plannedCompletionDate: this.erp.currentDate()
    });
    this.showOrderModal.set(true);
  }

  submitOrder() {
    if (this.orderForm.invalid) return;
    const val = this.orderForm.value;
    const bom = this.erp.boms().find(b => b.id === val.bomId);
    const wh = this.erp.warehouses().find(w => w.id === val.factoryWarehouseId);
    if (!bom || !wh) return;

    this.erp.createProductionOrder({
      date: val.date,
      garmentItemId: bom.garmentItemId,
      garmentName: bom.garmentName,
      styleName: bom.styleName,
      size: val.size,
      color: val.color,
      bomId: bom.id,
      bomNo: bom.bomNo,
      plannedQty: Number(val.plannedQty),
      factoryWarehouseId: wh.id,
      factoryWarehouseName: wh.name,
      plannedCompletionDate: val.plannedCompletionDate,
      status: 'Planned',
      notes: 'Production Order created'
    });

    this.showOrderModal.set(false);
  }

  issueMaterials(order: ProductionOrder) {
    this.erp.issueMaterialsForProduction(order.id, `Material issue for ${order.plannedQty} ${order.garmentName}`);
  }

  openCompleteModal(order: ProductionOrder) {
    this.selectedOrder.set(order);
    this.completeForm.patchValue({
      completedQty: order.plannedQty,
      acceptedQty: Math.max(1, order.plannedQty - 5),
      rejectedQty: 5,
      directLaborCost: order.plannedQty * 220,
      factoryOverhead: order.plannedQty * 130
    });
    this.showCompleteModal.set(true);
  }

  getIssuedMaterialCost(): number {
    const order = this.selectedOrder();
    if (!order) return 0;
    const issue = this.erp.materialIssues().find(m => m.productionOrderId === order.id);
    return issue ? issue.totalMaterialCost : 165444;
  }

  calcFinishedUnitCost(): string {
    const accepted = Number(this.completeForm.get('acceptedQty')?.value) || 1;
    const labor = Number(this.completeForm.get('directLaborCost')?.value) || 0;
    const overhead = Number(this.completeForm.get('factoryOverhead')?.value) || 0;
    const mat = this.getIssuedMaterialCost();

    const total = mat + labor + overhead;
    return (total / accepted).toFixed(2);
  }

  submitCompletion() {
    if (this.completeForm.invalid || !this.selectedOrder()) return;
    const val = this.completeForm.value;
    const order = this.selectedOrder()!;
    const matCost = this.getIssuedMaterialCost();

    const comp = this.erp.completeProduction({
      date: this.erp.currentDate(),
      productionOrderId: order.id,
      orderNo: order.orderNo,
      garmentItemId: order.garmentItemId,
      garmentName: order.garmentName,
      styleName: order.styleName,
      size: order.size,
      color: order.color,
      targetWarehouseId: order.factoryWarehouseId,
      completedQty: Number(val.completedQty),
      acceptedQty: Number(val.acceptedQty),
      rejectedQty: Number(val.rejectedQty),
      actualMaterialCost: matCost,
      directLaborCost: Number(val.directLaborCost),
      factoryOverhead: Number(val.factoryOverhead),
      otherExpenses: 0,
      notes: 'Batch completion and inspection'
    });

    if (comp) {
      this.showCompleteModal.set(false);
      this.activeTab.set('completions');
    }
  }
}
