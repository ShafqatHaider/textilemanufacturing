import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/layout/sidebar';
import { HeaderComponent } from './components/layout/header';
import { ToastComponent } from './components/layout/toast';
import { DemoBannerComponent } from './components/common/demo-banner';

import { DashboardComponent } from './components/dashboard/dashboard';
import { MastersComponent } from './components/masters/masters';
import { FabricPurchaseComponent } from './components/fabric-purchase/fabric-purchase';
import { ProcessingMillComponent } from './components/processing-mill/processing-mill';
import { FabricInventoryComponent } from './components/fabric-inventory/fabric-inventory';
import { FabricSalesComponent } from './components/fabric-sales/fabric-sales';
import { StockTransferComponent } from './components/stock-transfer/stock-transfer';
import { GarmentBomComponent } from './components/garment-bom/garment-bom';
import { GarmentProductionComponent } from './components/garment-production/garment-production';
import { FinishedGoodsComponent } from './components/finished-goods/finished-goods';
import { RawMaterialsComponent } from './components/raw-materials/raw-materials';
import { OtherSalesComponent } from './components/other-sales/other-sales';
import { AccountingComponent } from './components/accounting/accounting';
import { ReportsComponent } from './components/reports/reports';
import { SettingsComponent } from './components/settings/settings';
import { ErpStorageService } from './services/erp-storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    ToastComponent,
    DemoBannerComponent,
    DashboardComponent,
    MastersComponent,
    FabricPurchaseComponent,
    ProcessingMillComponent,
    FabricInventoryComponent,
    FabricSalesComponent,
    StockTransferComponent,
    GarmentBomComponent,
    GarmentProductionComponent,
    FinishedGoodsComponent,
    RawMaterialsComponent,
    OtherSalesComponent,
    AccountingComponent,
    ReportsComponent,
    SettingsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  erp = inject(ErpStorageService);

  activeModule = signal<string>('dashboard');
  sidebarCollapsed = signal<boolean>(false);

  setModule(mod: string) {
    this.activeModule.set(mod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(c => !c);
  }
}
