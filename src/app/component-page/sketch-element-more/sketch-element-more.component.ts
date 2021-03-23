import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sketch-element-more',
  templateUrl: './sketch-element-more.component.html',
  styleUrls: ['./sketch-element-more.component.scss'],
})
export class SketchElementMoreComponent implements OnInit {

  constructor(
    private popover: PopoverController
  ) { }

  ngOnInit() {}

  set_data() {

  }
  get_data() {
    
  }
}
