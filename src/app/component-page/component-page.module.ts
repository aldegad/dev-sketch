import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SketchScreenMoreComponent } from './sketch-screen-more/sketch-screen-more.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SketchElementMoreComponent } from './sketch-element-more/sketch-element-more.component';



@NgModule({
  declarations: [
    SketchScreenMoreComponent,
    SketchElementMoreComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    SketchScreenMoreComponent,
    SketchElementMoreComponent
  ]
})
export class ComponentPageModule { }
