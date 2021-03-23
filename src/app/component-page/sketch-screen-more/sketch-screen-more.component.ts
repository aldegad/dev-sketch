import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-sketch-screen-more',
  templateUrl: './sketch-screen-more.component.html',
  styleUrls: ['./sketch-screen-more.component.scss'],
})
export class SketchScreenMoreComponent implements OnInit {

  constructor(
    private popover: PopoverController
  ) { }

  ngOnInit() {}

  edit_name() {
    this.popover.dismiss("edit-name");
  }
  remove() {
    this.popover.dismiss("remove");
  }
}
