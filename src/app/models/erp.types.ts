export type ItemCategory = 
  | 'RAW_FABRIC'
  | 'PROCESSED_FABRIC'
  | 'RAW_MATERIAL'
  | 'TRIMS_ACCESSORIES'
  | 'FINISHED_GARMENT'
  | 'OTHER_TRADING';

export type UnitOfMeasurement = 'meters' | 'yards' | 'kg' | 'pcs' | 'dozen' | 'rolls' | 'cones';

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: ItemCategory;
  unit: UnitOfMeasurement;
  purchasePrice: number;
  salesPrice: number;
  currentStock: number;
  minStockLevel: number;
  // Specifications
  composition?: string;
  color?: string;
  width?: string;
  gsm?: number;
  size?: string;
  design?: string;
  description?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balance: number; // Positive = payable to supplier
  taxId?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balance: number; // Positive = receivable from customer
  creditLimit: number;
  taxId?: string;
}

export interface ProcessingMill {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  servicesOffered: string[];
  defaultRatePerMeter: number;
  balance: number; // Processing charges payable
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'CENTRAL' | 'FACTORY' | 'PROCESSING_MILL';
  address: string;
  isFactory: boolean;
}

export interface GarmentSize {
  id: string;
  code: string;
  name: string;
}

export interface GarmentColor {
  id: string;
  code: string;
  name: string;
  hex: string;
}

export interface Account {
  code: string;
  name: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
  description?: string;
}

export interface FabricPurchase {
  id: string;
  purchaseNo: string;
  date: string; // DD-MM-YYYY
  supplierId: string;
  supplierName: string;
  fabricItemId: string;
  fabricItemName: string;
  fabricType: string;
  color: string;
  design: string;
  lotNo: string;
  quantity: number;
  unit: UnitOfMeasurement;
  rate: number;
  discount: number;
  additionalCharges: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL';
  paidAmount: number;
  paymentAccountCode?: string; // e.g. 1010 Cash or 1020 Bank
  warehouseId: string;
  notes?: string;
  isPosted: boolean;
}

export interface ProcessingChallan {
  id: string;
  challanNo: string;
  date: string; // DD-MM-YYYY
  millId: string;
  millName: string;
  fabricItemId: string;
  fabricItemName: string;
  lotNo: string;
  quantityDispatched: number;
  unit: UnitOfMeasurement;
  processingType: 'Dyeing' | 'Printing' | 'Washing' | 'Finishing' | 'Combined';
  expectedReturnDate: string;
  processingRate: number;
  estimatedCharges: number;
  transportCharges: number;
  notes?: string;
  sourceWarehouseId: string;
  status: 'Draft' | 'Dispatched' | 'Partially Received' | 'Completed' | 'Cancelled';
  quantityReceivedTotal: number;
  quantityShortageTotal: number;
}

export interface ProcessingReceipt {
  id: string;
  receiptNo: string;
  date: string; // DD-MM-YYYY
  challanId: string;
  challanNo: string;
  millId: string;
  millName: string;
  sourceItemId: string;
  sourceItemName: string;
  processedItemId: string;
  processedItemName: string;
  lotNo: string;
  quantitySent: number;
  quantityReceived: number;
  wastageShortage: number; // quantitySent - quantityReceived
  processingCharges: number;
  transportCharges: number;
  totalProcessingCost: number;
  rawFabricUnitCost: number;
  // Capitalized Unit Cost = (Raw Fabric Cost of sent + Processing Costs) / Received Qty
  finalValuationUnitCost: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Seconds';
  receivingWarehouseId: string;
  notes?: string;
}

export interface FabricSale {
  id: string;
  invoiceNo: string;
  date: string; // DD-MM-YYYY
  customerId: string;
  customerName: string;
  fabricItemId: string;
  fabricItemName: string;
  lotNo: string;
  quantity: number;
  unit: UnitOfMeasurement;
  salesRate: number;
  grossAmount: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  cogsUnitCost: number;
  totalCogs: number;
  grossProfit: number;
  paymentType: 'CREDIT' | 'CASH' | 'BANK';
  paymentAccountCode?: string;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  date: string; // DD-MM-YYYY
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  itemId: string;
  itemName: string;
  lotNo: string;
  quantity: number;
  unit: UnitOfMeasurement;
  unitCost: number;
  totalValue: number;
  notes?: string;
}

export interface BOMComponent {
  itemId: string;
  itemName: string;
  category: ItemCategory;
  requiredQty: number;
  unit: UnitOfMeasurement;
  wastagePercent: number; // e.g. 5%
  effectiveQty: number; // requiredQty * (1 + wastagePercent / 100)
  unitCost: number;
  subtotal: number;
}

