import {Component, OnInit, OnDestroy, Input} from '@angular/core';

@Component({
  selector: 'app-sub-checkout-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
  providers: []
})
export class SubCheckoutActivitiesPage implements OnInit, OnDestroy {
  @Input() activities;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
