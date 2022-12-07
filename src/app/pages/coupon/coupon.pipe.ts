import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'amount',
  pure: false
})

@Injectable()
export class AmountPipe implements PipeTransform {

  transform(items): any {
    let amount = 0;
    if (items) {
      items.forEach(item => {
        amount = amount + Number(item.ticketPrice);
      });
    }
    return amount;
  }
}

@Pipe({
  name: 'couponDescription',
  pure: false
})

@Injectable()
export class CouponDescriptionPipe implements PipeTransform {

  transform(value): any {
    let items = [];
    if (value) {
      value = value.split('+');
    }
    items = value;
    return items;
  }
}
