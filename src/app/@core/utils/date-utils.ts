import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DateUtils {

  // 是否相同日期
  isSameDate(date , current){
    let isSameDate = false;
    if (date && current.getFullYear() === date.getFullYear()
      && current.getMonth() === date.getMonth()
      && current.getDate() === date.getDate()){
      isSameDate = true;
    }
    return isSameDate;
  }

  // 增减天数
  addDay(today , days){
    return new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  }

  isToday(current){
    return this.isSameDate(new Date(), current);
  }

  isYesterday(current){
    const date = this.addDay(new Date(), -1);
    return this.isSameDate(date, current);
  }

  isTomorrow(current){
    const date = this.addDay(new Date(), 1);
    return this.isSameDate(date, current);
  }

  isAfterTomorrow(current){
    const date = this.addDay(new Date(), 2);
    return this.isSameDate(date, current);
  }

  getTodayTomorrowName(today){
    if (this.isYesterday(today)){
      return '昨天';
    }else if (this.isToday(today)){
      return '今天';
    }else if (this.isTomorrow(today)){
      return '明天';
    }else if (this.isAfterTomorrow(today)){
      return '后天';
    }
    return '';
  }

  addMonth(months, current) {
    debugger;
    const arrMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const o = {
      year : current.getFullYear(), // 年
      month : current.getMonth(), // 月份
      date : current.getDate(), // 日
      hours : current.getHours(), // 小时
      minutes : current.getMinutes(), // 分
      seconds : current.getSeconds(), // 秒
      milliseconds : current.getMilliseconds() // 毫秒
    };
    // 润年，二月29天
    if ((o.year % 4 === 0 && o.year % 100 !== 0) || o.year % 400 === 0){
      arrMonthDays[1] = 29;
    }
    o.year += Math.floor(months / 12);
    o.month += months % 12;
    if (o.month < 0){
      o.month += 12;
      o.year -= 1;
    }else if (o.month >= 12){
      o.month -= 12;
      o.year += 1;
    }
    if (o.date > arrMonthDays[o.month]){
      o.date = arrMonthDays[o.month];
    }
    return new Date(o.year, o.month, o.date, o.hours, o.minutes, o.seconds, o.milliseconds);
  }

}
