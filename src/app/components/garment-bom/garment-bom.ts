import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';
import { BOMComponent } from '../../models/erp.types';

@Component({
  selector: 'app-garment-bom',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Garment Bill of Materials (BOM) Management
            <span class="text-xs font-normal text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">Manufacturing Recipes</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Configure raw materials, cutting wastage allowances, trims, threads, and labor/overhead standards per garment piece.
          </p>
        </div>

        <button
          (click)="openBomModal()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New BOM
        </button>
      </div>

      <!-- BOM Cards / Table -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (bom of erp.boms(); track bom.id) {
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div class="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-indigo-400">{{ bom.bomNo }}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {{ bom.version }}
                    </span>
                  </div>
                  <h4 class="text-base font-bold text-white mt-1">{{ bom.garmentName }}</h4>
                  <div class="text-xs text-slate-400">
                    Style: <span class="text-slate-200">{{ bom.styleName }}</span> &bull; 
                    Size: <span class="text-slate-200">{{ bom.size }}</span> &bull; 
                    Color: <span class="text-slate-200">{{ bom.color }}</span>
                  </div>
                </div>

                <button
                  (click)="erp.duplicateBOM(bom.id)"
                  class="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                  title="Duplicate BOM for new style/size"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
              </div>

              <!-- Component Ingredients Table -->
              <div class="mt-4 overflow-x-auto">
                <table class="w-full text-left text-[11px] text-slate-300">
                  <thead class="text-slate-500 uppercase text-[9px] border-b border-slate-800">
                    <tr>
                      <th class="py-1.5 px-2">Component</th>
                      <th class="py-1.5 px-2 text-right">Req. Qty</th>
                      <th class="py-1.5 px-2 text-right">Wastage %</th>
                      <th class="py-1.5 px-2 text-right">Effective</th>
                      <th class="py-1.5 px-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/40">
                    @for (c of bom.components; track c.itemId) {
                      <tr>
                        <td class="py-2 px-2">
                          <div class="font-medium text-white">{{ c.itemName }}</div>
                        </td>
                        <td class="py-2 px-2 text-right font-mono">{{ c.requiredQty }} {{ c.unit }}</td>
                        <td class="py-2 px-2 text-right font-mono text-amber-400">{{ c.wastagePercent }}%</td>
                        <td class="py-2 px-2 text-right font-mono font-medium text-slate-200">{{ c.effectiveQty.toFixed(2) }} {{ c.unit }}</td>
                        <td class="py-2 px-2 text-right font-mono text-emerald-400 font-semibold">Rs. {{ c.subtotal.toFixed(2) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Cost Summary Footer -->
            <div class="mt-4 pt-4 border-t border-slate-800 text-xs">
              <div class="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-2">
                <div>
                  <div class="text-[10px] text-slate-400">Total Material:</div>
                  <div class="font-mono font-bold text-white">Rs. {{ bom.totalMaterialCost.toFixed(2) }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">Direct Labor:</div>
                  <div class="font-mono font-bold text-slate-300">Rs. {{ bom.standardLaborCost.toFixed(2) }}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">Factory Overhead:</div>
                  <div class="font-mono font-bold text-slate-300">Rs. {{ bom.standardOverheadCost.toFixed(2) }}</div>
                </div>
              </div>

              <div class="flex items-center justify-between font-bold text-sm bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-900/40 text-indigo-300">
                <span>Standard BOM Unit Cost:</span>
                <span class="text-emerald-400 font-mono">Rs. {{ bom.estimatedUnitCost.toFixed(2) }} / shirt</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- MODAL: CREATE / EDIT BOM -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Create Garment Recipe (BOM)</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="form" (ngSubmit)="submitBom()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Finished Garment Item</label>
                  <select formControlName="garmentItemId" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (g of garmentItems(); track g.id) {
                      <option [value]="g.id">{{ g.name }} ({{ g.code }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Style Name / Design</label>
                  <input type="text" formControlName="styleName" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Garment Size</label>
                  <input type="text" formControlName="size" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Garment Color</label>
                  <input type="text" formControlName="color" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">BOM Version</label>
                  <input type="text" formControlName="version" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Standard Direct Labor (PKR / piece)</label>
                  <input type="number" formControlName="standardLaborCost" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Standard Factory Overhead (PKR / piece)</label>
                  <input type="number" formControlName="standardOverheadCost" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div class="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-slate-300">
                <span class="font-bold text-white">Default Components Preloaded:</span>
                <p class="text-[11px] text-slate-400 mt-1">
                  1.60m Processed Cotton Poplin (+5% cutting loss), 8 Resin Buttons, 20m Thread, 1 Brand Label, 1 Packaging Polybag.
                </p>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" (click)="showModal.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="form.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">
                  Save BOM Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class GarmentBomComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  showModal = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    garmentItemId: ['', Validators.required],
    styleName: ['Exec Slim Fit Navy', Validators.required],
    size: ['Medium (40)', Validators.required],
    color: ['Navy Blue', Validators.required],
    version: ['v1.0', Validators.required],
    standardLaborCost: [220, [Validators.required, Validators.min(0)]],
    standardOverheadCost: [130, [Validators.required, Validators.min(0)]]
  });

  garmentItems = () => this.erp.products().filter(p => p.category === 'FINISHED_GARMENT');

  openBomModal() {
    const garments = this.garmentItems();
    this.form.patchValue({
      garmentItemId: garments.length ? garments[0].id : '',
      styleName: 'Exec Slim Fit Navy',
      size: 'Medium (40)',
      color: 'Navy Blue',
      version: 'v1.' + (this.erp.boms().length + 1),
      standardLaborCost: 220,
      standardOverheadCost: 130
    });
    this.showModal.set(true);
  }

  submitBom() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const garment = this.erp.products().find(p => p.id === val.garmentItemId);
    if (!garment) return;

    // Standard 5 components from example
    const defaultComponents: BOMComponent[] = [
      {
        itemId: 'ITM-003',
        itemName: 'Dyed Navy Blue Cotton Poplin',
        category: 'PROCESSED_FABRIC',
        requiredQty: 1.60,
        unit: 'meters',
        wastagePercent: 5.0,
        effectiveQty: 1.68,
        unitCost: 472.45,
        subtotal: 793.72
      },
      {
        itemId: 'ITM-005',
        itemName: 'Resin 4-Hole Shirt Buttons 18L',
        category: 'TRIMS_ACCESSORIES',
        requiredQty: 8,
        unit: 'pcs',
        wastagePercent: 0,
        effectiveQty: 8,
        unitCost: 2.50,
        subtotal: 20.00
      },
      {
        itemId: 'ITM-006',
        itemName: 'Spun Polyester Sewing Thread 40/2',
        category: 'TRIMS_ACCESSORIES',
        requiredQty: 20,
        unit: 'meters',
        wastagePercent: 0,
        effectiveQty: 20,
        unitCost: 0.15,
        subtotal: 3.00
      },
      {
        itemId: 'ITM-007',
        itemName: 'Woven Brand Main Label & Care Tag',
        category: 'TRIMS_ACCESSORIES',
        requiredQty: 1,
        unit: 'pcs',
        wastagePercent: 0,
        effectiveQty: 1,
        unitCost: 6.00,
        subtotal: 6.00
      },
      {
        itemId: 'ITM-008',
        itemName: 'Clear Polybag 12x16 with Warning',
        category: 'TRIMS_ACCESSORIES',
        requiredQty: 1,
        unit: 'pcs',
        wastagePercent: 0,
        effectiveQty: 1,
        unitCost: 4.50,
        subtotal: 4.50
      }
    ];

    this.erp.saveBOM({
      garmentItemId: garment.id,
      garmentName: garment.name,
      styleName: val.styleName,
      size: val.size,
      color: val.color,
      version: val.version,
      components: defaultComponents,
      totalMaterialCost: 827.22,
      standardLaborCost: Number(val.standardLaborCost),
      standardOverheadCost: Number(val.standardOverheadCost),
      estimatedUnitCost: 827.22 + Number(val.standardLaborCost) + Number(val.standardOverheadCost),
      effectiveDate: this.erp.currentDate(),
      isActive: true,
      notes: 'Standard shirt BOM'
    });

    this.showModal.set(false);
  }
}
