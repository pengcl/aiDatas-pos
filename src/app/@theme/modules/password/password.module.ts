import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaskModule} from '../mask';
import {IonicModule} from '@ionic/angular';
import {PasswordComponent} from './password.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, MaskModule],
  declarations: [PasswordComponent],
  exports: [PasswordComponent],
  entryComponents: [PasswordComponent]
})
export class PasswordModule {
}
