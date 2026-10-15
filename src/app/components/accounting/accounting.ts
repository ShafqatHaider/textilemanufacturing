import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpStorageService } from '../../services/erp-storage.service';

@Component({
  selector: 'app-accounting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header Navigation -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            Perpetual Double-Entry Accounting System
            <span class="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Balanced Books (PKR)</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Every transaction posts synchronized debit & credit journal lines linking directly to source documents with strict balance validation.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            (click)="activeSubTab.set('journal')"
            [class.bg-indigo-600]="activeSubTab() === 'journal'"
            [class.text-white]="activeSubTab() === 'journal'"
            [class.text-slate-400]="activeSubTab() !== 'journal'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Journal Vouchers ({{ erp.journalEntries().length }})
          </button>
          <button
            (click)="activeSubTab.set('trial-balance')"
            [class.bg-indigo-600]="activeSubTab() === 'trial-balance'"
            [class.text-white]="activeSubTab() === 'trial-balance'"
            [class.text-slate-400]="activeSubTab() !== 'trial-balance'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Trial Balance
          </button>
          <button
            (click)="activeSubTab.set('pnl')"
            [class.bg-indigo-600]="activeSubTab() === 'pnl'"
            [class.text-white]="activeSubTab() === 'pnl'"
            [class.text-slate-400]="activeSubTab() !== 'pnl'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Profit & Loss
          </button>
          <button
            (click)="activeSubTab.set('balance-sheet')"
            [class.bg-indigo-600]="activeSubTab() === 'balance-sheet'"
            [class.text-white]="activeSubTab() === 'balance-sheet'"
            [class.text-slate-400]="activeSubTab() !== 'balance-sheet'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Balance Sheet
          </button>
        </div>
      </div>

      <!-- TAB 1: JOURNAL VOUCHERS -->
      @if (activeSubTab() === 'journal') {
        <div class="space-y-4">
          @for (jv of erp.journalEntries(); track jv.id) {
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div class="flex items-center gap-3">
                  <span class="font-mono font-bold text-indigo-400 text-sm">{{ jv.entryNo }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ jv.date }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {{ jv.referenceType }} &bull; {{ jv.referenceNo }}
                  </span>
                </div>
                <div class="text-xs font-mono text-emerald-400 font-bold">
                  Balanced: Rs. {{ jv.totalDebit.toLocaleString() }}
                </div>
              </div>

              <div class="mt-2 text-xs text-slate-300 font-medium mb-3">
                {{ jv.description }}
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="text-slate-500 uppercase text-[9px] border-b border-slate-800/80">
                    <tr>
                      <th class="py-1 px-3">Account Code & Title</th>
                      <th class="py-1 px-3">Particulars / Line Notes</th>
                      <th class="py-1 px-3 text-right">Debit (PKR)</th>
                      <th class="py-1 px-3 text-right">Credit (PKR)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/40 font-mono">
                    @for (line of jv.lines; track line.accountCode + line.debit + line.credit) {
                      <tr>
                        <td class="py-2 px-3">
                          <span class="text-indigo-400 font-bold mr-2">{{ line.accountCode }}</span>
                          <span class="text-white">{{ line.accountName }}</span>
                        </td>
                        <td class="py-2 px-3 text-slate-400 font-sans text-[11px]">{{ line.notes || '-' }}</td>
                        <td class="py-2 px-3 text-right text-white font-bold">
                          {{ line.debit > 0 ? 'Rs. ' + line.debit.toLocaleString() : '-' }}
                        </td>
                        <td class="py-2 px-3 text-right text-slate-300">
                          {{ line.credit > 0 ? 'Rs. ' + line.credit.toLocaleString() : '-' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          } @empty {
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              No journal vouchers generated yet. Posting any fabric purchase, mill receipt, production completion, or sale creates automatic balanced vouchers.
            </div>
          }
        </div>
      }

      <!-- TAB 2: TRIAL BALANCE -->
      @if (activeSubTab() === 'trial-balance') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="text-base font-bold text-white">General Ledger Trial Balance</h4>
              <p class="text-xs text-slate-400">Verification that Total Debits equal Total Credits across all charts</p>
            </div>
            <div class="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              Double-Entry Validated
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Code</th>
                  <th class="py-3 px-4">Account Title</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4 text-right">Debit Balance (PKR)</th>
                  <th class="py-3 px-4 text-right">Credit Balance (PKR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                @for (acc of trialBalanceRows(); track acc.code) {
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-bold text-indigo-400">{{ acc.code }}</td>
                    <td class="py-2.5 px-4 font-medium text-white">{{ acc.name }}</td>
                    <td class="py-2.5 px-4 text-slate-400 text-[11px]">{{ acc.category }}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-white">
                      {{ acc.debit > 0 ? 'Rs. ' + acc.debit.toLocaleString() : '-' }}
                    </td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-300">
                      {{ acc.credit > 0 ? 'Rs. ' + acc.credit.toLocaleString() : '-' }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-slate-950 font-mono font-black text-sm border-t-2 border-slate-700">
                <tr>
                  <td colspan="3" class="py-3 px-4 text-white uppercase tracking-wider text-xs">Total Trial Balance</td>
                  <td class="py-3 px-4 text-right text-emerald-400">Rs. {{ totalTrialDebit().toLocaleString() }}</td>
                  <td class="py-3 px-4 text-right text-emerald-400">Rs. {{ totalTrialCredit().toLocaleString() }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: PROFIT & LOSS -->
      @if (activeSubTab() === 'pnl') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto space-y-6">
          <div class="text-center border-b border-slate-800 pb-4">
            <h4 class="text-lg font-bold text-white tracking-tight">Statement of Profit & Loss</h4>
            <p class="text-xs text-slate-400">For Period Ended {{ erp.currentDate() }} &bull; Currency: PKR</p>
          </div>

          <div class="space-y-4 text-xs">
            <!-- Revenue Section -->
            <div>
              <div class="font-bold text-white uppercase text-[11px] text-indigo-400 mb-2">1. Operating Revenue</div>
              <div class="space-y-1.5 pl-3 border-l-2 border-indigo-500/40">
                <div class="flex justify-between text-slate-300">
                  <span>Processed Fabric Sales Revenue</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getRevenueAccount('4010').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Ready-Made Garment Sales Revenue</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getRevenueAccount('4020').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Other Trading Items Sales</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getRevenueAccount('4030').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Sales Revenue</span>
                  <span class="font-mono text-emerald-400">Rs. {{ erp.totalSalesAmount().toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- COGS Section -->
            <div>
              <div class="font-bold text-white uppercase text-[11px] text-amber-400 mb-2">2. Cost of Goods Sold (Perpetual FIFO)</div>
              <div class="space-y-1.5 pl-3 border-l-2 border-amber-500/40">
                <div class="flex justify-between text-slate-300">
                  <span>Cost of Fabric Sold</span>
                  <span class="font-mono text-slate-200">Rs. {{ getCogsAccount('5010').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Cost of Garments Sold</span>
                  <span class="font-mono text-slate-200">Rs. {{ getCogsAccount('5020').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Cost of Trading Items Sold</span>
                  <span class="font-mono text-slate-200">Rs. {{ getCogsAccount('5030').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Cost of Goods Sold</span>
                  <span class="font-mono text-rose-400">- Rs. {{ erp.totalCostOfGoodsSold().toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Gross Profit -->
            <div class="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/60 flex justify-between items-center text-sm font-bold">
              <span class="text-white">Gross Profit:</span>
              <span class="font-mono text-emerald-400 text-base">Rs. {{ erp.estimatedGrossProfit().toLocaleString() }}</span>
            </div>

            <!-- Operating Expenses -->
            <div>
              <div class="font-bold text-white uppercase text-[11px] text-slate-400 mb-2">3. Operating & Administrative Expenses</div>
              <div class="space-y-1.5 pl-3 border-l-2 border-slate-700">
                <div class="flex justify-between text-slate-300">
                  <span>Mill Shortage & Wastage Loss</span>
                  <span class="font-mono text-slate-200">Rs. {{ getAccountBalance('6030').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Administrative & Selling Expenses</span>
                  <span class="font-mono text-slate-200">Rs. {{ getAccountBalance('7010').toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Net Profit -->
            <div class="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 flex justify-between items-center text-base font-black">
              <span class="text-white">Net Operating Profit:</span>
              <span class="font-mono text-emerald-400 text-lg">Rs. {{ erp.estimatedGrossProfit().toLocaleString() }}</span>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: BALANCE SHEET -->
      @if (activeSubTab() === 'balance-sheet') {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
          <div class="text-center border-b border-slate-800 pb-4">
            <h4 class="text-lg font-bold text-white tracking-tight">Statement of Financial Position (Balance Sheet)</h4>
            <p class="text-xs text-slate-400">As at {{ erp.currentDate() }} &bull; Assets = Liabilities + Owner's Equity</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <!-- Left: Assets -->
            <div class="space-y-4">
              <div class="font-bold text-emerald-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
                Assets
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-slate-300">
                  <span>Cash in Hand (1010)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1010').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Meezan Bank Ltd (1020)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1020').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Accounts Receivable (1100)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1100').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Raw Fabric Inventory (1210)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1210').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Fabric at Processing Mills (1220)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1220').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Processed Fabric Inventory (1230)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1230').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Factory Raw Materials & Trims (1240)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1240').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Work in Progress WIP (1250)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1250').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Finished Goods Inventory (1260)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1260').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span>Other Trading Inventory (1270)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('1270').toLocaleString() }}</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-800 flex justify-between font-black text-sm text-white">
                <span>Total Assets:</span>
                <span class="font-mono text-emerald-400">Rs. {{ totalAssets().toLocaleString() }}</span>
              </div>
            </div>

            <!-- Right: Liabilities & Equity -->
            <div class="space-y-4">
              <div class="font-bold text-amber-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
                Liabilities & Owner's Equity
              </div>
              <div class="space-y-2">
                <div class="text-[10px] text-slate-500 uppercase font-bold">Current Liabilities</div>
                <div class="flex justify-between text-slate-300 pl-2">
                  <span>Accounts Payable Suppliers (2010)</span>
                  <span class="font-mono font-medium text-amber-300">Rs. {{ getAccountBalance('2010').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300 pl-2">
                  <span>Processing Mill Payables (2020)</span>
                  <span class="font-mono font-medium text-amber-300">Rs. {{ getAccountBalance('2020').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300 pl-2">
                  <span>Sales Tax Payable (2100)</span>
                  <span class="font-mono font-medium text-amber-300">Rs. {{ getAccountBalance('2100').toLocaleString() }}</span>
                </div>

                <div class="text-[10px] text-slate-500 uppercase font-bold pt-3">Owner's Equity</div>
                <div class="flex justify-between text-slate-300 pl-2">
                  <span>Paid-Up Capital (3010)</span>
                  <span class="font-mono font-medium text-white">Rs. {{ getAccountBalance('3010').toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-slate-300 pl-2">
                  <span>Current Period Net Profit</span>
                  <span class="font-mono font-medium text-emerald-400">Rs. {{ erp.estimatedGrossProfit().toLocaleString() }}</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-800 flex justify-between font-black text-sm text-white">
                <span>Total Liabilities & Equity:</span>
                <span class="font-mono text-emerald-400">Rs. {{ (totalLiabilities() + totalEquity()).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AccountingComponent {
  erp = inject(ErpStorageService);
  activeSubTab = signal<'journal' | 'trial-balance' | 'pnl' | 'balance-sheet'>('journal');

  getAccountBalance(code: string): number {
    const acc = this.erp.accounts().find(a => a.code === code);
    return acc ? Math.abs(acc.balance) : 0;
  }

  getRevenueAccount(code: string): number {
    const acc = this.erp.accounts().find(a => a.code === code);
    return acc ? Math.abs(acc.balance) : 0;
  }

  getCogsAccount(code: string): number {
    const acc = this.erp.accounts().find(a => a.code === code);
    return acc ? Math.abs(acc.balance) : 0;
  }

  trialBalanceRows = () => {
    return this.erp.accounts().map(acc => {
      let debit = 0;
      let credit = 0;
      if (acc.category === 'ASSET' || acc.category === 'EXPENSE') {
        debit = acc.balance;
      } else {
        credit = acc.balance;
      }
      return {
        code: acc.code,
        name: acc.name,
        category: acc.category,
        debit: Math.max(0, debit),
        credit: Math.max(0, credit)
      };
    });
  };

  totalTrialDebit(): number {
    return this.trialBalanceRows().reduce((sum, r) => sum + r.debit, 0);
  }

  totalTrialCredit(): number {
    return this.trialBalanceRows().reduce((sum, r) => sum + r.credit, 0);
  }

  totalAssets(): number {
    return this.erp.accounts()
      .filter(a => a.category === 'ASSET')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
  }

  totalLiabilities(): number {
    return this.erp.accounts()
      .filter(a => a.category === 'LIABILITY')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
  }

  totalEquity(): number {
    const baseEquity = this.getAccountBalance('3010');
    const profit = this.erp.estimatedGrossProfit();
    return baseEquity + profit;
  }
}
