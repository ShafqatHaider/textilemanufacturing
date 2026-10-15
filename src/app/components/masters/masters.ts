import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErpStorageService } from '../../services/erp-storage.service';
import { ProductItem, ItemCategory } from '../../models/erp.types';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-masters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Tabs Navigation -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              [class.bg-indigo-600]="activeTab() === tab.id"
              [class.text-white]="activeTab() === tab.id"
              [class.text-slate-400]="activeTab() !== tab.id"
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>{{ tab.label }}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full" [class.bg-indigo-500]="activeTab() === tab.id" [class.bg-slate-800]="activeTab() !== tab.id">
                {{ tab.count() }}
              </span>
            </button>
          }
        </div>

        <div class="flex items-center gap-2">
          <input
            type="text"
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
            placeholder="Search records..."
            class="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
          />

          @if (activeTab() === 'products') {
            <button
              (click)="openProductModal()"
              class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          }
        </div>
      </div>

      <!-- TAB 1: PRODUCTS & ITEMS -->
      @if (activeTab() === 'products') {
        <!-- Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            (click)="selectedCategoryFilter.set('ALL')"
            [class.bg-slate-800]="selectedCategoryFilter() === 'ALL'"
            [class.text-white]="selectedCategoryFilter() === 'ALL'"
            [class.text-slate-400]="selectedCategoryFilter() !== 'ALL'"
            class="px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-700 font-medium"
          >
            All Items ({{ erp.products().length }})
          </button>
          @for (cat of categories; track cat.id) {
            <button
              (click)="selectedCategoryFilter.set(cat.id)"
              [class.bg-slate-800]="selectedCategoryFilter() === cat.id"
              [class.text-white]="selectedCategoryFilter() === cat.id"
              [class.text-slate-400]="selectedCategoryFilter() !== cat.id"
              class="px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-700 font-medium whitespace-nowrap"
            >
              {{ cat.label }}
            </button>
          }
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">SKU / Code</th>
                  <th class="py-3 px-4">Item Name & Specs</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4 text-center">Unit</th>
                  <th class="py-3 px-4 text-right">Purchase/Cost (PKR)</th>
                  <th class="py-3 px-4 text-right">Sales Price (PKR)</th>
                  <th class="py-3 px-4 text-right">Current Stock</th>
                  <th class="py-3 px-4 text-right">Min Stock</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (item of filteredProducts(); track item.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">{{ item.code }}</td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ item.name }}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">
                        {{ item.composition || '' }} {{ item.color ? '• ' + item.color : '' }} {{ item.gsm ? '• ' + item.gsm + ' GSM' : '' }} {{ item.width ? '• ' + item.width : '' }}
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {{ formatCategory(item.category) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center font-mono">{{ item.unit }}</td>
                    <td class="py-3 px-4 text-right font-mono font-medium">Rs. {{ item.purchasePrice.toFixed(2) }}</td>
                    <td class="py-3 px-4 text-right font-mono font-medium text-emerald-400">Rs. {{ item.salesPrice.toFixed(2) }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold" [class.text-rose-400]="item.currentStock <= item.minStockLevel" [class.text-white]="item.currentStock > item.minStockLevel">
                      {{ item.currentStock }} {{ item.unit }}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-500">{{ item.minStockLevel }}</td>
                    <td class="py-3 px-4 text-center">
                      @if (item.currentStock === 0) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">Nil Stock</span>
                      } @else if (item.currentStock <= item.minStockLevel) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">Low Stock</span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Optimal</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: SUPPLIERS -->
      @if (activeTab() === 'suppliers') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Code</th>
                  <th class="py-3 px-4">Supplier Name</th>
                  <th class="py-3 px-4">Contact Person</th>
                  <th class="py-3 px-4">Phone & Email</th>
                  <th class="py-3 px-4">Location / Address</th>
                  <th class="py-3 px-4">NTN / Tax ID</th>
                  <th class="py-3 px-4 text-right">Payable Balance (PKR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (sup of erp.suppliers(); track sup.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-400">{{ sup.code }}</td>
                    <td class="py-3 px-4 font-bold text-white">{{ sup.name }}</td>
                    <td class="py-3 px-4 text-slate-300">{{ sup.contactPerson }}</td>
                    <td class="py-3 px-4">
                      <div>{{ sup.phone }}</div>
                      <div class="text-[10px] text-slate-500">{{ sup.email }}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-400">{{ sup.address }}</td>
                    <td class="py-3 px-4 font-mono text-[11px] text-slate-400">{{ sup.taxId || 'N/A' }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold" [class.text-amber-400]="sup.balance > 0" [class.text-slate-400]="sup.balance === 0">
                      Rs. {{ sup.balance.toLocaleString() }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: CUSTOMERS -->
      @if (activeTab() === 'customers') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Code</th>
                  <th class="py-3 px-4">Customer Name</th>
                  <th class="py-3 px-4">Contact Person</th>
                  <th class="py-3 px-4">Phone & Email</th>
                  <th class="py-3 px-4">Address</th>
                  <th class="py-3 px-4 text-right">Credit Limit</th>
                  <th class="py-3 px-4 text-right">Receivable Balance (PKR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (cust of erp.customers(); track cust.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-400">{{ cust.code }}</td>
                    <td class="py-3 px-4 font-bold text-white">{{ cust.name }}</td>
                    <td class="py-3 px-4 text-slate-300">{{ cust.contactPerson }}</td>
                    <td class="py-3 px-4">
                      <div>{{ cust.phone }}</div>
                      <div class="text-[10px] text-slate-500">{{ cust.email }}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-400">{{ cust.address }}</td>
                    <td class="py-3 px-4 text-right font-mono text-slate-400">Rs. {{ cust.creditLimit.toLocaleString() }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      Rs. {{ cust.balance.toLocaleString() }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 4: PROCESSING MILLS -->
      @if (activeTab() === 'mills') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Code</th>
                  <th class="py-3 px-4">Mill Name</th>
                  <th class="py-3 px-4">Services Offered</th>
                  <th class="py-3 px-4">Contact</th>
                  <th class="py-3 px-4 text-right">Standard Rate / Meter</th>
                  <th class="py-3 px-4 text-right">Outstanding Job Work Payable</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (mill of erp.mills(); track mill.id) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-amber-400">{{ mill.code }}</td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{{ mill.name }}</div>
                      <div class="text-[11px] text-slate-400">{{ mill.address }}</div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex flex-wrap gap-1">
                        @for (srv of mill.servicesOffered; track srv) {
                          <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {{ srv }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <div>{{ mill.contactPerson }}</div>
                      <div class="text-[10px] text-slate-500">{{ mill.phone }}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">Rs. {{ mill.defaultRatePerMeter }}/m</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-amber-300">
                      Rs. {{ mill.balance.toLocaleString() }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 5: CHART OF ACCOUNTS -->
      @if (activeTab() === 'accounts') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Account Code</th>
                  <th class="py-3 px-4">Account Name</th>
                  <th class="py-3 px-4">Classification</th>
                  <th class="py-3 px-4">Description / Audit Role</th>
                  <th class="py-3 px-4 text-right">Current Balance (PKR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (acc of erp.accounts(); track acc.code) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-400">{{ acc.code }}</td>
                    <td class="py-3 px-4 font-bold text-white">{{ acc.name }}</td>
                    <td class="py-3 px-4">
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-semibold"
                        [class.bg-emerald-500/10]="acc.category === 'ASSET'"
                        [class.text-emerald-400]="acc.category === 'ASSET'"
                        [class.bg-amber-500/10]="acc.category === 'LIABILITY'"
                        [class.text-amber-400]="acc.category === 'LIABILITY'"
                        [class.bg-purple-500/10]="acc.category === 'EQUITY'"
                        [class.text-purple-400]="acc.category === 'EQUITY'"
                        [class.bg-sky-500/10]="acc.category === 'REVENUE'"
                        [class.text-sky-400]="acc.category === 'REVENUE'"
                        [class.bg-rose-500/10]="acc.category === 'EXPENSE'"
                        [class.text-rose-400]="acc.category === 'EXPENSE'"
                      >
                        {{ acc.category }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-slate-400">{{ acc.description || '-' }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold" [class.text-emerald-400]="acc.category === 'REVENUE'" [class.text-white]="acc.category !== 'REVENUE'">
                      Rs. {{ acc.balance.toLocaleString() }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL: ADD PRODUCT -->
      @if (showProductModal()) {
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Create New Master Item</h3>
              <button (click)="showProductModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Item Code / SKU</label>
                  <input type="text" formControlName="code" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Category</label>
                  <select formControlName="category" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    @for (cat of categories; track cat.id) {
                      <option [value]="cat.id">{{ cat.label }}</option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-slate-400 mb-1">Item Name</label>
                <input type="text" formControlName="name" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Unit of Measure</label>
                  <select formControlName="unit" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="meters">meters</option>
                    <option value="yards">yards</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="dozen">dozen</option>
                    <option value="rolls">rolls</option>
                    <option value="cones">cones</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Purchase / Cost (PKR)</label>
                  <input type="number" formControlName="purchasePrice" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Sales Price (PKR)</label>
                  <input type="number" formControlName="salesPrice" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Fabric Composition / Type</label>
                  <input type="text" formControlName="composition" placeholder="e.g. 100% Combed Cotton" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Color / Finish</label>
                  <input type="text" formControlName="color" placeholder="e.g. Navy Blue" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">Minimum Stock Level</label>
                  <input type="number" formControlName="minStockLevel" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Initial Opening Stock</label>
                  <input type="number" formControlName="currentStock" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" (click)="showProductModal.set(false)" class="px-4 py-2 rounded-xl text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" [disabled]="productForm.invalid" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class MastersComponent {
  erp = inject(ErpStorageService);
  fb = inject(FormBuilder);
  notification = inject(NotificationService);

  activeTab = signal<string>('products');
  searchTerm = signal<string>('');
  selectedCategoryFilter = signal<string>('ALL');
  showProductModal = signal<boolean>(false);

  tabs = [
    { id: 'products', label: 'Items & Products', count: () => this.erp.products().length },
    { id: 'suppliers', label: 'Suppliers', count: () => this.erp.suppliers().length },
    { id: 'customers', label: 'Customers', count: () => this.erp.customers().length },
    { id: 'mills', label: 'Processing Mills', count: () => this.erp.mills().length },
    { id: 'accounts', label: 'Chart of Accounts', count: () => this.erp.accounts().length }
  ];

  categories: { id: ItemCategory; label: string }[] = [
    { id: 'RAW_FABRIC', label: 'Raw Fabric (Greige)' },
    { id: 'PROCESSED_FABRIC', label: 'Processed Fabric' },
    { id: 'RAW_MATERIAL', label: 'Raw Material' },
    { id: 'TRIMS_ACCESSORIES', label: 'Trims & Accessories' },
    { id: 'FINISHED_GARMENT', label: 'Finished Garments' },
    { id: 'OTHER_TRADING', label: 'Other Trading Items' }
  ];

  productForm: FormGroup = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    category: ['RAW_FABRIC', Validators.required],
    unit: ['meters', Validators.required],
    purchasePrice: [100, [Validators.required, Validators.min(0)]],
    salesPrice: [150, [Validators.required, Validators.min(0)]],
    currentStock: [0],
    minStockLevel: [50],
    composition: [''],
    color: ['']
  });

  filteredProducts = () => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.selectedCategoryFilter();
    return this.erp.products().filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term);
      const matchesCat = cat === 'ALL' || p.category === cat;
      return matchesSearch && matchesCat;
    });
  };

  openProductModal() {
    this.productForm.reset({
      code: 'ITM-' + String(this.erp.products().length + 1).padStart(3, '0'),
      name: '',
      category: 'RAW_FABRIC',
      unit: 'meters',
      purchasePrice: 400,
      salesPrice: 600,
      currentStock: 0,
      minStockLevel: 50,
      composition: '',
      color: ''
    });
    this.showProductModal.set(true);
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    const val = this.productForm.value;
    const newItem: ProductItem = {
      id: 'ITM-' + Math.random().toString(36).substring(2, 9),
      code: val.code,
      name: val.name,
      category: val.category,
      unit: val.unit,
      purchasePrice: Number(val.purchasePrice),
      salesPrice: Number(val.salesPrice),
      currentStock: Number(val.currentStock) || 0,
      minStockLevel: Number(val.minStockLevel) || 0,
      composition: val.composition,
      color: val.color
    };

    this.erp.products.update(items => [newItem, ...items]);
    this.erp.saveToStorage();
    this.showProductModal.set(false);
    this.notification.success('Item Created', `${newItem.name} (${newItem.code}) added to Master database.`);
  }

  formatCategory(cat: ItemCategory): string {
    const map: Record<ItemCategory, string> = {
      RAW_FABRIC: 'Raw Fabric',
      PROCESSED_FABRIC: 'Processed Fabric',
      RAW_MATERIAL: 'Raw Material',
      TRIMS_ACCESSORIES: 'Trims & Accessories',
      FINISHED_GARMENT: 'Finished Garment',
      OTHER_TRADING: 'Trading Item'
    };
    return map[cat] || cat;
  }
}
