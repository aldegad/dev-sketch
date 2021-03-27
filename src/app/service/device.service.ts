import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  platform_type:number = 0;
  platform_key:string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private platform: Platform
  ) {}

  isIE() {
    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) { // IE 일 경우
      return true;
    }
    else {
      return false;
    }
  }
  async get() {
    if(this.platform_type === 0) {
      await this.set();
    }
    return {
      platform_type: this.platform_type,
      platform_key: this.platform_key
    };
  }
  set() {
    return new Promise((res, rej) => {
      if(isPlatformServer(this.platformId)) {
        this.platform_type = 3;
      } else {
        if(this.platform.is('android') && !this.platform.is('mobileweb')) {
          this.platform_type = 1;
        }
        else if(this.platform.is('ios') && !this.platform.is('mobileweb')) {
          this.platform_type = 2;
        }
        else if(this.platform.is('desktop')) {
          this.platform_type = 3;
        }
        else if(this.platform.is('android') && this.platform.is('mobileweb')) {
          this.platform_type = 4;
        }
        else if(this.platform.is('ios') && this.platform.is('mobileweb')) {
          this.platform_type = 5;
        }
      }
      this.platform_key = this.getPlatformKey();
      res(null);
    });
  }
  getPlatformKey() {
    if(!window.localStorage.getItem('uuid')) {
      window.localStorage.setItem('uuid', this.makeid(20)); 
    }
    return window.localStorage.getItem('uuid');
  }
  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
}
