import { Component, OnInit } from '@angular/core';
import { PopoverController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { SketchElementMoreComponent } from 'src/app/component-page/sketch-element-more/sketch-element-more.component';
import { SketchScreenMoreComponent } from 'src/app/component-page/sketch-screen-more/sketch-screen-more.component';
import { DB_Data, DB_Item, Element_Item, Element_Item_Type, Event_Item, Screen_Item, Set_Data_Event_Row } from 'src/app/interface';
import { ApiService } from 'src/app/service-page/api.service';
import { ConnectService } from '../../service/connect.service';
import { interfaceClass } from '../../service/file.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss']
})
export class MainPage implements OnInit, ViewWillEnter, ViewDidLeave {

  page_enable:boolean = false;

  screen = {
    list: [new Screen_Item()],
    active: null as Screen_Item
  }

  element_menu = {
    type: 'Details',
    description: ''
  }

  constructor(
    private popover: PopoverController,
    public api: ApiService
  ) { }

  ngOnInit() {
    this.screen.active = this.screen.list[0];
  }
  async ionViewWillEnter() {
    this.page_enable = true;
    this.screen.list = await this.api.get_sketch_list();
    this.screen.active = this.screen.list[0];
  }
  ionViewDidLeave() {
    this.page_enable = false;
  }

  drag_el = {
    enter: false,
    type: null as Element_Item_Type
  }
  dragstart(ev:DragEvent, type) {
    this.drag_el.type = type;
  }
  dragenter(ev:DragEvent, screen:Screen_Item) {
    this.drag_el.enter = true;
    switch(this.drag_el.type) {
      case 'text-input':
        screen.element.list.push(new Element_Item({type: "text-input", style: {
          width: '180px', height: '36px', paddingLeft: '8px', paddingRight: '8px'
        }}));
        screen.element.active = [screen.element.list[screen.element.list.length -1]];
        break;
      case 'rect':
        screen.element.list.push(new Element_Item({type: "rect", style: {
          width: '180px', height: '36px', paddingLeft: '8px', paddingRight: '8px'
        }}));
        screen.element.active = [screen.element.list[screen.element.list.length -1]];
        break;
    }
  }
  dragleave(ev:DragEvent, screen:Screen_Item) {
    this.drag_el.enter = false;
    screen.element.list.pop();
    screen.element.active.pop();
  }
  dragover(ev:DragEvent, screen:Screen_Item) {
    ev.preventDefault();
    const rect:DOMRect = (ev.target as Element).getBoundingClientRect();
    const c_width = this.element_style_correction(screen.element.active[0].style.width);
    const c_height = this.element_style_correction(screen.element.active[0].style.height);
    screen.element.active[0].style.left =  ev.pageX - rect.x - (c_width.value/2) + 'px';
    screen.element.active[0].style.top =  ev.pageY - rect.y - (c_height.value/2) + 'px';
  }
  drop(ev:DragEvent, screen:Screen_Item) {
    ev.preventDefault();
    this.drag_el.type = null;
    this.drag_el.enter = false;
    this.api.insert_sketch_data(screen);
    screen.element.active[0].setOrigin(screen.element.active[0]);
  }

  async screen_add() {
    this.screen.list.push(new Screen_Item());
    const last_screen = this.screen.list[this.screen.list.length-1];
    this.api.insert_sketch_data(last_screen);
  }
  screen_remove(screen:Screen_Item) {
    const index = this.screen.list.indexOf(screen);
    this.screen.list.splice(index, 1);
  }
  async screen_more(ev:MouseEvent, screen:Screen_Item, i) {
    ev.stopPropagation();
    const popover = await this.popover.create({
      component: SketchScreenMoreComponent,
      event: ev
    });
    popover.present();
    const { data } = await popover.onDidDismiss();
    switch(data) {
      case "edit-name":
        screen.name.edit_text = screen.name.text === 'untitled' ? '' : screen.name.text;
        screen.name.edit = true;
        break;
      case 'remove':
        this.api.delete_sketch_data(screen);
        this.screen.list.splice(i, 1);
        break;
    }
  }
  screen_edit_cancel(screen:Screen_Item) {
    screen.name.edit = false;
  }
  async screen_edit_save(screen:Screen_Item) {
    this.api.change_sketch_name(screen);
    screen.name.text = screen.name.edit_text;
    screen.name.edit = false;
  }
  screen_active(screen:Screen_Item) {
    this.screen.active = screen;
  }
  
  element_active(ev:MouseEvent, screen:Screen_Item, element:Element_Item) {
    screen.element.active = [];
    console.log(element);
    screen.element.active.push(element);
  }
  element_style_correction(style_value) {
    const correction = {
      type: style_value.indexOf('px') > -1 ? 'px' : '%',
      value: Number(style_value.replace(/(px|%)/g, ''))
    }
    return correction;
  }

