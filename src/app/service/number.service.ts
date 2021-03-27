import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberService {

  constructor() { }

  number(number:string | number) {
    return String(number).replace(/[^\d]/g, "");
  }
  number_origin(number:string | number) {
    return String(number).replace(/[^\d]/g, "") == '' ? '0' : String(number).replace(/[^\d]/g, "");
  }
  XX(number:string | number) {
    let sNumber = String(number);
    if (sNumber.length < 2) sNumber = "0" + sNumber;
    return sNumber;
  }
  price(number) {
    let sNumber = String(number);
    let sNumber_2 = [];
    if(sNumber.indexOf('.') != -1){
      sNumber_2 = sNumber.split('.');
      let str = sNumber_2[0].replace(/[^0-9]/g, '');
      let price = str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      return sNumber.startsWith('-') ? '-' + price + '.' + sNumber_2[1] : price + '.' + sNumber_2[1];
    } else {
      let str = sNumber.replace(/[^0-9]/g, '');
      let price = str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      return sNumber.startsWith('-') ? '-' + price : price;
    }
  }
  phone(number, type:'normal' | 'hide' = 'normal') {
    var tmp = '';
    var str = String(number).replace(/[^0-9]/g, '');
    switch (str.length) {
      case 10: case 9: case 8: case 7:
        tmp = str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3, 3);
        tmp += '-';
        if(type === 'normal') tmp += str.substr(6);
        else tmp += str.substr(6).replace(/./g, '*');
        break;
      case 6: case 5: case 4:
        tmp = str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3);
        break;
      case 3: case 2: case 1: case 0:
        tmp = str;
        break;
      default:
        tmp += str.substr(0, 3);
        tmp += '-';
        tmp += str.substr(3, 4);
        tmp += '-';
        if(type === 'normal') tmp += str.substr(7, 4);
        else tmp += str.substr(7, 4).replace(/./g, '*');
        break;
    }
    return tmp;
  }
  fix(number, length, min = 0, max = null) {
    let sNumber = String(number);
    sNumber = String(sNumber).replace(/[^0-9]/g, '');
    if (sNumber.length < length) sNumber = new Array(length - sNumber.length).fill(0).join('') + sNumber;
    else sNumber = sNumber.slice(-length);
    if(max && Number(sNumber) > max) sNumber = String(max);
    return sNumber;
  }
}
