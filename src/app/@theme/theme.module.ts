import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {IonicModule} from '@ionic/angular';
import {COMPONENTS, ENTRY_COMPONENTS, PIPES, DIRECTIVES} from './index';
import {ToastModule} from './modules/toast';
import {MaskModule} from './modules/mask';
import {DialogModule} from './modules/dialog';
import {StepperModule} from './modules/stepper';
import {ScrollbarThemeModule} from './modules/scrollbar/scrollbar.module';
import {PaginationModule} from './modules/pagination';
import {PasswordModule} from './modules/password';
import {MenuModule} from './modules/menu/menu.module';

import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {TreeTableModule} from './modules/tree-table/tree-table.module';
import {MemberModule} from './modules/member/member.module';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatBadgeModule} from '@angular/material/badge';
import {OverlayModule} from '@angular/cdk/overlay';

import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzConfig, NZ_CONFIG} from 'ng-zorro-antd/core';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzTabsModule} from 'ng-zorro-antd';
import {NzCheckboxModule} from 'ng-zorro-antd';
import {MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

const ngZorroConfig: NzConfig = {
  message: {nzTop: 350, nzDuration: 3000},
  notification: {nzTop: 350}
};

const MATERIAL_PART = [
  MatSidenavModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatRadioModule,
  MatGridListModule,
  MatTableModule,
  MatIconModule,
  TreeTableModule,
  MatButtonModule,
  MatSelectModule,
  MatPaginatorModule,
  MatCardModule,
  MatTabsModule,
  MatBadgeModule,
  OverlayModule
];

const NZ_PART = [
  NzFormModule,
  NzInputModule,
  NzSelectModule,
  NzButtonModule,
  NzDatePickerModule,
  NzTableModule,
  NzRadioModule,
  NzIconModule,
  NzAlertModule,
  NzPaginationModule,
  NzToolTipModule,
  NzInputNumberModule,
  NzModalModule,
  NzTabsModule,
  NzCheckboxModule
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MATERIAL_PART,
    NZ_PART,
    IonicModule,
    ToastModule,
    DialogModule,
    MaskModule,
    StepperModule,
    ScrollbarThemeModule,
    MemberModule,
    PaginationModule,
    PasswordModule,
    MenuModule
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    DialogModule,
    MaskModule,
    StepperModule,
    ScrollbarThemeModule,
    MATERIAL_PART,
    NZ_PART,
    ...COMPONENTS,
    ...ENTRY_COMPONENTS,
    ...PIPES,
    ...DIRECTIVES,
    MemberModule,
    PaginationModule,
    PasswordModule,
    MenuModule
  ],
  declarations: [...COMPONENTS, ...ENTRY_COMPONENTS, ...PIPES, ...DIRECTIVES],
  entryComponents: [ENTRY_COMPONENTS],
  providers: [CurrencyPipe, DatePipe, {provide: NZ_CONFIG, useValue: ngZorroConfig}]
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders<ThemeModule> {
    return {
      ngModule: ThemeModule,
      providers: [
        ...PIPES,
        {provide: MAT_DATE_LOCALE, useValue: 'zh-CN'}
      ]
    } as ModuleWithProviders<ThemeModule>;
  }
}
