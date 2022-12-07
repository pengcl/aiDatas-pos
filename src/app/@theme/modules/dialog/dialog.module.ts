import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MaskModule} from '../mask';

import {DialogComponent} from './dialog.component';

@NgModule({
  imports: [CommonModule, FormsModule, MaskModule],
  declarations: [DialogComponent],
  exports: [DialogComponent],
  entryComponents: [DialogComponent]
})
export class DialogModule {
}
