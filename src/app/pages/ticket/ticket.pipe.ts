import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timeHeight',
  pure: false
})

@Injectable()
export class TimeHeightPipe implements PipeTransform {
  transform(count, len): any {
    return Math.ceil(count / len);
  }
}
