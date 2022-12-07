import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TreeTableComponent} from './component/tree-table.component';
import {FormsModule} from '@angular/forms';

export {Node, Options} from './models';

@NgModule({
  declarations: [
    TreeTableComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  exports: [
    TreeTableComponent
  ],
  providers: []
})
export class TreeTableModule {
}
