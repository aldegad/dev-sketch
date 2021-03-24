import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { DeviceService } from './device.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { StorageService } from './storage.service';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import * as FormDataServer from 'form-data';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FileService } from './file.service';

export type Connect_Result = {code:number, data:any, message:string, url:string};
export class Connect_Server {
  one = "http://13.125.150.3/test/api/";
}

@Injectable({
  providedIn: 'root'
})
export class ConnectService {

  server = new Connect_Server();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private alertController: AlertController,
    private http: HttpClient,
    private device: DeviceService,
    private storage: StorageService,
    private loadingController: LoadingController,
    private router: Router,
    private file: FileService
  ) { }
  
  /** 서버 접속. 기본데이터: platform_type, platform_key, user_id, user_session, user_type */
  async run(server:'one', method, data:any = {}, options:{loading?:string, getJSON?:boolean} = {loading: '', getJSON: false}) {
    const url = this.server[server] + method;
    const { platform_type, platform_key } = await this.device.get();
    const { user_id, user_session } = this.storage.user.data;
    data = this.file.classToJSON(data);
    if(!environment.production) {
      const _log = {
        method,
        ...data,
        platform_type, platform_key, 
        user_id: data.user_id || user_id,
        user_session
      };
      if(options.getJSON) {
        console.log(JSON.stringify(_log));
      } else {
        console.log(_log);
      }
    }
    let body:any;
    let headers = new HttpHeaders();
    switch(server) {
      case 'one':
        body = this.jsonToForm({
          ...data,
          platform_type, platform_key, 
          user_id: data.user_id || user_id,
          user_session
        });
        break;
    }
    let result:Connect_Result;

    if(isPlatformServer(this.platformId)) {
      const bodyHeaders = body.getHeaders();
      headers = headers.append('Content-Type', bodyHeaders['content-type']);
      body = this.toArrayBuffer(body.getBuffer());
    }

    let loading:HTMLIonLoadingElement;
    if(isPlatformBrowser(this.platformId)) {
      if(options.loading) {
        loading = await this.loadingController.create({
          mode: 'ios',
          message: options.loading
        });
        await loading.present();
      }
    }

    try {
      const http = await this.http.post(url, body, { headers })
      .pipe(timeout(60000))
      .toPromise() as Connect_Result;
      result = http;
    } catch(error) {
      switch(error.status) {
        case 0:
          result = {code: 1, data: error.message, message: '인터넷 연결을 확인해주세요.', url: url};
          break;
        default:
          if(method !== 'Get_ServerError') {
            this.run('one', 'Get_ServerError', {
              error_type: error.status,
              error_text: error.error,
              url: url,
              data: data
            });
          }
          result = {code: error.status, data: error.error, message: error.message,  url: url};
          break;
      }
    }
    if(!result) return;
    result.url = method;

    if(isPlatformBrowser(this.platformId)) {
      if(options.loading) {
        loading.dismiss();
      }
    }
    if(!environment.production) {
      console.log(result);
    }
    return result;
  }
  async error(title, res:Connect_Result) {
    res.code ? null : res.code = 0;
    switch(res.code) {
      case 1002:
        //ip교체로 인한 세션 마감
        this.storage.user.clear();
        this.router.navigate(['/login'], {replaceUrl: true});
        break;
      default:
        const error = await this.alertController.create({
          mode: 'ios',
          header: `${title}${res.code && !environment.production ? '' : '['+res.code+']'}`,
          subHeader: res.message,
          buttons: [{
            text: '확인'
          }]
        });
        await error.present();
        await error.onDidDismiss();
        break;
    }
  }
  jsonToForm(json) {
    let form;
    if(isPlatformServer(this.platformId)) {
      form = new FormDataServer();
    } else {
      form = new FormData();
    }
    for(let key in json) {
      //object or else - object
      if(typeof json[key] === 'object') {
        //null or undefinded
        if(json[key] === null || json[key] === undefined) {
          form.append(key, json[key]);
        }
        //file or blob
        else if(json[key].constructor.name === 'File' || json[key].constructor.name === 'Blob') {
          form.append(key, json[key]);
        }
        //array
        else if(json[key].constructor.name === 'Array') {
          //empty array
          if(!json[key].length) {
            form.append(key, JSON.stringify(json[key]));
          }
          //file or blob array
          else if(json[key][0].constructor.name == 'File' || json[key][0].constructor.name == 'Blob') {
            for(let i = 0; i < json[key].length; i++) {
              form.append(key, json[key][i]);
            }
          }
          //else
          else {
            form.append(key, JSON.stringify(json[key]));
          }
        }
        //json
        else  {
          form.append(key, JSON.stringify(json[key]));
        }
      }
      //object or else - else
      else {
        form.append(key, json[key]);
      }
    }
    return form;
  }
  toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }
}