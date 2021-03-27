import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export interface SimpleToastOptions {
  header?: string,
  message?: string,
  buttons?: Array<any>,
  position?: 'top' | 'middle' | 'bottom',
  duration?: number
}
@Injectable({
  providedIn: 'root'
})
export class SimpleToastService {

  constructor(
    private toast: ToastController
  ) { }
  
  async present(opts:SimpleToastOptions = {}) {
    const toast = await this.toast.create({
      position: opts.position,
      header: opts.header,
      message: opts.message,
      buttons: opts.buttons,
      duration: opts.duration || 2000
    });
    toast.present();
    return toast;
  }
}
