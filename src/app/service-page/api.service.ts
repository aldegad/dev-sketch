import { Injectable } from '@angular/core';
import { DB_Item, Screen_Item } from '../interface';
import { ConnectService } from '../service/connect.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private connect: ConnectService
  ) { }

  async get_sketch_list() {
    const res = await this.connect.run('one', 'Get_Sketch_List');
    switch(res.code) {
      case 0:
        const screen_list:Screen_Item[] = res.data.json_data.map(data => {
          const screen_item = new Screen_Item(JSON.parse(data.sketch_data));
          screen_item.element.active = [];
          screen_item.name.text = data.sketch_nm;
          return screen_item;
        });
        console.log(screen_list);
        return screen_list;
      default:
        this.connect.error('아쒸 왜 안되냐고', res);
        return [];
    }
  }
  async insert_sketch_data(sketch_item:Screen_Item) {
    const sketch_nm = sketch_item.name.text;
    const sketch_data = sketch_item;
    const res = await this.connect.run('one', 'Insert_Sketch_Data', {
      sketch_nm,
      sketch_data
    });
    switch(res.code) {
      case 0:
        break;
      default:
        this.connect.error('아쒸 왜 안되냐고', res);
        break;
    }
  }
  async change_sketch_name(sketch_item:Screen_Item) {
    const res = await this.connect.run('one', 'Change_Sketch_Name', {
      sketch_nm: sketch_item.name.text,
      new_sketch_nm: sketch_item.name.edit_text
    });
    switch(res.code) {
      case 0:
        this.insert_sketch_data(sketch_item);
        break;
      default:
        this.connect.error('스케치 이름 변경 안됨', res);
        break;
    }
  }
  async delete_sketch_data(sketch_item:Screen_Item) {
    const res = await this.connect.run('one', 'Delete_Sketch_Data', {
      sketch_nm: sketch_item.name.text
    });
    switch(res.code) {
      case 0:
        
        break;
      default:
        this.connect.error('스케치 삭제 안됨', res);
        break;
    }
  }

  async insert_db_data(db_item:DB_Item) {
    const res = await this.connect.run('one', 'Insert_Db_Data', {
      db_nm: db_item.name.text,
      db_data: db_item.data
    });
    switch(res.code) {
      case 0:
        break;
      default:
        this.connect.error('아 왜 안됨', res);
        break;
    }
  }
  async get_db_Data() {
    const res = await this.connect.run('one', 'Get_Db_List');
    switch(res.code) {
      case 0:
        return res.data.json_data.map(data => {
          return {
            name: {
              text: data.db_nm,
              edit: false,
              edit_text: ''
            },
            data: JSON.parse(data.db_data)
          }
        }) as DB_Item[];
      default:
        return [];
    }
  }
}
