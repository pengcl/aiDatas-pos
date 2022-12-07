import {Component, OnInit, OnDestroy, Input} from '@angular/core';

@Component({
  selector: 'app-sub-checkout-check',
  templateUrl: './check.page.html',
  styleUrls: ['./check.page.scss'],
  providers: []
})
export class SubCheckoutCheckPage implements OnInit, OnDestroy {
  @Input() shopCardDetail;
  @Input() payDetails;

  constructor() {
  }


  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
