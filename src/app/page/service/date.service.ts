import { Injectable } from '@angular/core';
import { NumberService } from './number.service';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor(
    private number: NumberService
  ) { }

  day(date:Date) {
    const arr = ['일', '월', '화', '수', '목', '금', '토'];
    return arr[date.getDay()];
  }
  getNextWeek() {
    var monday = new Date();
    var sunday = new Date();
    monday.setDate(monday.getDate() + (1 + 7 - monday.getDay())); // 월요일
    sunday.setDate(sunday.getDate() + (1 + 7 - sunday.getDay()) + 6) ; // 그다음 일요일
    console.log("다음주 월 : " + monday );
    console.log("그다음 일  : " + sunday );
    return {
      monday,
      sunday
    }
  }

  today(opts:{year?:number, month?:number, date?:number} = {year: 0, month: 0, date: 0}, type: 'DATE' | 'TIME' = 'DATE') {
    const resDate = new Date();
    if (opts.year) resDate.setFullYear(resDate.getFullYear() + opts.year);
    if (opts.month) resDate.setMonth(resDate.getMonth() + opts.month);
    if (opts.date) resDate.setDate(resDate.getDate() + opts.date);
    switch(type) {
        case 'DATE':
            return resDate.getFullYear() + '-' + this.number.XX(resDate.getMonth() + 1) + '-' + this.number.XX(resDate.getDate());
        case 'TIME':
            return new Date().toISOString();
    }
  }
  string(date:Date | string, type = '-', time:boolean = false) {
    let resDate:Date;
    resDate = typeof date === 'string' ? new Date(date) : date;
    switch(time) {
      case false:
        return resDate.getFullYear() + type + this.number.XX(resDate.getMonth() + 1) + type + this.number.XX(resDate.getDate());
      case true:
        return resDate.getFullYear() + type + this.number.XX(resDate.getMonth() + 1) + type + this.number.XX(resDate.getDate()) + ' ' + this.number.XX(resDate.getHours()) + ':' + this.number.XX(resDate.getMinutes()) + ':' + this.number.XX(resDate.getSeconds());
    }
  }
  koreanText(date:Date | string) {
    const ins_date = typeof date === 'string' ? new Date(date) : date;
    return ins_date.getFullYear() + '년 ' + this.number.XX(ins_date.getMonth() + 1) + '월 ' + this.number.XX(ins_date.getDate()) + '일';
  }
  age(date:Date | string) {
    const ins_date = typeof date === 'string' ? new Date(date) : date;
    return new Date().getFullYear() - ins_date.getFullYear() + 1;
  }
  dirrerence(date1:string, date2:string, type:'Year'|'Month'|'Date'|'HOUR'="Date") {
    const date_1 = new Date(date1);
    const date_2 = new Date(date2);
    const def_time = date_2.getTime() - date_1.getTime();
    const def_days = def_time / (1000 * 3600 * 24);
    const def_hours = def_time / (1000 * 3600);
    switch(type) {
        case 'Year':
            return Math.floor(def_days / 365);
        case 'Date':
            return def_days;
        case 'HOUR':
            return def_hours;
    }
  }
  getDaysArray(start:Date | string, end:Date | string) {
    if(typeof start === 'string') start = new Date(start);
    if(typeof end === 'string') end = new Date(end);
    let arr:Date[] = [];
    for(let dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
  }
  dayObject(date) {
    const resDate = new Date(date);
    return {
      date: this.string(resDate),
      hour: this.number.XX(resDate.getHours()),
      minute: this.number.XX(resDate.getMinutes()),
      second: this.number.XX(resDate.getSeconds())
    }
  }

  convertDaysOfWeek(daysOfWeek) {
    var strDaysOfWeek = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var strDaysOfWeek1 = ["일", "월", "화", "수", "목", "금", "토"];

    var s = "";
    var needComma = false;

    for (var i = 0; i < strDaysOfWeek.length; i++) {
      var day1 = strDaysOfWeek[i];

      var foundIndex = daysOfWeek.indexOf(day1);
      if (foundIndex >= 0) {
        if (needComma) {
          s += ", ";
        }
        else {
          needComma = true;
        }

        s += strDaysOfWeek1[i];
      }
    }

    return s;
  }

  getDaysList(startDateText, endDateText) {
    var startDate = new Date(startDateText);
    var endDate = new Date(endDateText);

    var days = [];

    for (var date1 = startDate; date1 <= endDate;) {
      var day1 = date1.getDay();      
      if (days.indexOf(day1) < 0) {
        days.push(day1);

        if (days.length >= 7)
          break;
      }

      date1.setDate(date1.getDate() + 1);
    }

    days.sort();

    var list = [];

    var strDays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    for (var i = 0; i < days.length; i++) {
      list.push(strDays[days[i]]);
    }

    return list;
  }
}
