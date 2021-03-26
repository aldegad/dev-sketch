import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DbMoreComponent } from 'src/app/component-page/db-more/db-more.component';
import { DB_Item, DB_Data } from 'src/app/interface';
import { ConnectService } from '../service/connect.service';

@Component({
  selector: 'app-db',
  templateUrl: './db.page.html',
  styleUrls: ['./db.page.scss'],
})
export class DbPage implements OnInit {

  page_enable:boolean = false;

  DB_list = {
      array: [new DB_Item()],
      active: null as DB_Item
  };

  constructor(
    private popover: PopoverController,
    private connect: ConnectService
  ) { }

  ngOnInit() {
    this.DB_list.active = this.DB_list.array[0];
  }
  ionViewWillEnter() {
    this.page_enable = true;
    this.get_DB_List();
  }
  ionViewDidLeave() {
    this.page_enable = false;
  }
  async get_DB_List() {
    const res = await this.connect.run('one', 'Get_Db_List', {
      db_nm: 'untitled'
    });
    switch(res.code) {
      case 0:
        this.DB_list.array = res.data.json_data.map(data => {
          return {
            name: {
              text: data.db_nm,
              edit: false,
              edit_text: ''
            },
            data: JSON.parse(data.db_data)
          }
        });
        this.DB_list.active = this.DB_list.array[0];
        break;
      default:
        this.connect.error('디비 목록 가져오기 실패', res.data);
        break;
    }
  }

  get_DB_col_labels(count:number) {
    var arr = [];
    const char_arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (var i = 0; i < count; ++i){
      let num = i;
      let calc:boolean = true;
      arr[i] = '';
      while(calc) {
        arr[i] = char_arr[(num)%26] + arr[i];
        num = Math.floor((num)/26);
        if(num === 0) calc = false;
      }
    }
    return arr;
  }

  DB_add() {
    this.DB_list.array.push(new DB_Item());
  }
  db_active(DB_item:DB_Item) {
    this.DB_list.active = DB_item;
  }
  async db_more(ev:MouseEvent, DB_item:DB_Item, i:number) {
    ev.stopPropagation();
    const popover = await this.popover.create({
      component: DbMoreComponent,
      event: ev
    });
    popover.present();
    const { data } = await popover.onWillDismiss();
    switch(data) {
      case "edit-name":
        DB_item.name.edit_text = DB_item.name.text === 'untitled' ? '' : DB_item.name.text;
        DB_item.name.edit = true;
        break;
      case 'remove':
        this.connect.run('one', 'Delete_Db_Data', {
          db_nm: DB_item.name.text
        })
        this.DB_list.array.splice(i, 1);
        break;
    }
  }
  db_edit_cancel(DB_item:DB_Item) {
    DB_item.name.edit = false;
  }
  async db_edit_save(DB_item:DB_Item) {
    const res = await this.connect.run('one', 'Change_Db_Name', {
      db_nm: DB_item.name.text,
      new_db_nm: DB_item.name.edit_text
    });
    switch(res.code) {
      case 0:
        break;
      default:
        this.connect.error('DB 이름 변경 안됨', res);
        break;
    }
    DB_item.name.text = DB_item.name.edit_text;
    DB_item.name.edit = false;
  }

  edit_db(db_data:DB_Data) {
    let last_value_row_index = 0;
    let last_value_col_index = 0;

    //get last row value
    db_data.table.forEach((row, ri) => {
      row.forEach(col => {
        if(col.value) last_value_row_index = ri;
      });
    });

    //get last col value
    db_data.table.forEach((row) => {
      row.forEach((col, ci) => {
        if(col.value && ci > last_value_col_index) last_value_col_index = ci;
      });
    });

    const additional_row_count = 10 - (db_data.table.length - last_value_row_index);
    let step = 0;
    if(additional_row_count > 0) {
      while(step < additional_row_count) {
        db_data.table.push(this.add_DB_row(db_data.table[0].length));
        step++;
      }
    } else if(additional_row_count < 0) {
      const last_row_index = last_value_row_index + 10 > 27 ? last_value_row_index + 10 : 27;
      db_data.table.splice(last_row_index, db_data.table.length);
    }

    
    db_data.table.forEach(row => {
      const additional_col_count = 10 - (row.length - last_value_col_index);
      if(additional_col_count > 0) {
        let step = 0;
        while(step < additional_col_count) {
          row.push({ value: '' });
          step++;
        }
      } else if(additional_col_count < 0) {
        const last_col_index = last_value_col_index + 10 > 26 ? last_value_col_index + 10 : 26;
        row.splice(last_col_index, row.length);
      }
    });
    this.set_db();
  }
  add_DB_row(count:number) {
    let arr = [];
    while(arr.length < count) {
      arr.push({ value: '' });
    }
    return arr;
  }

  set_time_limit = false;
  async set_db() {
    if(this.set_time_limit) return;
    this.set_time_limit = true;

    await new Promise(res => setTimeout(res, 100));
    const res = await this.connect.run('one', 'Insert_Db_Data', {
      db_nm: this.DB_list.active.name.text,
      db_data: this.DB_list.active.data
    });
    switch(res.code) {
      case 0:
        break;
      default:
        this.connect.error('아 왜 안됨', res);
        break;
    }
    this.set_time_limit = false;
  }
}