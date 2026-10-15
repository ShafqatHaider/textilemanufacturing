import { Injectable, signal, computed, inject } from '@angular/core';
import {
  ProductItem,
  Supplier,
  Customer,
  ProcessingMill,
  Warehouse,
  GarmentSize,
  GarmentColor,
  Account,
  FabricPurchase,
  ProcessingChallan,
  ProcessingReceipt,
  FabricSale,
  StockTransfer,
  BOM,
  ProductionOrder,
  MaterialIssue,
  ProductionCompletion,
  GarmentSale,
  OtherItemSale,
  JournalEntry,
  StockMovement,
  WarehouseStockItem,
  DemoStep
} from '../models/erp.types';
import { NotificationService } from './notification.service';

const STORAGE_KEY_PREFIX = 'texflow_erp_v1_';

@Injectable({
  providedIn: 'root'
})
export class ErpStorageService {
  private notification = inject(NotificationService);

  // Core State Signals
  readonly products = signal<ProductItem[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly mills = signal<ProcessingMill[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly sizes = signal<GarmentSize[]>([]);
  readonly colors = signal<GarmentColor[]>([]);
  readonly accounts = signal<Account[]>([]);

  // Transaction Signals
  readonly fabricPurchases = signal<FabricPurchase[]>([]);
  readonly processingChallans = signal<ProcessingChallan[]>([]);
  readonly processingReceipts = signal<ProcessingReceipt[]>([]);
  readonly fabricSales = signal<FabricSale[]>([]);
  readonly stockTransfers = signal<StockTransfer[]>([]);
  readonly boms = signal<BOM[]>([]);
  readonly productionOrders = signal<ProductionOrder[]>([]);
  readonly materialIssues = signal<MaterialIssue[]>([]);
  readonly productionCompletions = signal<ProductionCompletion[]>([]);
  readonly garmentSales = signal<GarmentSale[]>([]);
  readonly otherItemSales = signal<OtherItemSale[]>([]);
  readonly journalEntries = signal<JournalEntry[]>([]);
  readonly stockMovements = signal<StockMovement[]>([]);
  readonly warehouseStocks = signal<WarehouseStockItem[]>([]);

  // Demo step progress tracking
  readonly demoSteps = signal<DemoStep[]>([
    {
      step: 1,
      title: 'Purchase Raw Fabric',
      description: 'Purchase 1,000 meters of Raw Greige Cotton from Al-Karam Cotton Mills @ Rs. 380/m.',
      actionLabel: 'Execute Step 1 (Purchase 1,000m)',
      completed: false,
      module: 'fabric-purchase'
    },
    {
      step: 2,
      title: 'Dispatch to Processing Mill',
      description: 'Send 1,000 meters of raw fabric to Sitara Dyeing & Finishing Mills for dyeing & processing.',
      actionLabel: 'Execute Step 2 (Dispatch 1,000m)',
      completed: false,
      module: 'processing-mill'
    },
    {
      step: 3,
      title: 'Receive Processed Fabric',
      description: 'Receive 980 meters dyed fabric from mill. Track 20m shortage and capitalize processing charges (Rs. 85/m).',
      actionLabel: 'Execute Step 3 (Receive 980m)',
      completed: false,
      module: 'processing-mill'
    },
    {
      step: 4,
      title: 'Route A: Direct Fabric Sale',
      description: 'Sell 300 meters of dyed fabric directly to Gul Ahmed Apparel @ Rs. 750/m.',
      actionLabel: 'Execute Step 4 (Sell 300m)',
      completed: false,
      module: 'fabric-sales'
    },
    {
      step: 5,
      title: 'Route B: Transfer to Factory',
      description: 'Transfer 500 meters of processed fabric to Garment Factory Warehouse at cost.',
      actionLabel: 'Execute Step 5 (Transfer 500m)',
      completed: false,
      module: 'stock-transfer'
    },
    {
      step: 6,
      title: 'Create Production Order',
      description: 'Create production order for 200 Men Formal Cotton Shirts using the Standard Shirt BOM.',
      actionLabel: 'Execute Step 6 (Order 200 Shirts)',
      completed: false,
      module: 'garment-production'
    },
    {
      step: 7,
      title: 'Issue Materials from Factory',
      description: 'Issue 336m fabric, 1600 buttons, 4000m thread, 200 labels, and 200 polybags from factory stock to production.',
      actionLabel: 'Execute Step 7 (Issue Materials)',
      completed: false,
      module: 'garment-production'
    },
    {
      step: 8,
      title: 'Complete Production',
      description: 'Finish production of 200 shirts (195 accepted, 5 rejected), allocating labor & overhead.',
      actionLabel: 'Execute Step 8 (Finish 200 Shirts)',
      completed: false,
      module: 'garment-production'
    },
    {
      step: 9,
      title: 'Receive Finished Garments',
      description: 'Finished 195 accepted shirts received into Finished Goods stock with computed unit cost.',
      actionLabel: 'Execute Step 9 (Stock In Garments)',
      completed: false,
      module: 'finished-goods'
    },
    {
      step: 10,
      title: 'Sell Ready-Made Garments',
      description: 'Sell 150 Men Formal Shirts to Khaadi Retail @ Rs. 2,450/shirt with COGS recognition.',
      actionLabel: 'Execute Step 10 (Sell 150 Shirts)',
      completed: false,
      module: 'finished-goods'
    },
    {
      step: 11,
      title: 'Review Audit & Reports',
      description: 'Inspect Trial Balance, Gross Margin, Inventory Valuation, and Financial Statements.',
      actionLabel: 'Open Financial Reports',
      completed: false,
      module: 'reports'
    }
  ]);

  constructor() {
    this.initializeData();
  }

  // Current active date in DD-MM-YYYY
  readonly currentDate = signal<string>(this.formatDate(new Date()));

  formatDate(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // --- COMPUTED DASHBOARD KPIS ---
  readonly totalFabricPurchasedMeters = computed(() => {
    return this.fabricPurchases()
      .filter(p => p.isPosted)
      .reduce((acc, curr) => acc + curr.quantity, 0);
  });

  readonly fabricAtMillsMeters = computed(() => {
    return this.processingChallans()
      .filter(c => c.status === 'Dispatched' || c.status === 'Partially Received')
      .reduce((acc, curr) => acc + (curr.quantityDispatched - curr.quantityReceivedTotal - curr.quantityShortageTotal), 0);
  });

  readonly processedFabricStockMeters = computed(() => {
    return this.products()
      .filter(p => p.category === 'PROCESSED_FABRIC')
      .reduce((acc, curr) => acc + curr.currentStock, 0);
  });

  readonly fabricSoldMeters = computed(() => {
    return this.fabricSales()
      .reduce((acc, curr) => acc + curr.quantity, 0);
  });

  readonly garmentsProducedCount = computed(() => {
    return this.productionCompletions()
      .reduce((acc, curr) => acc + curr.acceptedQty, 0);
  });

  readonly garmentsStockCount = computed(() => {
    return this.products()
      .filter(p => p.category === 'FINISHED_GARMENT')
      .reduce((acc, curr) => acc + curr.currentStock, 0);
  });

  readonly totalPurchasesAmount = computed(() => {
    return this.fabricPurchases()
      .filter(p => p.isPosted)
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
  });

  readonly totalSalesAmount = computed(() => {
    const fabricSales = this.fabricSales().reduce((acc, s) => acc + s.netAmount, 0);
    const garmentSales = this.garmentSales().reduce((acc, s) => acc + s.netAmount, 0);
    const otherSales = this.otherItemSales().reduce((acc, s) => acc + (s.isReturn ? -s.netAmount : s.netAmount), 0);
    return fabricSales + garmentSales + otherSales;
  });

  readonly totalCustomerReceivables = computed(() => {
    return this.customers().reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  });

  readonly totalSupplierPayables = computed(() => {
    const supp = this.suppliers().reduce((acc, s) => acc + Math.max(0, s.balance), 0);
    const mills = this.mills().reduce((acc, m) => acc + Math.max(0, m.balance), 0);
    return supp + mills;
  });

  readonly totalProductionCosts = computed(() => {
    return this.productionCompletions().reduce((acc, c) => acc + c.totalProductionCost, 0);
  });

  readonly totalCostOfGoodsSold = computed(() => {
    const fCogs = this.fabricSales().reduce((acc, s) => acc + s.totalCogs, 0);
    const gCogs = this.garmentSales().reduce((acc, s) => acc + s.totalCogs, 0);
    const oCogs = this.otherItemSales().reduce((acc, s) => acc + s.totalCogs, 0);
    return fCogs + gCogs + oCogs;
  });

  readonly estimatedGrossProfit = computed(() => {
    return this.totalSalesAmount() - this.totalCostOfGoodsSold();
  });

  readonly totalInventoryValuation = computed(() => {
    return this.products().reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  });

  // --- INITIALIZATION & LOCALSTORAGE ---
  initializeData() {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY_PREFIX + 'products');
      if (savedProducts) {
        this.loadFromStorage();
        return;
      }
    } catch {
      // localStorage fallback
    }
    this.seedInitialData();
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(this.products()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'suppliers', JSON.stringify(this.suppliers()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(this.customers()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'mills', JSON.stringify(this.mills()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'warehouses', JSON.stringify(this.warehouses()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'sizes', JSON.stringify(this.sizes()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'colors', JSON.stringify(this.colors()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'accounts', JSON.stringify(this.accounts()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'fabricPurchases', JSON.stringify(this.fabricPurchases()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'processingChallans', JSON.stringify(this.processingChallans()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'processingReceipts', JSON.stringify(this.processingReceipts()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'fabricSales', JSON.stringify(this.fabricSales()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'stockTransfers', JSON.stringify(this.stockTransfers()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'boms', JSON.stringify(this.boms()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'productionOrders', JSON.stringify(this.productionOrders()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'materialIssues', JSON.stringify(this.materialIssues()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'productionCompletions', JSON.stringify(this.productionCompletions()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'garmentSales', JSON.stringify(this.garmentSales()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'otherItemSales', JSON.stringify(this.otherItemSales()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'journalEntries', JSON.stringify(this.journalEntries()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'stockMovements', JSON.stringify(this.stockMovements()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'warehouseStocks', JSON.stringify(this.warehouseStocks()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'demoSteps', JSON.stringify(this.demoSteps()));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  loadFromStorage() {
    try {
      this.products.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'products') || '[]'));
      this.suppliers.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'suppliers') || '[]'));
      this.customers.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'customers') || '[]'));
      this.mills.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'mills') || '[]'));
      this.warehouses.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'warehouses') || '[]'));
      this.sizes.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'sizes') || '[]'));
      this.colors.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'colors') || '[]'));
      this.accounts.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'accounts') || '[]'));
      this.fabricPurchases.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'fabricPurchases') || '[]'));
      this.processingChallans.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'processingChallans') || '[]'));
      this.processingReceipts.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'processingReceipts') || '[]'));
      this.fabricSales.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'fabricSales') || '[]'));
      this.stockTransfers.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'stockTransfers') || '[]'));
      this.boms.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'boms') || '[]'));
      this.productionOrders.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'productionOrders') || '[]'));
      this.materialIssues.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'materialIssues') || '[]'));
      this.productionCompletions.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'productionCompletions') || '[]'));
      this.garmentSales.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'garmentSales') || '[]'));
      this.otherItemSales.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'otherItemSales') || '[]'));
      this.journalEntries.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'journalEntries') || '[]'));
      this.stockMovements.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'stockMovements') || '[]'));
      this.warehouseStocks.set(JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'warehouseStocks') || '[]'));
      const savedSteps = localStorage.getItem(STORAGE_KEY_PREFIX + 'demoSteps');
      if (savedSteps) {
        this.demoSteps.set(JSON.parse(savedSteps));
      }
    } catch (e) {
      console.warn('Error loading from storage, reseeding:', e);
      this.seedInitialData();
    }
  }

  seedInitialData() {
    // 1. Suppliers
    const suppliers: Supplier[] = [
      {
        id: 'SUP-001',
        code: 'SUP-001',
        name: 'Al-Karam Cotton Mills',
        contactPerson: 'Mian Tariq Mehmood',
        phone: '+92 300 8472190',
        email: 'sales@alkaram-textiles.pk',
        address: 'Small Industrial Estate, Sargodha Road, Faisalabad',
        balance: 0,
        taxId: 'NTN-2849102-4'
      },
      {
        id: 'SUP-002',
        code: 'SUP-002',
        name: 'Sapphire Textile Mills',
        contactPerson: 'Zubair Farooq',
        phone: '+92 321 4455890',
        email: 'orders@sapphiretextile.com',
        address: '1.5 KM Defence Road, Off Raiwind Road, Lahore',
        balance: 150000,
        taxId: 'NTN-1940294-1'
      },
      {
        id: 'SUP-003',
        code: 'SUP-003',
        name: 'Kohinoor Weaving & Spun Ltd',
        contactPerson: 'Rana Asif Ali',
        phone: '+92 333 6128900',
        email: 'info@kohinoorweaving.com',
        address: 'Khanewal Road, Industrial Area, Multan',
        balance: 0,
        taxId: 'NTN-3891024-8'
      }
    ];

    // 2. Customers
    const customers: Customer[] = [
      {
        id: 'CUS-001',
        code: 'CUS-001',
        name: 'Gul Ahmed Apparel Stores',
        contactPerson: 'Khurram Shehzad',
        phone: '+92 300 2198450',
        email: 'procurement@gulahmedretail.com',
        address: 'Plot 82, Landhi Industrial Area, Karachi',
        balance: 420000,
        creditLimit: 3000000,
        taxId: 'NTN-7362910-2'
      },
      {
        id: 'CUS-002',
        code: 'CUS-002',
        name: 'Khaadi Retail Network',
        contactPerson: 'Farhan Zaidi',
        phone: '+92 322 8899120',
        email: 'vendor@khaadistores.com',
        address: 'Gulberg III, MM Alam Road, Lahore',
        balance: 180000,
        creditLimit: 5000000,
        taxId: 'NTN-8921045-7'
      },
      {
        id: 'CUS-003',
        code: 'CUS-003',
        name: 'Outfitters Fashion House',
        contactPerson: 'Hamza Bilal',
        phone: '+92 345 5566778',
        email: 'accounts@outfitters.com.pk',
        address: 'Sector I-9/3 Industrial Area, Islamabad',
        balance: 0,
        creditLimit: 2500000,
        taxId: 'NTN-5412903-9'
      }
    ];

    // 3. Processing Mills
    const mills: ProcessingMill[] = [
      {
        id: 'MIL-001',
        code: 'MIL-001',
        name: 'Sitara Dyeing & Finishing Mills',
        contactPerson: 'Engineer Rashid Jamil',
        phone: '+92 301 7788440',
        email: 'jobwork@sitaradyeing.pk',
        address: 'Millat Road, Industrial Cluster, Faisalabad',
        servicesOffered: ['Reactive Dyeing', 'Pigment Printing', 'Enzyme Washing', 'Soft Finish'],
        defaultRatePerMeter: 85,
        balance: 0
      },
      {
        id: 'MIL-002',
        code: 'MIL-002',
        name: 'Crescent Textile Processing Ltd',
        contactPerson: 'Malik Nasir',
        phone: '+92 312 9900112',
        email: 'processing@crescenttex.com',
        address: 'Lahore-Sheikhupura Road, Sheikhupura',
        servicesOffered: ['Continuous Dyeing', 'Rotary Screen Printing', 'Mercerizing', 'Sanforizing'],
        defaultRatePerMeter: 95,
        balance: 0
      }
    ];

    // 4. Warehouses
    const warehouses: Warehouse[] = [
      {
        id: 'WH-001',
        code: 'WH-CENTRAL',
        name: 'Central Raw & Fabric Warehouse',
        type: 'CENTRAL',
        address: 'Warehouse Hub #4, SITE Area, Karachi',
        isFactory: false
      },
      {
        id: 'WH-002',
        code: 'WH-FACTORY',
        name: 'Garment Factory Warehouse',
        type: 'FACTORY',
        address: 'Industrial Unit 12-B, Korangi Industrial Zone, Karachi',
        isFactory: true
      },
      {
        id: 'WH-MILL',
        code: 'WH-EXT-MILL',
        name: 'External Processing Mills (In-Transit / Job Work)',
        type: 'PROCESSING_MILL',
        address: 'Virtual External Mill Transit Location',
        isFactory: false
      }
    ];

    // 5. Garment Sizes and Colors
    const sizes: GarmentSize[] = [
      { id: 'SZ-S', code: 'S', name: 'Small (38)' },
      { id: 'SZ-M', code: 'M', name: 'Medium (40)' },
      { id: 'SZ-L', code: 'L', name: 'Large (42)' },
      { id: 'SZ-XL', code: 'XL', name: 'Extra Large (44)' }
    ];

    const colors: GarmentColor[] = [
      { id: 'COL-NVY', code: 'NVY', name: 'Navy Blue', hex: '#1e3a8a' },
      { id: 'COL-WHT', code: 'WHT', name: 'Crisp White', hex: '#ffffff' },
      { id: 'COL-KHK', code: 'KHK', name: 'Khaki Beige', hex: '#d97706' },
      { id: 'COL-BLK', code: 'BLK', name: 'Onyx Black', hex: '#0f172a' }
    ];

    // 6. Chart of Accounts
    const accounts: Account[] = [
      { code: '1010', name: 'Cash in Hand', category: 'ASSET', balance: 850000, description: 'Petty cash and factory cash register' },
      { code: '1020', name: 'Meezan Bank Ltd (Current A/c)', category: 'ASSET', balance: 4250000, description: 'Primary business operational bank account' },
      { code: '1100', name: 'Accounts Receivable (Trade Debtors)', category: 'ASSET', balance: 600000, description: 'Customer balances' },
      { code: '1210', name: 'Raw Fabric Inventory', category: 'ASSET', balance: 0, description: 'Unprocessed greige fabric at central warehouse' },
      { code: '1220', name: 'Fabric at Processing Mills', category: 'ASSET', balance: 0, description: 'Fabric sent for dyeing/printing in-transit/at mill' },
      { code: '1230', name: 'Processed Fabric Inventory', category: 'ASSET', balance: 0, description: 'Finished dyed/printed fabric ready for sale or factory' },
      { code: '1240', name: 'Factory Raw Materials & Trims', category: 'ASSET', balance: 184500, description: 'Fabric and accessories in garment factory' },
      { code: '1250', name: 'Work in Progress (WIP)', category: 'ASSET', balance: 0, description: 'Unfinished goods currently on sewing lines' },
      { code: '1260', name: 'Finished Goods Inventory', category: 'ASSET', balance: 0, description: 'Ready-to-ship finished ready-made garments' },
      { code: '1270', name: 'Other Trading Goods Inventory', category: 'ASSET', balance: 135000, description: 'Direct trading items stock' },
      { code: '2010', name: 'Accounts Payable (Suppliers)', category: 'LIABILITY', balance: 150000, description: 'Outstanding payables to yarn and fabric suppliers' },
      { code: '2020', name: 'Processing Mill Payables', category: 'LIABILITY', balance: 0, description: 'Outstanding job work processing charges' },
      { code: '2100', name: 'Sales Tax Payable', category: 'LIABILITY', balance: 35000, description: 'Accrued sales tax payable to FBR' },
      { code: '3010', name: "Owner's Equity & Capital", category: 'EQUITY', balance: 5834500, description: 'Initial paid-up business equity' },
      { code: '4010', name: 'Sales Revenue - Processed Fabric', category: 'REVENUE', balance: 0, description: 'Direct fabric wholesale revenue' },
      { code: '4020', name: 'Sales Revenue - Finished Garments', category: 'REVENUE', balance: 0, description: 'Ready-made garment revenue' },
      { code: '4030', name: 'Sales Revenue - Trading Items', category: 'REVENUE', balance: 0, description: 'Embroidered patches and accessory trading sales' },
      { code: '4040', name: 'Sales Returns & Allowances', category: 'REVENUE', balance: 0, description: 'Customer returns contra revenue' },
      { code: '5010', name: 'Cost of Goods Sold - Fabric', category: 'EXPENSE', balance: 0, description: 'COGS for direct processed fabric sales' },
      { code: '5020', name: 'Cost of Goods Sold - Garments', category: 'EXPENSE', balance: 0, description: 'COGS for ready-made garment sales' },
      { code: '5030', name: 'Cost of Goods Sold - Trading Items', category: 'EXPENSE', balance: 0, description: 'COGS for trading sales' },
      { code: '6010', name: 'Direct Labor Expense', category: 'EXPENSE', balance: 0, description: 'Direct sewing masters and tailors piece-rate' },
      { code: '6020', name: 'Factory Overhead Expense', category: 'EXPENSE', balance: 0, description: 'Electricity, machinery depreciation, cutting oil' },
      { code: '6030', name: 'Mill Shortage & Wastage Loss', category: 'EXPENSE', balance: 0, description: 'Shortage incurred during bleaching/dyeing' },
      { code: '7010', name: 'Administrative & General Expenses', category: 'EXPENSE', balance: 0, description: 'Office rent, salaries, utilities' }
    ];

    // 7. Inventory Items (Products)
    const products: ProductItem[] = [
      {
        id: 'ITM-001',
        code: 'FAB-RAW-001',
        name: '100% Greige Cotton Sheeting',
        category: 'RAW_FABRIC',
        unit: 'meters',
        purchasePrice: 380,
        salesPrice: 450,
        currentStock: 0,
        minStockLevel: 500,
        composition: '100% Combed Cotton',
        color: 'Greige (Natural)',
        width: '63 inches',
        gsm: 130,
        design: 'Plain Weave 60x60/90x88',
        description: 'High-grade fine greige fabric for premium dress shirts'
      },
      {
        id: 'ITM-002',
        code: 'FAB-RAW-002',
        name: 'Poly-Cotton Twill Grey Fabric',
        category: 'RAW_FABRIC',
        unit: 'meters',
        purchasePrice: 420,
        salesPrice: 510,
        currentStock: 0,
        minStockLevel: 400,
        composition: '65/35 Cotton-Poly Twill',
        color: 'Unbleached Grey',
        width: '58 inches',
        gsm: 220,
        design: '2/1 Twill Weave',
        description: 'Heavy duty trouser and uniform greige fabric'
      },
      {
        id: 'ITM-003',
        code: 'FAB-PROC-001',
        name: 'Dyed Navy Blue Cotton Poplin',
        category: 'PROCESSED_FABRIC',
        unit: 'meters',
        purchasePrice: 465, // Will be updated dynamically on receipt
        salesPrice: 750,
        currentStock: 0,
        minStockLevel: 200,
        composition: '100% Cotton Reactive Dyed',
        color: 'Navy Blue (PMS 19-4029)',
        width: '58 inches',
        gsm: 125,
        design: 'Solid Mercerized Soft Finish',
        description: 'Finished dyed fabric ready for shirt making or wholesale direct sale'
      },
      {
        id: 'ITM-004',
        code: 'FAB-PROC-002',
        name: 'Printed Khaki Twill Fabric',
        category: 'PROCESSED_FABRIC',
        unit: 'meters',
        purchasePrice: 515,
        salesPrice: 850,
        currentStock: 0,
        minStockLevel: 200,
        composition: '65/35 Cotton-Poly',
        color: 'Khaki Beige',
        width: '56 inches',
        gsm: 215,
        design: 'Micro-Checked Reactive Print',
        description: 'Dyed and printed chino trouser fabric'
      },
      {
        id: 'ITM-005',
        code: 'ACC-BTN-001',
        name: 'Resin 4-Hole Shirt Buttons 18L',
        category: 'TRIMS_ACCESSORIES',
        unit: 'pcs',
        purchasePrice: 2.5,
        salesPrice: 4.0,
        currentStock: 5000,
        minStockLevel: 1000,
        color: 'Pearl White',
        description: 'Standard 18-ligne button for men dress shirts'
      },
      {
        id: 'ITM-006',
        code: 'ACC-THR-001',
        name: 'Spun Polyester Sewing Thread 40/2',
        category: 'TRIMS_ACCESSORIES',
        unit: 'meters',
        purchasePrice: 0.15,
        salesPrice: 0.30,
        currentStock: 50000, // 10 cones of 5,000m
        minStockLevel: 10000,
        color: 'Navy Blue & White',
        description: 'High tensile 40/2 polyester sewing thread'
      },
      {
        id: 'ITM-007',
        code: 'ACC-LBL-001',
        name: 'Woven Brand Main Label & Care Tag',
        category: 'TRIMS_ACCESSORIES',
        unit: 'pcs',
        purchasePrice: 6.0,
        salesPrice: 9.0,
        currentStock: 2500,
        minStockLevel: 500,
        description: 'Damask woven soft neck label + printed satin wash-care label set'
      },
      {
        id: 'ITM-008',
        code: 'ACC-PKG-001',
        name: 'Clear Polybag 12x16 with Warning',
        category: 'TRIMS_ACCESSORIES',
        unit: 'pcs',
        purchasePrice: 4.5,
        salesPrice: 7.0,
        currentStock: 3000,
        minStockLevel: 500,
        description: 'Self-adhesive transparent PP packaging polybag'
      },
      {
        id: 'ITM-009',
        code: 'TRD-EMB-001',
        name: 'Designer Embroidered Lawn Patches',
        category: 'OTHER_TRADING',
        unit: 'pcs',
        purchasePrice: 135,
        salesPrice: 320,
        currentStock: 1000,
        minStockLevel: 150,
        description: 'Multi-head zari & thread embroidered floral neckline motifs'
      },
      {
        id: 'ITM-010',
        code: 'GAR-SHR-001',
        name: "Men's Formal Cotton Shirt",
        category: 'FINISHED_GARMENT',
        unit: 'pcs',
        purchasePrice: 1100, // Estimated standard production cost
        salesPrice: 2450,
        currentStock: 0,
        minStockLevel: 50,
        color: 'Navy Blue',
        size: 'Medium (40)',
        design: 'Slim Fit Full Sleeve Kent Collar',
        description: 'Executive formal cotton shirt with mother-of-pearl buttons'
      },
      {
        id: 'ITM-011',
        code: 'GAR-PNT-001',
        name: 'Casual Chino Pants Khaki',
        category: 'FINISHED_GARMENT',
        unit: 'pcs',
        purchasePrice: 1450,
        salesPrice: 3200,
        currentStock: 0,
        minStockLevel: 40,
        color: 'Khaki Beige',
        size: '32 Waist',
        design: 'Straight Cut Comfort Stretch',
        description: 'Durable everyday casual chinos'
      }
    ];

    // 8. Warehouse initial stocks for Factory Warehouse accessories
    const warehouseStocks: WarehouseStockItem[] = [
      {
        warehouseId: 'WH-002',
        warehouseName: 'Garment Factory Warehouse',
        itemId: 'ITM-005',
        itemName: 'Resin 4-Hole Shirt Buttons 18L',
        category: 'TRIMS_ACCESSORIES',
        quantity: 5000,
        unit: 'pcs',
        unitCost: 2.5,
        totalValue: 12500
      },
      {
        warehouseId: 'WH-002',
        warehouseName: 'Garment Factory Warehouse',
        itemId: 'ITM-006',
        itemName: 'Spun Polyester Sewing Thread 40/2',
        category: 'TRIMS_ACCESSORIES',
        quantity: 50000,
        unit: 'meters',
        unitCost: 0.15,
        totalValue: 7500
      },
      {
        warehouseId: 'WH-002',
        warehouseName: 'Garment Factory Warehouse',
        itemId: 'ITM-007',
        itemName: 'Woven Brand Main Label & Care Tag',
        category: 'TRIMS_ACCESSORIES',
        quantity: 2500,
        unit: 'pcs',
        unitCost: 6.0,
        totalValue: 15000
      },
      {
        warehouseId: 'WH-002',
        warehouseName: 'Garment Factory Warehouse',
        itemId: 'ITM-008',
        itemName: 'Clear Polybag 12x16 with Warning',
        category: 'TRIMS_ACCESSORIES',
        quantity: 3000,
        unit: 'pcs',
        unitCost: 4.5,
        totalValue: 13500
      },
      {
        warehouseId: 'WH-001',
        warehouseName: 'Central Raw & Fabric Warehouse',
        itemId: 'ITM-009',
        itemName: 'Designer Embroidered Lawn Patches',
        category: 'OTHER_TRADING',
        quantity: 1000,
        unit: 'pcs',
        unitCost: 135,
        totalValue: 135000
      }
    ];

    // 9. Standard BOM for Men's Formal Cotton Shirt
    const boms: BOM[] = [
      {
        id: 'BOM-001',
        bomNo: 'BOM-SHR-M-01',
        garmentItemId: 'ITM-010',
        garmentName: "Men's Formal Cotton Shirt",
        styleName: 'Exec Slim Fit Navy',
        size: 'Medium (40)',
        color: 'Navy Blue',
        version: 'v1.0',
        components: [
          {
            itemId: 'ITM-003',
            itemName: 'Dyed Navy Blue Cotton Poplin',
            category: 'PROCESSED_FABRIC',
            requiredQty: 1.60,
            unit: 'meters',
            wastagePercent: 5.0, // 5% pattern cutting wastage
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
        ],
        totalMaterialCost: 827.22,
        standardLaborCost: 220.00,
        standardOverheadCost: 130.00,
        estimatedUnitCost: 1177.22,
        effectiveDate: '01-10-2026',
        isActive: true,
        notes: 'Standard production BOM with 5% cutting wastage on fabric'
      }
    ];

    // Set signals
    this.suppliers.set(suppliers);
    this.customers.set(customers);
    this.mills.set(mills);
    this.warehouses.set(warehouses);
    this.sizes.set(sizes);
    this.colors.set(colors);
    this.accounts.set(accounts);
    this.products.set(products);
    this.warehouseStocks.set(warehouseStocks);
    this.boms.set(boms);
    this.fabricPurchases.set([]);
    this.processingChallans.set([]);
    this.processingReceipts.set([]);
    this.fabricSales.set([]);
    this.stockTransfers.set([]);
    this.productionOrders.set([]);
    this.materialIssues.set([]);
    this.productionCompletions.set([]);
    this.garmentSales.set([]);
    this.otherItemSales.set([]);
    this.journalEntries.set([]);
    this.stockMovements.set([]);

    this.saveToStorage();
  }

  // --- WAREHOUSE STOCK HELPER ---
  getWarehouseStock(warehouseId: string, itemId: string, lotNo?: string): number {
    const records = this.warehouseStocks().filter(ws => 
      ws.warehouseId === warehouseId && 
      ws.itemId === itemId &&
      (!lotNo || ws.lotNo === lotNo)
    );
    return records.reduce((sum, r) => sum + r.quantity, 0);
  }

  updateWarehouseStock(
    warehouseId: string,
    itemId: string,
    deltaQty: number,
    unitCost: number,
    lotNo?: string
  ) {
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    const item = this.products().find(p => p.id === itemId);
    if (!warehouse || !item) return;

    this.warehouseStocks.update(stocks => {
      const idx = stocks.findIndex(s => s.warehouseId === warehouseId && s.itemId === itemId && s.lotNo === lotNo);
      if (idx >= 0) {
        const existing = stocks[idx];
        const newQty = existing.quantity + deltaQty;
        if (newQty < 0) {
          console.warn(`Stock became negative in ${warehouse.name} for ${item.name}: ${newQty}`);
        }
        const updated = [...stocks];
        updated[idx] = {
          ...existing,
          quantity: Math.max(0, newQty),
          unitCost: unitCost || existing.unitCost,
          totalValue: Math.max(0, newQty) * (unitCost || existing.unitCost)
        };
        return updated;
      } else if (deltaQty > 0) {
        return [
          ...stocks,
          {
            warehouseId,
            warehouseName: warehouse.name,
            itemId,
            itemName: item.name,
            category: item.category,
            lotNo,
            quantity: deltaQty,
            unit: item.unit,
            unitCost,
            totalValue: deltaQty * unitCost
          }
        ];
      }
      return stocks;
    });

    // Also update global product stock
    this.products.update(items => {
      return items.map(p => {
        if (p.id === itemId) {
          const newTotalStock = Math.max(0, p.currentStock + deltaQty);
          return { ...p, currentStock: newTotalStock };
        }
        return p;
      });
    });
  }

  // --- ACCOUNTING HELPER: Post balanced Journal Voucher ---
  postJournalEntry(
    referenceType: JournalEntry['referenceType'],
    referenceId: string,
    referenceNo: string,
    description: string,
    lines: { accountCode: string; debit: number; credit: number; notes?: string }[],
    date: string = this.currentDate()
  ) {
    const totalDebit = lines.reduce((acc, l) => acc + (l.debit || 0), 0);
    const totalCredit = lines.reduce((acc, l) => acc + (l.credit || 0), 0);

    // Round check to prevent tiny JS floating point mismatches
    if (Math.abs(totalDebit - totalCredit) > 0.05) {
      this.notification.error('Accounting Error', `Unbalanced Journal Entry for ${referenceNo}: Debits (Rs. ${totalDebit.toFixed(2)}) != Credits (Rs. ${totalCredit.toFixed(2)})`);
      return null;
    }

    const entryNo = `JV-${new Date().getFullYear()}-${String(this.journalEntries().length + 1).padStart(4, '0')}`;
    const allAccounts = this.accounts();

    const journalLines = lines.map(line => {
      const acc = allAccounts.find(a => a.code === line.accountCode);
      return {
        accountCode: line.accountCode,
        accountName: acc ? acc.name : line.accountCode,
        debit: line.debit || 0,
        credit: line.credit || 0,
        notes: line.notes
      };
    });

    const newEntry: JournalEntry = {
      id: 'JV-' + Math.random().toString(36).substring(2, 9),
      entryNo,
      date,
      referenceType,
      referenceId,
      referenceNo,
      description,
      lines: journalLines,
      totalDebit,
      totalCredit
    };

    // Update account balances
    this.accounts.update(accountsList => {
      return accountsList.map(acc => {
        const line = lines.find(l => l.accountCode === acc.code);
        if (!line) return acc;
        let delta = 0;
        if (acc.category === 'ASSET' || acc.category === 'EXPENSE') {
          delta = (line.debit || 0) - (line.credit || 0);
        } else {
          // LIABILITY, EQUITY, REVENUE
          delta = (line.credit || 0) - (line.debit || 0);
        }
        return { ...acc, balance: acc.balance + delta };
      });
    });

    this.journalEntries.update(entries => [newEntry, ...entries]);
    return newEntry;
  }

  // --- AUDIT STOCK MOVEMENT ---
  recordStockMovement(
    itemId: string,
    itemName: string,
    warehouseId: string,
    warehouseName: string,
    movementType: StockMovement['movementType'],
    quantity: number,
    unit: any,
    unitCost: number,
    referenceNo: string,
    lotNo?: string
  ) {
    const currentStock = this.getWarehouseStock(warehouseId, itemId, lotNo);
    const movement: StockMovement = {
      id: 'SM-' + Math.random().toString(36).substring(2, 9),
      date: this.currentDate(),
      itemId,
      itemName,
      lotNo,
      warehouseId,
      warehouseName,
      movementType,
      quantity,
      unit,
      unitCost,
      totalValue: Math.abs(quantity) * unitCost,
      referenceNo,
      balanceAfter: currentStock + quantity
    };

    this.stockMovements.update(moves => [movement, ...moves]);
  }

  // ==========================================
  // 1. FABRIC PURCHASE WORKFLOW
  // ==========================================
  createFabricPurchase(purchaseData: Omit<FabricPurchase, 'id' | 'purchaseNo' | 'totalAmount' | 'taxAmount' | 'isPosted'>): FabricPurchase {
    const grossAmount = (purchaseData.quantity * purchaseData.rate) - purchaseData.discount + purchaseData.additionalCharges;
    const taxAmount = (grossAmount * (purchaseData.taxRate || 0)) / 100;
    const totalAmount = grossAmount + taxAmount;
    const purchaseNo = `PO-${new Date().getFullYear()}-${String(this.fabricPurchases().length + 1).padStart(4, '0')}`;

    const purchase: FabricPurchase = {
      ...purchaseData,
      id: 'FP-' + Math.random().toString(36).substring(2, 9),
      purchaseNo,
      taxAmount,
      totalAmount,
      isPosted: true
    };

    // 1. Increase Raw Fabric Inventory in Central Warehouse
    this.updateWarehouseStock(purchase.warehouseId, purchase.fabricItemId, purchase.quantity, purchase.rate, purchase.lotNo);

    // 2. Record Stock Movement
    const wh = this.warehouses().find(w => w.id === purchase.warehouseId);
    this.recordStockMovement(
      purchase.fabricItemId,
      purchase.fabricItemName,
      purchase.warehouseId,
      wh ? wh.name : 'Warehouse',
      'PURCHASE_IN',
      purchase.quantity,
      purchase.unit,
      purchase.rate,
      purchase.purchaseNo,
      purchase.lotNo
    );

    // 3. Update Supplier Balance or Cash/Bank
    const unpaidAmount = totalAmount - purchase.paidAmount;
    if (unpaidAmount > 0) {
      this.suppliers.update(sups => {
        return sups.map(s => s.id === purchase.supplierId ? { ...s, balance: s.balance + unpaidAmount } : s);
      });
    }

    // 4. Accounting Entries:
    // Debit: 1210 Raw Fabric Inventory (Total purchases at cost)
    // Credit: 2010 Accounts Payable (or 1010/1020 for paidAmount)
    const journalLines: { accountCode: string; debit: number; credit: number; notes?: string }[] = [
      { accountCode: '1210', debit: grossAmount, credit: 0, notes: `Purchase of ${purchase.quantity}m ${purchase.fabricItemName}` }
    ];
    if (taxAmount > 0) {
      journalLines.push({ accountCode: '2100', debit: taxAmount, credit: 0, notes: 'Input Sales Tax on Fabric Purchase' });
    }

    if (purchase.paidAmount > 0) {
      journalLines.push({
        accountCode: purchase.paymentAccountCode || '1010',
        debit: 0,
        credit: purchase.paidAmount,
        notes: `Immediate payment via ${purchase.paymentAccountCode || 'Cash'}`
      });
    }
    if (unpaidAmount > 0) {
      journalLines.push({
        accountCode: '2010',
        debit: 0,
        credit: unpaidAmount,
        notes: `Payable to supplier ${purchase.supplierName}`
      });
    }

    this.postJournalEntry(
      'PURCHASE',
      purchase.id,
      purchase.purchaseNo,
      `Fabric Purchase from ${purchase.supplierName} (Lot #${purchase.lotNo})`,
      journalLines,
      purchase.date
    );

    this.fabricPurchases.update(fp => [purchase, ...fp]);
    this.saveToStorage();
    this.notification.success('Purchase Posted', `Purchase Order ${purchase.purchaseNo} posted successfully. Inventory increased by ${purchase.quantity} ${purchase.unit}.`);
    return purchase;
  }

  // ==========================================
  // 2. PROCESSING MILL MANAGEMENT
  // ==========================================
  createProcessingChallan(challanData: Omit<ProcessingChallan, 'id' | 'challanNo' | 'quantityReceivedTotal' | 'quantityShortageTotal' | 'status'>): ProcessingChallan | null {
    // Check available raw fabric stock in source warehouse
    const currentStock = this.getWarehouseStock(challanData.sourceWarehouseId, challanData.fabricItemId, challanData.lotNo);
    if (currentStock < challanData.quantityDispatched) {
      this.notification.error('Insufficient Stock', `Source warehouse only has ${currentStock} ${challanData.unit} of Lot #${challanData.lotNo}. Required: ${challanData.quantityDispatched}.`);
      return null;
    }

    const challanNo = `CH-${new Date().getFullYear()}-${String(this.processingChallans().length + 1).padStart(4, '0')}`;
    const item = this.products().find(p => p.id === challanData.fabricItemId);
    const unitCost = item ? item.purchasePrice : 380;

    const challan: ProcessingChallan = {
      ...challanData,
      id: 'CH-' + Math.random().toString(36).substring(2, 9),
      challanNo,
      status: 'Dispatched',
      quantityReceivedTotal: 0,
      quantityShortageTotal: 0
    };

    // 1. Deduct fabric from Source Warehouse
    this.updateWarehouseStock(challan.sourceWarehouseId, challan.fabricItemId, -challan.quantityDispatched, unitCost, challan.lotNo);

    // 2. Add fabric to Virtual Mill Warehouse (WH-MILL)
    this.updateWarehouseStock('WH-MILL', challan.fabricItemId, challan.quantityDispatched, unitCost, challan.lotNo);

    // 3. Record movements
    const srcWh = this.warehouses().find(w => w.id === challan.sourceWarehouseId);
    this.recordStockMovement(
      challan.fabricItemId,
      challan.fabricItemName,
      challan.sourceWarehouseId,
      srcWh ? srcWh.name : 'Central WH',
      'DISPATCH_TO_MILL',
      -challan.quantityDispatched,
      challan.unit,
      unitCost,
      challan.challanNo,
      challan.lotNo
    );

    this.recordStockMovement(
      challan.fabricItemId,
      challan.fabricItemName,
      'WH-MILL',
      challan.millName,
      'DISPATCH_TO_MILL',
      challan.quantityDispatched,
      challan.unit,
      unitCost,
      challan.challanNo,
      challan.lotNo
    );

    // 4. Accounting Entry:
    // Debit: 1220 Fabric at Processing Mills
    // Credit: 1210 Raw Fabric Inventory
    const totalFabricValue = challan.quantityDispatched * unitCost;
    this.postJournalEntry(
      'MILL_DISPATCH',
      challan.id,
      challan.challanNo,
      `Dispatch of ${challan.quantityDispatched}m raw fabric to ${challan.millName} for ${challan.processingType}`,
      [
        { accountCode: '1220', debit: totalFabricValue, credit: 0, notes: `Fabric at mill (${challan.millName})` },
        { accountCode: '1210', debit: 0, credit: totalFabricValue, notes: `Raw fabric dispatched from central stock` }
      ],
      challan.date
    );

    this.processingChallans.update(ch => [challan, ...ch]);
    this.saveToStorage();
    this.notification.success('Challan Dispatched', `Challan ${challan.challanNo} dispatched to ${challan.millName}. Fabric marked as At Mill.`);
    return challan;
  }

  receiveProcessedFabric(receiptData: Omit<ProcessingReceipt, 'id' | 'receiptNo' | 'totalProcessingCost' | 'rawFabricUnitCost' | 'finalValuationUnitCost'>): ProcessingReceipt | null {
    const challan = this.processingChallans().find(c => c.id === receiptData.challanId);
    if (!challan) {
      this.notification.error('Error', 'Challan not found');
      return null;
    }

    const rawItem = this.products().find(p => p.id === receiptData.sourceItemId);
    const rawFabricUnitCost = rawItem ? rawItem.purchasePrice : 380;
    const totalProcessingCost = receiptData.processingCharges + receiptData.transportCharges;
    const totalRawCostSent = receiptData.quantitySent * rawFabricUnitCost;

    // Capitalized Cost Formula:
    // Total Inventory Value of Received Fabric = (Cost of Raw Fabric Sent + Processing Charges + Transport)
    // Unit Valuation Cost = Total Value / Received Qty
    const totalCapitalizedValue = totalRawCostSent + totalProcessingCost;
    const finalValuationUnitCost = receiptData.quantityReceived > 0 
      ? Number((totalCapitalizedValue / receiptData.quantityReceived).toFixed(2))
      : 0;

    const receiptNo = `MR-${new Date().getFullYear()}-${String(this.processingReceipts().length + 1).padStart(4, '0')}`;

    const receipt: ProcessingReceipt = {
      ...receiptData,
      id: 'MR-' + Math.random().toString(36).substring(2, 9),
      receiptNo,
      totalProcessingCost,
      rawFabricUnitCost,
      finalValuationUnitCost
    };

    // 1. Deduct fabric sent from Mill Virtual Stock (WH-MILL)
    this.updateWarehouseStock('WH-MILL', receipt.sourceItemId, -receipt.quantitySent, rawFabricUnitCost, receipt.lotNo);

    // 2. Add processed fabric to receiving warehouse
    this.updateWarehouseStock(receipt.receivingWarehouseId, receipt.processedItemId, receipt.quantityReceived, finalValuationUnitCost, receipt.lotNo);

    // Update the processed product purchase price (valuation cost)
    this.products.update(items => {
      return items.map(p => {
        if (p.id === receipt.processedItemId) {
          return { ...p, purchasePrice: finalValuationUnitCost };
        }
        return p;
      });
    });

    // 3. Record movements
    const destWh = this.warehouses().find(w => w.id === receipt.receivingWarehouseId);
    this.recordStockMovement(
      receipt.sourceItemId,
      receipt.sourceItemName,
      'WH-MILL',
      receipt.millName,
      'RECEIPT_FROM_MILL',
      -receipt.quantitySent,
      'meters',
      rawFabricUnitCost,
      receipt.receiptNo,
      receipt.lotNo
    );

    this.recordStockMovement(
      receipt.processedItemId,
      receipt.processedItemName,
      receipt.receivingWarehouseId,
      destWh ? destWh.name : 'Central WH',
      'RECEIPT_FROM_MILL',
      receipt.quantityReceived,
      'meters',
      finalValuationUnitCost,
      receipt.receiptNo,
      receipt.lotNo
    );

    if (receipt.wastageShortage > 0) {
      this.recordStockMovement(
        receipt.sourceItemId,
        `Processing Shortage (${receipt.sourceItemName})`,
        'WH-MILL',
        receipt.millName,
        'SHORTAGE_MILL',
        receipt.wastageShortage,
        'meters',
        rawFabricUnitCost,
        receipt.receiptNo,
        receipt.lotNo
      );
    }

    // 4. Update Mill Payable Balance
    this.mills.update(millsList => {
      return millsList.map(m => m.id === receipt.millId ? { ...m, balance: m.balance + totalProcessingCost } : m);
    });

    // 5. Update Challan status & counters
    this.processingChallans.update(chList => {
      return chList.map(c => {
        if (c.id === challan.id) {
          const newRecTotal = c.quantityReceivedTotal + receipt.quantityReceived;
          const newShortTotal = c.quantityShortageTotal + receipt.wastageShortage;
          const isDone = (newRecTotal + newShortTotal) >= c.quantityDispatched;
          return {
            ...c,
            quantityReceivedTotal: newRecTotal,
            quantityShortageTotal: newShortTotal,
            status: isDone ? 'Completed' : 'Partially Received'
          };
        }
        return c;
      });
    });

    // 6. Balanced Accounting Entry:
    // Debit: 1230 Processed Fabric Inventory (Capitalized: Raw Cost + Mill Charges)
    // Credit: 1220 Fabric at Processing Mills (Raw Cost sent)
    // Credit: 2020 Processing Mill Payables (Processing charges)
    const journalLines: { accountCode: string; debit: number; credit: number; notes?: string }[] = [
      {
        accountCode: '1230',
        debit: totalCapitalizedValue,
        credit: 0,
        notes: `Processed Fabric ${receipt.processedItemName} received (${receipt.quantityReceived}m @ Rs. ${finalValuationUnitCost})`
      },
      {
        accountCode: '1220',
        debit: 0,
        credit: totalRawCostSent,
        notes: `Relief of raw fabric at mill (${receipt.quantitySent}m @ Rs. ${rawFabricUnitCost})`
      },
      {
        accountCode: '2020',
        debit: 0,
        credit: totalProcessingCost,
        notes: `Mill job work payable to ${receipt.millName}`
      }
    ];

    this.postJournalEntry(
      'MILL_RECEIPT',
      receipt.id,
      receipt.receiptNo,
      `Mill Receipt: ${receipt.processedItemName} from ${receipt.millName} (Shortage: ${receipt.wastageShortage}m)`,
      journalLines,
      receipt.date
    );

    this.processingReceipts.update(pr => [receipt, ...pr]);
    this.saveToStorage();
    this.notification.success('Processed Fabric Received', `Receipt ${receipt.receiptNo} created. Capitalized Unit Cost: Rs. ${finalValuationUnitCost}/m.`);
    return receipt;
  }

  // ==========================================
  // 3. ROUTE A: DIRECT FABRIC SALES
  // ==========================================
  createFabricSale(saleData: Omit<FabricSale, 'id' | 'invoiceNo' | 'grossAmount' | 'taxAmount' | 'netAmount' | 'totalCogs' | 'grossProfit'>): FabricSale | null {
    // 1. Check stock in Central Warehouse
    const availableStock = this.getWarehouseStock('WH-001', saleData.fabricItemId, saleData.lotNo);
    if (availableStock < saleData.quantity) {
      this.notification.error('Stock Shortage', `Available stock in Central Warehouse is ${availableStock} ${saleData.unit}. Requested: ${saleData.quantity}.`);
      return null;
    }

    const grossAmount = (saleData.quantity * saleData.salesRate) - saleData.discount;
    const taxAmount = (grossAmount * (saleData.taxRate || 0)) / 100;
    const netAmount = grossAmount + taxAmount;
    const totalCogs = saleData.quantity * saleData.cogsUnitCost;
    const grossProfit = grossAmount - totalCogs; // Pre-tax profit

    const invoiceNo = `FSI-${new Date().getFullYear()}-${String(this.fabricSales().length + 1).padStart(4, '0')}`;

    const sale: FabricSale = {
      ...saleData,
      id: 'FS-' + Math.random().toString(36).substring(2, 9),
      invoiceNo,
      grossAmount,
      taxAmount,
      netAmount,
      totalCogs,
      grossProfit
    };

    // Deduct stock
    this.updateWarehouseStock('WH-001', sale.fabricItemId, -sale.quantity, sale.cogsUnitCost, sale.lotNo);

    // Record stock movement
    this.recordStockMovement(
      sale.fabricItemId,
      sale.fabricItemName,
      'WH-001',
      'Central Raw & Fabric Warehouse',
      'SALE_OUT',
      -sale.quantity,
      sale.unit,
      sale.cogsUnitCost,
      sale.invoiceNo,
      sale.lotNo
    );

    // Update Customer Balance or Bank
    if (sale.paymentType === 'CREDIT') {
      this.customers.update(custs => {
        return custs.map(c => c.id === sale.customerId ? { ...c, balance: c.balance + netAmount } : c);
      });
    }

    // Accounting Entry:
    // Debit: 1100 Accounts Receivable / 1010 Cash (netAmount)
    // Credit: 4010 Fabric Sales Revenue (grossAmount)
    // Credit: 2100 Sales Tax Payable (taxAmount)
    // Debit: 5010 Cost of Goods Sold - Fabric (totalCogs)
    // Credit: 1230 Processed Fabric Inventory (totalCogs)
    const receivableAccount = sale.paymentType === 'CREDIT' 
      ? '1100' 
      : (sale.paymentAccountCode || '1010');

    const journalLines: { accountCode: string; debit: number; credit: number; notes?: string }[] = [
      { accountCode: receivableAccount, debit: netAmount, credit: 0, notes: `Receivable from ${sale.customerName} for ${sale.invoiceNo}` },
      { accountCode: '4010', debit: 0, credit: grossAmount, notes: `Fabric sale revenue (${sale.quantity}m @ Rs. ${sale.salesRate})` }
    ];
    if (taxAmount > 0) {
      journalLines.push({ accountCode: '2100', debit: 0, credit: taxAmount, notes: 'Output Sales Tax' });
    }
    // COGS entries
    journalLines.push(
      { accountCode: '5010', debit: totalCogs, credit: 0, notes: `COGS for ${sale.fabricItemName} (${sale.quantity}m @ Rs. ${sale.cogsUnitCost})` },
      { accountCode: '1230', debit: 0, credit: totalCogs, notes: `Processed fabric stock reduction` }
    );

    this.postJournalEntry(
      'FABRIC_SALE',
      sale.id,
      sale.invoiceNo,
      `Fabric Sale to ${sale.customerName} (${sale.quantity}m ${sale.fabricItemName})`,
      journalLines,
      sale.date
    );

    this.fabricSales.update(fs => [sale, ...fs]);
    this.saveToStorage();
    this.notification.success('Fabric Sold', `Invoice ${sale.invoiceNo} posted. Gross Profit: Rs. ${grossProfit.toLocaleString()}`);
    return sale;
  }

  // ==========================================
  // 4. ROUTE B: STOCK TRANSFER TO FACTORY
  // ==========================================
  createStockTransfer(transferData: Omit<StockTransfer, 'id' | 'transferNo' | 'totalValue'>): StockTransfer | null {
    const available = this.getWarehouseStock(transferData.sourceWarehouseId, transferData.itemId, transferData.lotNo);
    if (available < transferData.quantity) {
      this.notification.error('Insufficient Stock', `Source warehouse only has ${available} ${transferData.unit}. Cannot transfer ${transferData.quantity}.`);
      return null;
    }

    const totalValue = transferData.quantity * transferData.unitCost;
    const transferNo = `TR-${new Date().getFullYear()}-${String(this.stockTransfers().length + 1).padStart(4, '0')}`;

    const transfer: StockTransfer = {
      ...transferData,
      id: 'TR-' + Math.random().toString(36).substring(2, 9),
      transferNo,
      totalValue
    };

    // 1. Deduct from Source Warehouse
    this.updateWarehouseStock(transfer.sourceWarehouseId, transfer.itemId, -transfer.quantity, transfer.unitCost, transfer.lotNo);

    // 2. Add to Destination Factory Warehouse
    this.updateWarehouseStock(transfer.destinationWarehouseId, transfer.itemId, transfer.quantity, transfer.unitCost, transfer.lotNo);

    // 3. Movement logs
    this.recordStockMovement(
      transfer.itemId,
      transfer.itemName,
      transfer.sourceWarehouseId,
      transfer.sourceWarehouseName,
      'TRANSFER_OUT',
      -transfer.quantity,
      transfer.unit,
      transfer.unitCost,
      transfer.transferNo,
      transfer.lotNo
    );

    this.recordStockMovement(
      transfer.itemId,
      transfer.itemName,
      transfer.destinationWarehouseId,
      transfer.destinationWarehouseName,
      'TRANSFER_IN',
      transfer.quantity,
      transfer.unit,
      transfer.unitCost,
      transfer.transferNo,
      transfer.lotNo
    );

    // 4. Accounting Entry:
    // Debit: 1240 Factory Raw Materials & Trims
    // Credit: 1230 Processed Fabric Inventory
    // Note: No revenue or profit recognized because this is an internal transfer!
    this.postJournalEntry(
      'STOCK_TRANSFER',
      transfer.id,
      transfer.transferNo,
      `Internal Stock Transfer of ${transfer.quantity}m ${transfer.itemName} from Central WH to Garment Factory`,
      [
        { accountCode: '1240', debit: totalValue, credit: 0, notes: `Factory raw materials inventory received` },
        { accountCode: '1230', debit: 0, credit: totalValue, notes: `Processed fabric inventory dispatched` }
      ],
      transfer.date
    );

    this.stockTransfers.update(st => [transfer, ...st]);
    this.saveToStorage();
    this.notification.success('Transfer Complete', `Stock Transfer ${transfer.transferNo} completed. Fabric now available at Factory Warehouse.`);
    return transfer;
  }

  // ==========================================
  // 5. BOM MANAGEMENT
  // ==========================================
  saveBOM(bomData: Omit<BOM, 'id' | 'bomNo'> & { id?: string; bomNo?: string }): BOM {
    const isEdit = !!bomData.id;
    const bomNo = bomData.bomNo || `BOM-${new Date().getFullYear()}-${String(this.boms().length + 1).padStart(3, '0')}`;
    const id = bomData.id || ('BOM-' + Math.random().toString(36).substring(2, 9));

    // Calculate material cost
    const totalMaterialCost = bomData.components.reduce((sum, c) => sum + c.subtotal, 0);
    const estimatedUnitCost = totalMaterialCost + bomData.standardLaborCost + bomData.standardOverheadCost;

    const bom: BOM = {
      ...bomData,
      id,
      bomNo,
      totalMaterialCost,
      estimatedUnitCost
    };

    if (isEdit) {
      this.boms.update(list => list.map(b => b.id === id ? bom : b));
      this.notification.success('BOM Updated', `BOM ${bom.bomNo} updated successfully.`);
    } else {
      this.boms.update(list => [bom, ...list]);
      this.notification.success('BOM Created', `BOM ${bom.bomNo} created with estimated unit cost Rs. ${estimatedUnitCost.toFixed(2)}.`);
    }

    this.saveToStorage();
    return bom;
  }

  duplicateBOM(sourceId: string): BOM | null {
    const source = this.boms().find(b => b.id === sourceId);
    if (!source) return null;

    const newBom: BOM = {
      ...source,
      id: 'BOM-' + Math.random().toString(36).substring(2, 9),
      bomNo: `${source.bomNo}-COPY`,
      version: `${source.version}-rev`,
      effectiveDate: this.currentDate(),
      isActive: true
    };

    this.boms.update(list => [newBom, ...list]);
    this.saveToStorage();
    this.notification.info('BOM Duplicated', `Created copy ${newBom.bomNo}.`);
    return newBom;
  }

  // ==========================================
  // 6. GARMENT PRODUCTION WORKFLOW
  // ==========================================
  createProductionOrder(orderData: Omit<ProductionOrder, 'id' | 'orderNo' | 'materialIssued' | 'completedQty' | 'rejectedQty' | 'actualProductionCostTotal'>): ProductionOrder {
    const orderNo = `PO-${new Date().getFullYear()}-${String(this.productionOrders().length + 1).padStart(4, '0')}`;
    const order: ProductionOrder = {
      ...orderData,
      id: 'PROD-' + Math.random().toString(36).substring(2, 9),
      orderNo,
      materialIssued: false,
      completedQty: 0,
      rejectedQty: 0,
      actualProductionCostTotal: 0
    };

    this.productionOrders.update(orders => [order, ...orders]);
    this.saveToStorage();
    this.notification.success('Production Order Created', `Order ${order.orderNo} for ${order.plannedQty} pcs of ${order.garmentName} created.`);
    return order;
  }

  issueMaterialsForProduction(orderId: string, notes?: string): MaterialIssue | null {
    const order = this.productionOrders().find(o => o.id === orderId);
    if (!order) return null;

    const bom = this.boms().find(b => b.id === order.bomId);
    if (!bom) {
      this.notification.error('Error', 'Associated BOM not found');
      return null;
    }

    // Verify factory warehouse has enough stock for all items
    const issueLines: MaterialIssue['items'] = [];
    const missingItems: string[] = [];

    for (const comp of bom.components) {
      const requiredQty = comp.effectiveQty * order.plannedQty;
      const currentStock = this.getWarehouseStock(order.factoryWarehouseId, comp.itemId);

      if (currentStock < requiredQty) {
        missingItems.push(`${comp.itemName} (Available: ${currentStock} ${comp.unit}, Needed: ${requiredQty} ${comp.unit})`);
      }

      issueLines.push({
        itemId: comp.itemId,
        itemName: comp.itemName,
        requiredQty,
        issuedQty: requiredQty,
        unit: comp.unit,
        unitCost: comp.unitCost,
        totalCost: requiredQty * comp.unitCost
      });
    }

    if (missingItems.length > 0) {
      this.notification.error('Material Shortage', `Cannot issue materials. Shortage in Factory:\n${missingItems.join('\n')}`);
      return null;
    }

    const totalMaterialCost = issueLines.reduce((sum, line) => sum + line.totalCost, 0);
    const issueNo = `MI-${new Date().getFullYear()}-${String(this.materialIssues().length + 1).padStart(4, '0')}`;

    const issue: MaterialIssue = {
      id: 'MI-' + Math.random().toString(36).substring(2, 9),
      issueNo,
      date: this.currentDate(),
      productionOrderId: order.id,
      orderNo: order.orderNo,
      factoryWarehouseId: order.factoryWarehouseId,
      items: issueLines,
      totalMaterialCost,
      notes
    };

    // Deduct stock from Factory Warehouse
    for (const line of issueLines) {
      this.updateWarehouseStock(order.factoryWarehouseId, line.itemId, -line.issuedQty, line.unitCost);
      this.recordStockMovement(
        line.itemId,
        line.itemName,
        order.factoryWarehouseId,
        order.factoryWarehouseName,
        'ISSUE_TO_PRODUCTION',
        -line.issuedQty,
        line.unit,
        line.unitCost,
        issue.issueNo
      );
    }

    // Accounting Entry:
    // Debit: 1250 Work in Progress (WIP)
    // Credit: 1240 Factory Raw Materials & Trims
    this.postJournalEntry(
      'MATERIAL_ISSUE',
      issue.id,
      issue.issueNo,
      `Material Issue for Production Order ${order.orderNo} (${order.plannedQty} ${order.garmentName})`,
      [
        { accountCode: '1250', debit: totalMaterialCost, credit: 0, notes: `WIP Materials Issued` },
        { accountCode: '1240', debit: 0, credit: totalMaterialCost, notes: `Factory Raw Material Inventory relief` }
      ],
      issue.date
    );

    // Update order status
    this.productionOrders.update(orders => {
      return orders.map(o => o.id === order.id ? { ...o, materialIssued: true, status: 'In Production' } : o);
    });

    this.materialIssues.update(mis => [issue, ...mis]);
    this.saveToStorage();
    this.notification.success('Materials Issued', `Materials worth Rs. ${totalMaterialCost.toLocaleString()} issued to sewing lines.`);
    return issue;
  }

  completeProduction(completionData: Omit<ProductionCompletion, 'id' | 'completionNo' | 'totalProductionCost' | 'unitCost'>): ProductionCompletion | null {
    const totalProductionCost = completionData.actualMaterialCost + 
      completionData.directLaborCost + 
      completionData.factoryOverhead + 
      completionData.otherExpenses;

    if (completionData.acceptedQty <= 0) {
      this.notification.error('Validation Error', 'Accepted quantity must be greater than zero.');
      return null;
    }

    const unitCost = Number((totalProductionCost / completionData.acceptedQty).toFixed(2));
    const completionNo = `PC-${new Date().getFullYear()}-${String(this.productionCompletions().length + 1).padStart(4, '0')}`;

    const completion: ProductionCompletion = {
      ...completionData,
      id: 'PC-' + Math.random().toString(36).substring(2, 9),
      completionNo,
      totalProductionCost,
      unitCost
    };

    // 1. Add Accepted Qty to Finished Goods inventory in Factory Warehouse
    this.updateWarehouseStock(completion.targetWarehouseId, completion.garmentItemId, completion.acceptedQty, unitCost);

    // Update product item standard purchase/production price
    this.products.update(items => {
      return items.map(p => {
        if (p.id === completion.garmentItemId) {
          return { ...p, purchasePrice: unitCost };
        }
        return p;
      });
    });

    // 2. Record stock movement
    const wh = this.warehouses().find(w => w.id === completion.targetWarehouseId);
    this.recordStockMovement(
      completion.garmentItemId,
      completion.garmentName,
      completion.targetWarehouseId,
      wh ? wh.name : 'Factory Warehouse',
      'PRODUCTION_RECEIPT',
      completion.acceptedQty,
      'pcs',
      unitCost,
      completion.completionNo
    );

    // 3. Accounting Entry:
    // Total Production Cost = Material Cost (relief from WIP) + Direct Labor + Factory Overhead
    // Debit: 1260 Finished Goods Inventory (Accepted Qty * Unit Cost)
    // Credit: 1250 Work in Progress (WIP) (actualMaterialCost)
    // Credit: 6010 Direct Labor Accrued / Payable (directLaborCost)
    // Credit: 6020 Factory Overhead Accrued (factoryOverhead + otherExpenses)
    const journalLines: { accountCode: string; debit: number; credit: number; notes?: string }[] = [
      {
        accountCode: '1260',
        debit: totalProductionCost,
        credit: 0,
        notes: `Finished goods receipt: ${completion.acceptedQty} pcs ${completion.garmentName} @ Rs. ${unitCost}`
      },
      {
        accountCode: '1250',
        debit: 0,
        credit: completion.actualMaterialCost,
        notes: 'Relief of WIP Materials'
      }
    ];

    if (completion.directLaborCost > 0) {
      journalLines.push({
        accountCode: '6010',
        debit: 0,
        credit: completion.directLaborCost,
        notes: 'Direct Labor applied to production'
      });
    }

    const overheadTotal = completion.factoryOverhead + completion.otherExpenses;
    if (overheadTotal > 0) {
      journalLines.push({
        accountCode: '6020',
        debit: 0,
        credit: overheadTotal,
        notes: 'Factory Overhead & indirect costs applied'
      });
    }

    this.postJournalEntry(
      'PRODUCTION_COMPLETION',
      completion.id,
      completion.completionNo,
      `Production Completion: ${completion.orderNo} (${completion.acceptedQty} accepted, ${completion.rejectedQty} rejected)`,
      journalLines,
      completion.date
    );

    // Update production order status
    this.productionOrders.update(orders => {
      return orders.map(o => {
        if (o.id === completion.productionOrderId) {
          return {
            ...o,
            status: 'Completed',
            completedQty: completion.completedQty,
            rejectedQty: completion.rejectedQty,
            actualProductionCostTotal: totalProductionCost
          };
        }
        return o;
      });
    });

    this.productionCompletions.update(pcs => [completion, ...pcs]);
    this.saveToStorage();
    this.notification.success('Production Completed', `Completed ${completion.acceptedQty} finished garments. Actual unit cost: Rs. ${unitCost}.`);
    return completion;
  }

  // ==========================================
  // 7. READY-MADE GARMENTS SALES
  // ==========================================
  createGarmentSale(saleData: Omit<GarmentSale, 'id' | 'invoiceNo' | 'grossAmount' | 'taxAmount' | 'netAmount' | 'totalCogs' | 'grossProfit'>): GarmentSale | null {
    const available = this.getWarehouseStock('WH-002', saleData.garmentItemId);
    if (available < saleData.quantity) {
      this.notification.error('Insufficient Garment Stock', `Available in Factory Warehouse: ${available} pcs. Requested: ${saleData.quantity} pcs.`);
      return null;
    }

    const grossAmount = (saleData.quantity * saleData.salesRate) - saleData.discount;
    const taxAmount = (grossAmount * (saleData.taxRate || 0)) / 100;
    const netAmount = grossAmount + taxAmount;
    const totalCogs = saleData.quantity * saleData.cogsUnitCost;
    const grossProfit = grossAmount - totalCogs;

    const invoiceNo = `GSI-${new Date().getFullYear()}-${String(this.garmentSales().length + 1).padStart(4, '0')}`;

    const sale: GarmentSale = {
      ...saleData,
      id: 'GS-' + Math.random().toString(36).substring(2, 9),
      invoiceNo,
      grossAmount,
      taxAmount,
      netAmount,
      totalCogs,
      grossProfit
    };

    // Deduct finished goods stock from factory warehouse
    this.updateWarehouseStock('WH-002', sale.garmentItemId, -sale.quantity, sale.cogsUnitCost);

    this.recordStockMovement(
      sale.garmentItemId,
      sale.garmentName,
      'WH-002',
      'Garment Factory Warehouse',
      'SALE_OUT',
      -sale.quantity,
      'pcs',
      sale.cogsUnitCost,
      sale.invoiceNo
    );

    // Update Customer Receivable
    if (sale.paymentType === 'CREDIT') {
      this.customers.update(custs => custs.map(c => c.id === sale.customerId ? { ...c, balance: c.balance + netAmount } : c));
    }

    // Accounting Entry:
    // Debit: 1100 Accounts Receivable / 1010 Cash
    // Credit: 4020 Garment Sales Revenue
    // Credit: 2100 Sales Tax Payable
    // Debit: 5020 Cost of Goods Sold - Garments
    // Credit: 1260 Finished Goods Inventory
    const receivableAccount = sale.paymentType === 'CREDIT' ? '1100' : (sale.paymentAccountCode || '1010');

    const journalLines: { accountCode: string; debit: number; credit: number; notes?: string }[] = [
      { accountCode: receivableAccount, debit: netAmount, credit: 0, notes: `Receivable from ${sale.customerName}` },
      { accountCode: '4020', debit: 0, credit: grossAmount, notes: `Garment sales revenue (${sale.quantity} pcs @ Rs. ${sale.salesRate})` }
    ];
    if (taxAmount > 0) {
      journalLines.push({ accountCode: '2100', debit: 0, credit: taxAmount, notes: 'Output Sales Tax' });
    }
    journalLines.push(
      { accountCode: '5020', debit: totalCogs, credit: 0, notes: `COGS for ${sale.garmentName} (${sale.quantity} pcs @ Rs. ${sale.cogsUnitCost})` },
      { accountCode: '1260', debit: 0, credit: totalCogs, notes: 'Relief of Finished Goods Stock' }
    );

    this.postJournalEntry(
      'GARMENT_SALE',
      sale.id,
      sale.invoiceNo,
      `Garment Sale: ${sale.quantity} pcs ${sale.garmentName} to ${sale.customerName}`,
      journalLines,
      sale.date
    );

    this.garmentSales.update(gs => [sale, ...gs]);
    this.saveToStorage();
    this.notification.success('Garment Sale Posted', `Invoice ${sale.invoiceNo} posted. Gross Profit: Rs. ${grossProfit.toLocaleString()}.`);
    return sale;
  }

  // ==========================================
  // 8. OTHER TRADING ITEMS SALES
  // ==========================================
  createOtherItemSale(saleData: Omit<OtherItemSale, 'id' | 'invoiceNo' | 'subtotal' | 'discountTotal' | 'taxTotal' | 'netAmount' | 'totalCogs' | 'grossProfit'>): OtherItemSale | null {
    // Validate stock for all lines
    for (const line of saleData.items) {
      const stock = this.getWarehouseStock('WH-001', line.itemId);
      if (stock < line.quantity) {
        this.notification.error('Out of Stock', `Only ${stock} ${line.unit} of ${line.itemName} available in Central Warehouse.`);
        return null;
      }
    }

    const subtotal = saleData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountTotal = saleData.items.reduce((sum, item) => sum + item.discount, 0);
    const taxTotal = saleData.items.reduce((sum, item) => sum + (((item.quantity * item.rate) - item.discount) * (item.taxRate / 100)), 0);
    const netAmount = (subtotal - discountTotal) + taxTotal;
    const totalCogs = saleData.items.reduce((sum, item) => sum + (item.quantity * item.cogsUnitCost), 0);
    const grossProfit = (subtotal - discountTotal) - totalCogs;

    const invoiceNo = `TSI-${new Date().getFullYear()}-${String(this.otherItemSales().length + 1).padStart(4, '0')}`;

    const sale: OtherItemSale = {
      ...saleData,
      id: 'OTS-' + Math.random().toString(36).substring(2, 9),
      invoiceNo,
      subtotal,
      discountTotal,
      taxTotal,
      netAmount,
      totalCogs,
      grossProfit
    };

    // Deduct stock for each line
    for (const item of sale.items) {
      this.updateWarehouseStock('WH-001', item.itemId, -item.quantity, item.cogsUnitCost);
      this.recordStockMovement(
        item.itemId,
        item.itemName,
        'WH-001',
        'Central Raw & Fabric Warehouse',
        'SALE_OUT',
        -item.quantity,
        item.unit,
        item.cogsUnitCost,
        sale.invoiceNo
      );
    }

    if (sale.paymentType === 'CREDIT') {
      this.customers.update(custs => custs.map(c => c.id === sale.customerId ? { ...c, balance: c.balance + netAmount } : c));
    }

    // Accounting Entry
    const receivableAccount = sale.paymentType === 'CREDIT' ? '1100' : '1010';
    const journalLines: { accountCode: string; debit: number; credit: number; notes?: string }[] = [
      { accountCode: receivableAccount, debit: netAmount, credit: 0, notes: `Receivable from ${sale.customerName}` },
      { accountCode: '4030', debit: 0, credit: (subtotal - discountTotal), notes: 'Other trading items revenue' }
    ];
    if (taxTotal > 0) {
      journalLines.push({ accountCode: '2100', debit: 0, credit: taxTotal, notes: 'Output sales tax' });
    }
    journalLines.push(
      { accountCode: '5030', debit: totalCogs, credit: 0, notes: 'COGS for trading items' },
      { accountCode: '1270', debit: 0, credit: totalCogs, notes: 'Relief of Trading Goods stock' }
    );

    this.postJournalEntry(
      'OTHER_SALE',
      sale.id,
      sale.invoiceNo,
      `Trading Sale: ${sale.items.length} items to ${sale.customerName}`,
      journalLines,
      sale.date
    );

    this.otherItemSales.update(ots => [sale, ...ots]);
    this.saveToStorage();
    this.notification.success('Trading Sale Posted', `Invoice ${sale.invoiceNo} posted. Net: Rs. ${netAmount.toLocaleString()}`);
    return sale;
  }

  // ==========================================
  // STEP-BY-STEP DEMO SCENARIO RUNNER
  // ==========================================
  runDemoStep(stepNum: number) {
    switch (stepNum) {
      case 1: {
        // Step 1: Purchase 1,000 meters of raw fabric
        this.createFabricPurchase({
          date: this.currentDate(),
          supplierId: 'SUP-001',
          supplierName: 'Al-Karam Cotton Mills',
          fabricItemId: 'ITM-001',
          fabricItemName: '100% Greige Cotton Sheeting',
          fabricType: 'Greige Sheeting 60x60',
          color: 'Natural Greige',
          design: 'Plain Weave',
          lotNo: 'LOT-C26-1001',
          quantity: 1000,
          unit: 'meters',
          rate: 380,
          discount: 0,
          additionalCharges: 0,
          taxRate: 0,
          paidAmount: 0,
          paymentStatus: 'UNPAID',
          warehouseId: 'WH-001',
          notes: 'Demo Step 1: Bulk raw cotton purchase for seasonal dress shirt program'
        });
        this.markStepDone(1);
        break;
      }
      case 2: {
        // Step 2: Send 1,000 meters to Sitara Dyeing Mill
        const challan = this.createProcessingChallan({
          date: this.currentDate(),
          millId: 'MIL-001',
          millName: 'Sitara Dyeing & Finishing Mills',
          fabricItemId: 'ITM-001',
          fabricItemName: '100% Greige Cotton Sheeting',
          lotNo: 'LOT-C26-1001',
          quantityDispatched: 1000,
          unit: 'meters',
          processingType: 'Dyeing',
          expectedReturnDate: this.currentDate(),
          processingRate: 85,
          estimatedCharges: 85000,
          transportCharges: 5000,
          sourceWarehouseId: 'WH-001',
          notes: 'Demo Step 2: Reactive Navy Blue dyeing & soft sanforized finish'
        });
        if (challan) this.markStepDone(2);
        break;
      }
      case 3: {
        // Step 3: Receive 980 meters processed fabric (20m shortage tracked)
        const challan = this.processingChallans().find(c => c.lotNo === 'LOT-C26-1001' && c.status === 'Dispatched');
        if (!challan) {
          this.notification.error('Prerequisite Missing', 'Please run Step 2 first (Dispatch fabric to mill).');
          return;
        }

        const receipt = this.receiveProcessedFabric({
          date: this.currentDate(),
          challanId: challan.id,
          challanNo: challan.challanNo,
          millId: challan.millId,
          millName: challan.millName,
          sourceItemId: challan.fabricItemId,
          sourceItemName: challan.fabricItemName,
          processedItemId: 'ITM-003',
          processedItemName: 'Dyed Navy Blue Cotton Poplin',
          lotNo: challan.lotNo,
          quantitySent: 1000,
          quantityReceived: 980,
          wastageShortage: 20, // 20 meters shortage
          processingCharges: 83300, // 980m * 85
          transportCharges: 5000,
          qualityGrade: 'Grade A',
          receivingWarehouseId: 'WH-001',
          notes: 'Demo Step 3: 20m shrinkage & cutting test loss recorded. Processing charges capitalized into valuation.'
        });
        if (receipt) this.markStepDone(3);
        break;
      }
      case 4: {
        // Step 4: Sell 300 meters processed fabric directly to Gul Ahmed
        const processedItem = this.products().find(p => p.id === 'ITM-003');
        const unitCost = processedItem ? processedItem.purchasePrice : 477.86;

        const sale = this.createFabricSale({
          date: this.currentDate(),
          customerId: 'CUS-001',
          customerName: 'Gul Ahmed Apparel Stores',
          fabricItemId: 'ITM-003',
          fabricItemName: 'Dyed Navy Blue Cotton Poplin',
          lotNo: 'LOT-C26-1001',
          quantity: 300,
          unit: 'meters',
          salesRate: 750,
          discount: 0,
          taxRate: 5,
          cogsUnitCost: unitCost,
          paymentType: 'CREDIT',
          notes: 'Demo Step 4: Route A direct fabric wholesale sale on credit'
        });
        if (sale) this.markStepDone(4);
        break;
      }
      case 5: {
        // Step 5: Transfer 500 meters to Garment Factory
        const processedItem = this.products().find(p => p.id === 'ITM-003');
        const unitCost = processedItem ? processedItem.purchasePrice : 477.86;

        const transfer = this.createStockTransfer({
          date: this.currentDate(),
          sourceWarehouseId: 'WH-001',
          sourceWarehouseName: 'Central Raw & Fabric Warehouse',
          destinationWarehouseId: 'WH-002',
          destinationWarehouseName: 'Garment Factory Warehouse',
          itemId: 'ITM-003',
          itemName: 'Dyed Navy Blue Cotton Poplin',
          lotNo: 'LOT-C26-1001',
          quantity: 500,
          unit: 'meters',
          unitCost,
          notes: 'Demo Step 5: Route B internal transfer for men shirts production'
        });
        if (transfer) this.markStepDone(5);
        break;
      }
      case 6: {
        // Step 6: Create garment production order for 200 shirts
        const order = this.createProductionOrder({
          date: this.currentDate(),
          garmentItemId: 'ITM-010',
          garmentName: "Men's Formal Cotton Shirt",
          styleName: 'Exec Slim Fit Navy',
          size: 'Medium (40)',
          color: 'Navy Blue',
          bomId: 'BOM-001',
          bomNo: 'BOM-SHR-M-01',
          plannedQty: 200,
          factoryWarehouseId: 'WH-002',
          factoryWarehouseName: 'Garment Factory Warehouse',
          plannedCompletionDate: this.currentDate(),
          status: 'Planned',
          notes: 'Demo Step 6: Batch of 200 Slim Fit formal shirts'
        });
        if (order) this.markStepDone(6);
        break;
      }
      case 7: {
        // Step 7: Issue materials from factory stock
        const order = this.productionOrders().find(o => o.plannedQty === 200 && !o.materialIssued);
        if (!order) {
          this.notification.error('Prerequisite Missing', 'Please run Step 6 first to create the production order.');
          return;
        }
        const issue = this.issueMaterialsForProduction(order.id, 'Demo Step 7: Issued fabric, buttons, thread, labels, and packaging for 200 shirts');
        if (issue) this.markStepDone(7);
        break;
      }
      case 8: {
        // Step 8: Complete production of 200 shirts (195 accepted, 5 rejected)
        const order = this.productionOrders().find(o => o.plannedQty === 200 && o.materialIssued && o.status !== 'Completed');
        if (!order) {
          this.notification.error('Prerequisite Missing', 'Please run Step 7 first to issue materials.');
          return;
        }

        const issue = this.materialIssues().find(m => m.productionOrderId === order.id);
        const actualMaterialCost = issue ? issue.totalMaterialCost : 165444;

        const completion = this.completeProduction({
          date: this.currentDate(),
          productionOrderId: order.id,
          orderNo: order.orderNo,
          garmentItemId: order.garmentItemId,
          garmentName: order.garmentName,
          styleName: order.styleName,
          size: order.size,
          color: order.color,
          targetWarehouseId: 'WH-002',
          completedQty: 200,
          acceptedQty: 195,
          rejectedQty: 5,
          actualMaterialCost,
          directLaborCost: 44000, // 200 * 220
          factoryOverhead: 26000, // 200 * 130
          otherExpenses: 2500,
          notes: 'Demo Step 8: 195 pieces A-grade passed QC. 5 pieces rejected due to stitching tension flaws.'
        });
        if (completion) this.markStepDone(8);
        break;
      }
      case 9: {
        // Step 9: Verify Finished Goods Inventory
        this.markStepDone(9);
        this.notification.info('Stock In Ready', '195 pieces of Men Formal Shirts are now in Finished Goods stock ready for shipping!');
        break;
      }
      case 10: {
        // Step 10: Sell 150 shirts to Khaadi Retail
        const shirtItem = this.products().find(p => p.id === 'ITM-010');
        const unitCost = shirtItem ? shirtItem.purchasePrice : 1220.23;

        const sale = this.createGarmentSale({
          date: this.currentDate(),
          customerId: 'CUS-002',
          customerName: 'Khaadi Retail Network',
          garmentItemId: 'ITM-010',
          garmentName: "Men's Formal Cotton Shirt",
          styleName: 'Exec Slim Fit Navy',
          size: 'Medium (40)',
          color: 'Navy Blue',
          quantity: 150,
          unit: 'pcs',
          salesRate: 2450,
          discount: 5000,
          taxRate: 5,
          cogsUnitCost: unitCost,
          paymentType: 'CREDIT',
          notes: 'Demo Step 10: Shipment of 150 ready-made shirts to Khaadi flagship store'
        });
        if (sale) this.markStepDone(10);
        break;
      }
      case 11: {
        // Step 11: Mark complete
        this.markStepDone(11);
        this.notification.success('Scenario Complete', 'All 11 demonstration steps have been executed! Check Reports & Accounting for live balanced figures.');
        break;
      }
    }
  }

  markStepDone(stepNum: number) {
    this.demoSteps.update(steps => {
      return steps.map(s => s.step === stepNum ? { ...s, completed: true } : s);
    });
    this.saveToStorage();
  }

  resetAllData() {
    try {
      localStorage.clear();
    } catch {}
    this.seedInitialData();
    this.demoSteps.update(steps => steps.map(s => ({ ...s, completed: false })));
    this.notification.info('Data Reset', 'All ERP records have been reset to default clean demonstration state.');
  }

  // Execute full automated 10-step demo in one click
  runEntireScenario() {
    this.resetAllData();
    for (let i = 1; i <= 10; i++) {
      this.runDemoStep(i);
    }
    this.markStepDone(11);
    this.notification.success('Full Demo Executed', 'End-to-end workflow (Purchase -> Mill -> Dyeing -> Route A Sale -> Route B Transfer -> BOM -> Production -> Garment Sale) executed successfully!');
  }
}