export interface BOM {
  id: string;
  bomNo: string;
  garmentItemId: string;
  garmentName: string;
  styleName: string;
  size: string;
  color: string;
  version: string;
  components: BOMComponent[];
  totalMaterialCost: number;
  standardLaborCost: number;
  standardOverheadCost: number;
  estimatedUnitCost: number;
  effectiveDate: string;
  isActive: boolean;
  notes?: string;
}

export interface ProductionOrder {
  id: string;
  orderNo: string;
  date: string; // DD-MM-YYYY
  garmentItemId: string;
  garmentName: string;
  styleName: string;
  size: string;
  color: string;
  bomId: string;
  bomNo: string;
  plannedQty: number;
  factoryWarehouseId: string;
  factoryWarehouseName: string;
  plannedCompletionDate: string;
  status: 'Draft' | 'Planned' | 'Released' | 'In Production' | 'Completed' | 'Cancelled';
  materialIssued: boolean;
  completedQty: number;
  rejectedQty: number;
  actualProductionCostTotal: number;
  notes?: string;
}

export interface MaterialIssueLine {
  itemId: string;
  itemName: string;
  requiredQty: number;
  issuedQty: number;
  unit: UnitOfMeasurement;
  unitCost: number;
  totalCost: number;
}

export interface MaterialIssue {
  id: string;
  issueNo: string;
  date: string; // DD-MM-YYYY
  productionOrderId: string;
  orderNo: string;
  factoryWarehouseId: string;
  items: MaterialIssueLine[];
  totalMaterialCost: number;
  notes?: string;
}

export interface ProductionCompletion {
  id: string;
  completionNo: string;
  date: string; // DD-MM-YYYY
  productionOrderId: string;
  orderNo: string;
  garmentItemId: string;
  garmentName: string;
  styleName: string;
  size: string;
  color: string;
  targetWarehouseId: string;
  completedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  actualMaterialCost: number;
  directLaborCost: number;
  factoryOverhead: number;
  otherExpenses: number;
  totalProductionCost: number;
  unitCost: number; // Total / Accepted
  notes?: string;
}

export interface GarmentSale {
  id: string;
  invoiceNo: string;
  date: string; // DD-MM-YYYY
  customerId: string;
  customerName: string;
  garmentItemId: string;
  garmentName: string;
  styleName: string;
  size: string;
  color: string;
  quantity: number;
  unit: UnitOfMeasurement;
  salesRate: number;
  grossAmount: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  cogsUnitCost: number;
  totalCogs: number;
  grossProfit: number;
  paymentType: 'CREDIT' | 'CASH' | 'BANK';
  paymentAccountCode?: string;
  notes?: string;
}

export interface OtherSaleLine {
  itemId: string;
  itemName: string;
  category: ItemCategory;
  quantity: number;
  unit: UnitOfMeasurement;
  rate: number;
  discount: number;
  taxRate: number;
  total: number;
  cogsUnitCost: number;
}

export interface OtherItemSale {
  id: string;
  invoiceNo: string;
  date: string; // DD-MM-YYYY
  customerId: string;
  customerName: string;
  items: OtherSaleLine[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  netAmount: number;
  totalCogs: number;
  grossProfit: number;
  paymentType: 'CREDIT' | 'CASH' | 'BANK';
  isReturn?: boolean;
  notes?: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  entryNo: string;
  date: string; // DD-MM-YYYY
  referenceType: 
    | 'PURCHASE'
    | 'MILL_DISPATCH'
    | 'MILL_RECEIPT'
    | 'FABRIC_SALE'
    | 'STOCK_TRANSFER'
    | 'MATERIAL_ISSUE'
    | 'PRODUCTION_COMPLETION'
    | 'GARMENT_SALE'
    | 'OTHER_SALE'
    | 'PAYMENT'
    | 'RECEIPT'
    | 'MANUAL';
  referenceId: string;
  referenceNo: string;
  description: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  lotNo?: string;
  warehouseId: string;
  warehouseName: string;
  movementType: 
    | 'PURCHASE_IN'
    | 'DISPATCH_TO_MILL'
    | 'RECEIPT_FROM_MILL'
    | 'SHORTAGE_MILL'
    | 'TRANSFER_OUT'
    | 'TRANSFER_IN'
    | 'ISSUE_TO_PRODUCTION'
    | 'PRODUCTION_RECEIPT'
    | 'SALE_OUT'
    | 'SALE_RETURN'
    | 'ADJUSTMENT';
  quantity: number; // positive = increase, negative = decrease
  unit: UnitOfMeasurement;
  unitCost: number;
  totalValue: number;
  referenceNo: string;
  balanceAfter: number;
}

export interface WarehouseStockItem {
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemName: string;
  category: ItemCategory;
  lotNo?: string;
  quantity: number;
  unit: UnitOfMeasurement;
  unitCost: number;
  totalValue: number;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  actionLabel: string;
  completed: boolean;
  module: string;
}