  async event_add(ev:MouseEvent, type) {
    const popover = await this.popover.create({
      component: SketchElementMoreComponent,
      event: ev
    });
    popover.present();

    const { data } = await popover.onWillDismiss();
    switch(data) {
      case 'set-data':
        const last_active_index = this.screen.active.element.active.length - 1;
        this.screen.active.element.active[last_active_index].events[type].push(new Event_Item({ type: "set-data" }));
        break;
      case 'update-data':
        break;
      case 'get-data':

        break;
    }
  }
  event_provoke(type:string, screen:Screen_Item, element:Element_Item) {
    switch(type) {
      case 'click':
        element.events.click.forEach(async(event) => {
          switch(event.type) {
            case 'set-data':
              const db_list = await this.api.get_db_Data();
              const insert_db_list = [] as {
                db_name: string,
                datas: [{ id:string, value:any }]
              }[];
              event.event.data.forEach(async(data_row) => {
                if(data_row.db && data_row.id) {
                  const insert_db_item = insert_db_list.find(x => x.db_name === data_row.db);
                  const id = data_row.id;
                  const value = screen.element.list.find(x => x.id === id)?.value;
                  if(insert_db_item) {
                    insert_db_item.datas.push({id, value});
                  } else {
                    insert_db_list.push({
                      db_name: data_row.db,
                      datas: [{ id, value }]
                    });
                  }
                }
              });
              console.log(db_list);
              console.log(insert_db_list);
              insert_db_list.forEach(async(insert_db_item) => {
                const db_item:DB_Item = db_list.find(x => x.name.text === insert_db_item.db_name);
                console.log(db_item);
                if(db_item) {
                  let last_ri = 0;
                  let last_ci = 0;
                  //get last row & col index
                  db_item.data.table.forEach((row, ri) => {
                    row.forEach((col, ci) => {
                      if(col.value) last_ri = ri;
                      if(col.value && ci > last_ci) last_ci = ci;
                    });
                  });

                  const ids = db_item.data.table[0];
                  insert_db_item.datas.forEach(insert_data => {
                    const id_index = ids.findIndex(id => id.value === insert_data.id);
                    if(id_index > -1) {
                      if(!db_item.data.table[last_ri+1]) db_item.data.table[last_ri+1] = db_item.data.table[last_ri].map(() => {return {value: ''}});
                      db_item.data.table[last_ri+1][id_index] = {value: insert_data.value};
                    }
                  });
                  this.api.insert_db_data(db_item);
                }
                //테이블이 없으면 생성하자.
              });
          }
        });
        break;
    }
  }
  event_set_data_id(screen:Screen_Item, event_data:Set_Data_Event_Row[], data:Set_Data_Event_Row, index:number, last:boolean) {
    if(last && data.db && data.id) event_data.push(new Set_Data_Event_Row());
    if(!last && !data.db && !data.id) event_data.splice(index, 1);
    this.api.insert_sketch_data(screen);
  }

  //mouse events. 나중에 element active 이벤트와 합치는 것이 관리가 더 편할 수도 있음. 일단 다른게 더 중요하므로 추후 고려.

  mouse_object = {
    item: null as Screen_Item | Element_Item,
    item_instance: null as string,
    type: null as any,
    start: {
      x: 0,
      y: 0
    }
  }
  mousedown(ev:MouseEvent) {
    this.screen.list.forEach(screen => {
      screen.element.active = [];
    });
  }
  mousestart(ev:MouseEvent, item:Screen_Item | Element_Item, type: any) {
    this.mouse_object.item = item;
    if(this.mouse_object.item instanceof Screen_Item) this.mouse_object.item_instance = 'Screen_Item';
    else if(this.mouse_object.item instanceof Element_Item) this.mouse_object.item_instance = 'Element_Item';
    this.mouse_object.type = type;
    this.mouse_object.start.x = ev.pageX;
    this.mouse_object.start.y = ev.pageY;
  }
  mousemove(ev:MouseEvent) {
    if(this.mouse_object.item) {
      const move = {
        x: ev.pageX - this.mouse_object.start.x,
        y: ev.pageY - this.mouse_object.start.y
      }
      if(this.mouse_object.item instanceof Screen_Item) {
        switch(this.mouse_object.type) {
          case 'width':
            this.mouse_object.item.style.width = this.mouse_object.item.origin.style.width + (move.x * 2);
            break;
          case 'height':
            this.mouse_object.item.style.height = this.mouse_object.item.origin.style.height + move.y;
            break;
          case 'both':
            this.mouse_object.item.style.width = this.mouse_object.item.origin.style.width + (move.x * 2);
            this.mouse_object.item.style.height = this.mouse_object.item.origin.style.height + move.y;
            break;
        }
      } else if(this.mouse_object.item instanceof Element_Item) {
        console.log(this.mouse_object.item.origin.style);
        const c_top = this.element_style_correction(this.mouse_object.item.origin.style.top);
        const c_left = this.element_style_correction(this.mouse_object.item.origin.style.left);
        const c_height = this.element_style_correction(this.mouse_object.item.origin.style.height);
        const c_width = this.element_style_correction(this.mouse_object.item.origin.style.width);
        switch(this.mouse_object.type) {
          case 'move':
            this.mouse_object.item.style.top = c_top.value + move.y + 'px';
            this.mouse_object.item.style.left = c_left.value + move.x + 'px';
            break;
          case 'scale-top':
            this.mouse_object.item.style.top = c_top.value + move.y + 'px';
            this.mouse_object.item.style.height = c_height.value - move.y + 'px';
            break;
          case 'scale-bottom':
            this.mouse_object.item.style.height = c_height.value + move.y + 'px';
            break;
          case 'scale-right':
            this.mouse_object.item.style.width = c_width.value + move.x + 'px';
            break;
          case 'scale-left':
            this.mouse_object.item.style.left = c_left.value + move.x + 'px';
            this.mouse_object.item.style.width = c_width.value - move.x + 'px';
            break;
        }
      }
    }
  }
  mouseend(ev:MouseEvent, screen:Screen_Item) {
    if(this.mouse_object.item) {
      this.mouse_object.item.setOrigin(this.mouse_object.item);
      this.api.insert_sketch_data(screen);
      this.mouse_object.item = null;
      this.mouse_object.item_instance = null;
    }
  }
}