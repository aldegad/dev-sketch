import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

export interface SimpleLoadingOptions {
  message?: string
}
@Injectable({
  providedIn: 'root'
})
export class SimpleLoadingService {

  constructor(
    private loading: LoadingController
  ) { }

  async present(opts:SimpleLoadingOptions = {}) {
    const loading = await this.loading.create({
      mode: 'ios',
      message: opts.message
    });
    await loading.present();
    return loading;
  }
}
