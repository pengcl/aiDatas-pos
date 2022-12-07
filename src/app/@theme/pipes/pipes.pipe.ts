import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';

function GetDateStr(AddDayCount) {
  const dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount); // 获取AddDayCount天后的日期
  const y = dd.getFullYear();
  const m = dd.getMonth() + 1; // 获取当前月份的日期
  const d = dd.getDate();
  return y + '-' + m + '-' + d;
}

@Pipe({
  name: 'rmb',
  pure: false
})

@Injectable()
export class RmbPipe implements PipeTransform {
  constructor(private currency: CurrencyPipe) {
  }

  transform(value): any {
    value = value ? value : 0;
    return this.currency.transform(value, 'CNY', 'symbol-narrow');
  }
}

@Pipe({
  name: 'repairDate',
  pure: false
})

@Injectable()
export class RepairDatePipe implements PipeTransform {
  transform(value): any {
    if (!value) {
      return value;
    }
    value = value.split('.')[0].replace(/\-/g, '/');
    return value;
  }
}

@Pipe({
  name: 'cinemaStatus',
  pure: false
})

@Injectable()
export class CinemaStatusPipe implements PipeTransform {
  transform(value): any {
    let label = '';
    if (!value) {
      label = '新建';
    }
    switch (value) {
      case 1:
        label = '测试';
        break;
      case 2:
        label = '营业';
        break;
    }
    return label;
  }
}

@Pipe({
  name: 'week',
  pure: false
})
@Injectable()
export class WeekPipe implements PipeTransform {
  transform(value): any {
    if (null === value || '' === value) {
      return '';
    }
    const date = new Date(value);
    const day = date.getDay();
    const weeks = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
    const week = weeks[day];
    return week;
  }
}

@Pipe({
  name: 'day',
  pure: false
})
@Injectable()
export class DayPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {
  }

  transform(value, noDetail?): any {
    const date = new Date(value);
    const year = date.getFullYear().toString();
    const month = date.getMonth() > 8 ? (date.getMonth() + 1).toString() : 0 + (date.getMonth() + 1).toString();
    const day = date.getDate() > 9 ? date.getDate().toString() : 0 + date.getDate().toString();
    const hour = date.getHours() > 9 ? date.getHours().toString() : 0 + date.getHours().toString();
    const minute = date.getMinutes() > 9 ? date.getMinutes().toString() : 0 + date.getMinutes().toString();
    const createTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;


    const date3 = GetDateStr(-1); // 昨天
    const str3 = date3.split('-');
    str3[1] = str3[1].length === 1 ? '0' + str3[1] : str3[1];
    str3[2] = str3[2].length === 1 ? '0' + str3[2] : str3[2];

    const date0 = GetDateStr(0); // 今天
    const str0 = date0.split('-');
    str0[1] = str0[1].length === 1 ? '0' + str0[1] : str0[1];
    str0[2] = str0[2].length === 1 ? '0' + str0[2] : str0[2];

    const date1 = GetDateStr(1); // 明天
    const str1 = date1.split('-');
    str1[1] = str1[1].length === 1 ? '0' + str1[1] : str1[1];
    str1[2] = str1[2].length === 1 ? '0' + str1[2] : str1[2];


    const date2 = GetDateStr(2); // 后天
    const str2 = date2.split('-');
    str2[1] = str2[1].length === 1 ? '0' + str2[1] : str2[1];
    str2[2] = str2[2].length === 1 ? '0' + str2[2] : str2[2];

    if (year === str3[0] && month === str3[1] && day === str3[2]) {
      return noDetail ? '昨天' : '昨天' + ' ' + hour + ':' + minute;
    } else if (year === str0[0] && month === str0[1] && day === str0[2]) {
      return noDetail ? '今天' : '今天' + ' ' + hour + ':' + minute;
    } else if (year === str1[0] && month === str1[1] && day === str1[2]) {
      return noDetail ? '明天' : '明天' + ' ' + hour + ':' + minute;
    } else if (year === str2[0] && month === str2[1] && day === str2[2]) {
      return noDetail ? '后天' : '后天' + ' ' + hour + ':' + minute;
    } else {
      return noDetail ? '' : createTime;
    }
  }
}

@Pipe({
  name: 'isOptional',
  pure: false
})

@Injectable()
export class IsOptionalPipe implements PipeTransform {
  transform(ticketType, member): boolean {
    let result = true;
    if (ticketType.uidMemCardLevels) {
      if (!member) {
        result = false;
      } else {
        if (ticketType.uidMemCardLevels.indexOf(member.card.uidCardLevel) === -1) {
          result = false;
        }
      }
    }
    return result;
  }
}

@Pipe({
  name: 'dateTag',
  pure: false
})

@Injectable()
export class DateTagPipe implements PipeTransform {
  constructor(private datePipe: DatePipe, private repairDatePipe: RepairDatePipe) {
  }

  transform(plan): any {
    if (!plan) {
      return plan;
    }
    let tag = '';
    const zero = new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd 00:00:00')).getTime();
    const dateTime = new Date(this.datePipe.transform(this.repairDatePipe.transform(plan.posStartTime), 'yyyy/MM/dd HH:mm:ss')).getTime();
    if (dateTime >= (zero + (22 * 3600000)) && dateTime < (zero + (30 * 3600000))) {
      if (dateTime > (zero + (24 * 3600000))) {
        tag = '次日';
      }
    }
    return tag;
  }
}

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {
  }

  public transform(value: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        throw new Error(`Invalid safe type specified: ${type}`);
    }
  }
}
