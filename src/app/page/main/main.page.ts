import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
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
export type Element_Item_Type = "text-input" | null;
export class Element_Item extends interfaceClass {
  constructor(data?) { super(); this.setOrigin(data); }
  type: "text-input" | null = null;
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
  drag(ev:DragEvent) {
    this.drag_el.type = "text-input";
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
    const correction = {
      width: {
        type: screen.element.active[0].style.width.indexOf('px') > -1 ? 'px' : '%',
        value: Number(screen.element.active[0].style.width.replace(/(px|%)/g, ''))
      },
      height: {
        type: screen.element.active[0].style.height.indexOf('px') > -1 ? 'px' : '%',
        value: Number(screen.element.active[0].style.height.replace(/(px|%)/g, ''))
      }
    }
    screen.element.active[0].style.left =  ev.pageX - rect.x - (correction.width.value/2) + 'px';
    screen.element.active[0].style.top =  ev.pageY - rect.y - (correction.height.value/2) + 'px';
  }
  drop(ev:DragEvent) {
    ev.preventDefault();
    this.drag_el.type = null;
    this.drag_el.enter = false;
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
  element_move_start(element:Element_Item) {

  }
  element_move() {

  }
  element_move_end() {

  }

  mouse_object = {
    item: null as Screen_Item | Element_Item,
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
        this.mouse_object.item.style.top
      }
    }
  }
  mouseend(ev:MouseEvent) {
    if(this.mouse_object.item) {
      this.mouse_object.item.setOrigin(this.mouse_object.item);
      this.mouse_object.item = null;
    }
  }
}