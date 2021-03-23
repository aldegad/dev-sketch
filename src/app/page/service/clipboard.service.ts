import { Injectable } from '@angular/core';
import { SimpleToastService } from './simple-toast.service';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  constructor(
    private toast: SimpleToastService
  ) { }

  copy(val:string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.toast.present({message: '클립보드에 복사되었습니다.'});
  }
}
