import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

export interface SimpleAlertOptions {
  header?: string,
  subHeader?: string,
  message?: string,
  cssClass?: string,
  backdropDismiss?: boolean,
  inputs?: Array<any>
  buttons?: Array<any>
}
@Injectable({
  providedIn: 'root'
})
export class SimpleAlertService {

  constructor(
    private alert: AlertController
  ) { }
  
  async present(opts:SimpleAlertOptions = {}) {
    const alert = await this.alert.create({
      mode: 'ios',
      header: opts.header,
      subHeader: opts.subHeader,
      message: opts.message,
      cssClass: opts.cssClass,
      backdropDismiss: opts.backdropDismiss,
      inputs: opts.inputs,
      buttons: opts.buttons || [
        {
          text: '확인'
        }
      ]
    });
    alert.present();
    return alert;
  }
}