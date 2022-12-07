import {Component, EventEmitter, Output, OnInit, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-catering-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [DatePipe]
})
export class CateringSearchComponent implements OnInit {
  @Input() type;
  @Input() params;
  @Output() paramsChange: EventEmitter<any> = new EventEmitter();
  @Output() typeChange: EventEmitter<any> = new EventEmitter();
  @Output() formChange: EventEmitter<any> = new EventEmitter();
  @Output() search: EventEmitter<any> = new EventEmitter();
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  queryDate;
  form: FormGroup = new FormGroup({
    queryDate: new FormControl('', []),
    queryType: new FormControl('', []),
    takeNum: new FormControl('', []),
    takeStatus: new FormControl('', []),
    takeType: new FormControl('', [])
  });
  dateFormat = 'yyyy-MM-dd';

  constructor(private datePipe: DatePipe) {
    this.form.valueChanges.subscribe(res => {
      this.params = res;
      this.paramsChange.next(this.params);
    });
  }

  ngOnInit() {
    this.form.get('queryType').setValue(this.type);
    if (this.type === '1') {
      this.form.get('queryDate').disable();
    } else {
      this.form.get('queryDate').enable();
    }
  }

  dateChange(e) {
    this.form.get('queryDate').setValue(this.datePipe.transform(e, 'yyyy-MM-dd'));
  }

  query() {
    this.search.next(this.form.value);
  }

  reload() {
    this.search.next(this.form.value);
  }

  setType(type) {
    this.type = type;
    this.form.get('queryType').setValue(this.type);
    if (this.type === '1') {
      this.form.get('takeStatus').setValue('');
      this.form.get('takeType').setValue('');
      this.form.get('queryDate').disable();
    } else {
      this.form.get('queryDate').enable();
    }
    this.typeChange.next(this.type);
  }

  clear() {
    this.form.get('takeNum').setValue('');
  }
}
