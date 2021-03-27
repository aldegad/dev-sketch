import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export class User_Data {
  user_id = 0;
  user_session = '';
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    @Inject(PLATFORM_ID) private platformId
  ) {
    this.user.get();
  }

  private name = 'dev-sketch@';

  user = {
    auto_login: true,
    data: new User_Data(),
    get: () => {
      if(!isPlatformServer(this.platformId)) {

        const first_key = this.name + Object.keys(this.user.data)[0];
        const storage = window.sessionStorage.getItem(first_key) ? 'sessionStorage' :
        window.localStorage.getItem(first_key) ? 'localStorage' : '';
        if(storage === 'localStorage') this.user.auto_login = true;
        else this.user.auto_login = false;
        if(storage) {
          for(let key in this.user.data) {
            switch(typeof this.user.data[key]) {
              case 'string':
                this.user.data[key] = window[storage].getItem(this.name + key);
                break;
              case 'number':
                this.user.data[key] = Number(window[storage].getItem(this.name + key));
                break;
              case 'object':
                if(window[storage].getItem(this.name + key)) {
                  this.user.data[key] = JSON.parse(window[storage].getItem(this.name + key));
                }
                break;
            }
          }
        } else {
          this.user.data = new User_Data();
        }
      }
      return this.user.data;
    },
    set: (data:User_Data, auto:boolean = true) => {
      this.user.clear();
      if(!isPlatformServer(this.platformId)) {
        let storage:string = auto ? 'localStorage' : 'sessionStorage';
        for(let key in this.user.data) {
          switch(typeof this.user.data[key]) {
            case 'object':
              switch(this.user.data[key].constructor.name) {
                case 'Array':
                  if(data[key] === null || data[key] === undefined) {
                    window[storage].setItem(this.name + key, '[]');
                  } else {
                    window[storage].setItem(this.name + key, JSON.stringify(data[key]));
                  }
                  break;
                default:
                  if(data[key] === null || data[key] === undefined) {
                    window[storage].setItem(this.name + key, '{}');
                  } else {
                    window[storage].setItem(this.name + key, JSON.stringify(data[key]));
                  }
                  break;
              }
              break;
            default:
              window[storage].setItem(this.name + key, data[key]);
              break;
          }
        }
      }
      this.user.get();
    },
    clear: () => {
      if(!isPlatformServer(this.platformId)) {
        for(let key in this.user.data) {
          window.sessionStorage.removeItem(this.name + key);
          window.localStorage.removeItem(this.name + key);
        }
        this.user.get();
      }
    },
    fill: (obj) => {
      for(let key in this.user.data) obj[key] !== undefined ? obj[key] = this.user.data[key] : null;
      return obj;
    }
  }
}