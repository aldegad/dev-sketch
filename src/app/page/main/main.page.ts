import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SketchElementMoreComponent } from 'src/app/component-page/sketch-element-more/sketch-element-more.component';
import { SketchScreenMoreComponent } from 'src/app/component-page/sketch-screen-more/sketch-screen-more.component';
import { interfaceClass } from '../service/file.service';

export class Screen_Item extends interfaceClass {
  constructor(data?) { super(); this.setOrigin(data); }
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
  constructor(data?) { super(); this.setOrigin(data); }
  type: "text-input" | null = null;
  id:string = null;
  style = {
    left: '' as string,
    top: '' as string,
    right: null as string,
    bottom: null as string,
    width: '' as string,
    height: '' as string,
    paddingLeft: '' as string,
    paddingRight: '' as string,
    paddingTop: '' as string,
    paddingBottom: '' as string
  }
}
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  screen = {
    list: [new Screen_Item()],
    active: [] as Screen_Item[]
  }

  element_menu = {
    type: 'Details',
    description: ''
  }

  constructor(
    private popover: PopoverController
  ) { }

  ngOnInit() {
    this.screen.active.push(this.screen.list[0]);
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
    console.log(screen.element.active[0]);
    screen.element.active[0].setOrigin(screen.element.active[0]);
  }

  screen_add() {
    this.screen.list.push(new Screen_Item())
  }
  screen_remove(screen_index:number) {
    this.screen.list.splice(screen_index, 1);
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
    this.screen.active = [screen];
  }
  
  element_active(ev:MouseEvent, screen:Screen_Item, element:Element_Item) {
    screen.element.active = [];
    screen.element.active.push(element);
  }
  element_style_correction(style_value) {
    const correction = {
      type: style_value.indexOf('px') > -1 ? 'px' : '%',
      value: Number(style_value.replace(/(px|%)/g, ''))
    }
    return correction;
  }

  async event_add() {
    const popover = await this.popover.create({
      component: SketchElementMoreComponent
    });
    popover.present();
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
  mouseend(ev:MouseEvent) {
    if(this.mouse_object.item) {
      this.mouse_object.item.setOrigin(this.mouse_object.item);
      this.mouse_object.item = null;
      this.mouse_object.item_instance = null;
    }
  }
}