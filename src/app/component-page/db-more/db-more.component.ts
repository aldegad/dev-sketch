import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-db-more',
  templateUrl: './db-more.component.html',
  styleUrls: ['./db-more.component.scss'],
})
export class DbMoreComponent implements OnInit {

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
