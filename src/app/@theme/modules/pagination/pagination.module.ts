import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {PaginationComponent} from './pagination.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [PaginationComponent],
  exports: [PaginationComponent],
  entryComponents: [PaginationComponent],
})
export class PaginationModule {
}
