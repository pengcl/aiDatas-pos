import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'selected',
  pure: false
})

@Injectable()
export class SelectedPipe implements PipeTransform {
  transform(item, key): any {
    if (!item) {
      return '';
    }
    const selected: any = {};
    if (item.selected) {
      selected.name = item.resourceName;
      selected.price = item.resourcePrice;
    } else {
      item.containRepListDTOList.forEach(i => {
        if (i.selected) {
          selected.name = i.resourceName;
          selected.price = i.addPriceType ? item.resourcePrice - i.addPriceValue : item.resourcePrice + i.addPriceValue;
        }
      });
    }
    return selected[key];
  }
}
