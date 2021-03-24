import { Component, OnInit } from '@angular/core';
import { PopoverController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { SketchElementMoreComponent } from 'src/app/component-page/sketch-element-more/sketch-element-more.component';
import { SketchScreenMoreComponent } from 'src/app/component-page/sketch-screen-more/sketch-screen-more.component';
import { DB_Data, DB_Item } from 'src/app/interface';
import { ConnectService } from '../service/connect.service';
import { interfaceClass } from '../service/file.service';

export class Screen_Item extends interfaceClass {
  constructor(data?) { 
    super(); this.setOrigin(data);
    if(data?.element?.list) this.element.list = data.element.list.map(data => new Element_Item(data));
  }
  name = {
    text: 'untitled',
    edit: false,
    edit_text: ''
  }
  style = {
    width: 420,
    height: 720
  }
  element = {
    list: [] as Element_Item[],
    active: [] as Element_Item[]
  }
}
export type Element_Item_Type = "text-input" | "rect" | null;
export class Element_Item extends interfaceClass {
  constructor(data?) { 
    super(); this.setOrigin(data);
    if(data?.events?.click) this.events.click = data.events.click.map(data => new Event_Item(data));
  }
  type: "text-input" | null = null;
  id:string = null;
  value:string = null;
  style = {
    left: '' as string,
    top: '' as string,
    right: '' as string,
    bottom: '' as string,
    width: '' as string,
    height: '' as string,
    paddingLeft: '' as string,
    paddingRight: '' as string,
    paddingTop: '' as string,
    paddingBottom: '' as string
  }
  events = {
    click: [] as Event_Item[]
  }
}
export class Event_Item extends interfaceClass {
  constructor(data?) { 
    super(); 
    switch(data.type) {
      case 'set-data':
        this.event = new Set_Data_Event();
        break;
    }
    this.setOrigin(data);
  }
  type: "set-data" | "get-data" = null;
  event: Set_Data_Event = null;
}
export class Set_Data_Event extends interfaceClass {
  constructor(data?) { super(); this.setOrigin(data); }
  data = [new Set_Data_Event_Row()]
}
export class Set_Data_Event_Row extends interfaceClass {
  constructor(data?) { super(); this.setOrigin(data); }
  db:string = '';
  id:string = '';
}
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
    private connect: ConnectService
  ) { }

  ngOnInit() {
    this.screen.active = this.screen.list[0];
  }
  async ionViewWillEnter() {
    this.page_enable = true;
    this.screen.list = await this.get_sketch_list();
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
    this.insert_sketch_data(screen.name.text, screen);
    screen.element.active[0].setOrigin(screen.element.active[0]);
  }

  screen_add() {
    this.screen.list.push(new Screen_Item())
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
        this.screen.list.splice(i, 1);
        break;
    }
  }
  screen_edit_cancel(screen:Screen_Item) {
    screen.name.edit = false;
  }
  screen_edit_save(screen:Screen_Item) {
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
              const db_list = await this.get_DB_Data();
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
              insert_db_list.forEach(insert_db_item => {
                const db_item:DB_Item = db_list.find(x => x.name.text === insert_db_item.db_name);
                console.log(db_item);
                if(db_item) {
                  const ids = db_item.data.table[0];
                  //db_item.data.table.push();
                }
              });
              let DB_data:DB_Data;
              /* const res = await this.connect.run('one', 'Insert_Db_Data', {
                db_nm: this.DB_list
                db_data:
              }); */
              break;
          }
        });
        break;
    }
  }
  event_set_data_id(screen:Screen_Item, event_data:Set_Data_Event_Row[], data:Set_Data_Event_Row, index:number, last:boolean) {
    if(last && data.db && data.id) event_data.push(new Set_Data_Event_Row());
    if(!last && !data.db && !data.id) event_data.splice(index, 1);
    this.insert_sketch_data(screen.name.text, screen);
  }
  async get_DB_Data() {
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
      this.insert_sketch_data(screen.name.text, screen);
      this.mouse_object.item = null;
      this.mouse_object.item_instance = null;
    }
  }

  async get_sketch_list() {
    const res = await this.connect.run('one', 'Get_Sketch_List');
    switch(res.code) {
      case 0:
        const screen_list:Screen_Item[] = res.data.json_data.map(data => {
          const screen_item = new Screen_Item(JSON.parse(data.sketch_data));
          screen_item.element.active = [];
          return screen_item;
        });
        return screen_list;
      default:
        this.connect.error('아쒸 왜 안되냐고', res);
        return [];
    }
  }
  async insert_sketch_data(sketch_nm:string, sketch_data:Screen_Item) {
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
}