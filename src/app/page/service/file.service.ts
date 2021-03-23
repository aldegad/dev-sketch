import { Injectable } from '@angular/core';
import * as base64js from 'base64-js';
//import * as XLSX from '@sheet/image';
declare const XLSX;
declare const pdfjsLib;

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  createObjectURL(blob:File | Blob) {
    return (window.URL ? URL : window['webkitURL']).createObjectURL(blob);
  }
  dataURItoBlob(dataURI) {
    //console.log(dataURI);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = base64js.toByteArray(dataURI.split(',')[1]);
    var blob: any = new Blob([ab], {
      type: mimeString
    });
    blob.lastModifiedDate = new Date();
    return blob;
  }

  getDataFromXlsx(f):Promise<any[]> {
    return new Promise((res, rej) => {
      var reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary',
          cellStyles: true
        });
        const xlsx_data = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        const arr = xlsx_data.split('\n');
        let rows = [];
        arr.map((item, i) => {
          const row = item.split(',');
          let new_row = [];
          let quotes_start = false; 
          row.map((col:string) => {
            if(!quotes_start) {
              new_row.push(col);
            } else {
              new_row[new_row.length-1] += col;
            }
            if(col.startsWith('"')) {
              quotes_start = true;
              new_row[new_row.length-1] = new_row[new_row.length-1].substring(1, new_row[new_row.length-1].length);
            }
            if(col.endsWith('"')) {
              quotes_start = false;
              new_row[new_row.length-1] = new_row[new_row.length-1].substring(0, new_row[new_row.length-1].length-1);
            }
          });
          rows.push(new_row);
        });
        res(rows);
      };
      reader.onerror = (ex) => {
        console.log(ex);
        rej(ex);
      };
      reader.readAsBinaryString(f);
    });
  }


  downloadExcel(excel:Excel_Data, name) {

    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: name,
      Subject: name,
      Author: "Dev.monter",
      CreatedDate: new Date()
    };

    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'];
    
    excel.forEach(sheet => {
      //each sheet

      let sheet_width = 0;
      const sheet_height = sheet.data.length;
      let row_heights = [];
      let col_widths = [];
      const ws = {};
      let merge_data:Array<{s:{c:number, r:number}, e:{c:number, r:number}}> = [];
      sheet.data.forEach((row, ri) => {
        const cur_ri = ri;
        let cur_ci = -1;
        row.forEach((col, ci) => {
          cur_ci++;
          for(let mi = 0; mi < merge_data.length; mi++) {
            const merge = merge_data[mi];
            if(
               (merge.s.c <= cur_ci && cur_ci <= merge.e.c)
            && (merge.s.r <= cur_ri && cur_ri <= merge.e.r)
            ) {
              cur_ci += merge.e.c - cur_ci + 1;
            }
          }
          const cr = alphabet[cur_ci] + String(cur_ri+1);
          if(!ws[cr]) ws[cr] = { t: "s", v: col.text, s: {} };
          for(let styleKey in col.style) {
            switch(styleKey) {
              case 'backgroundColor':
                ws[cr].s["fgColor"] = { rgb: col.style[styleKey].replace('#', '') }
                break;
              case 'border':
                const border_arr = col.style[styleKey].split(' ');
                let borderWidth = '';
                let borderColor = border_arr[2].replace('#', '');
                if(border_arr[0] === '1px') {
                  borderWidth = 'thin';
                } else if(border_arr[0] === '2px') {
                  borderWidth = 'medium';
                } else {
                  borderWidth = 'thick';
                }
                ws[cr].s["top"] = { style: borderWidth, color: { rgb: borderColor } };
                ws[cr].s["bottom"] = { style: borderWidth, color: { rgb: borderColor } };
                ws[cr].s["left"] = { style: borderWidth, color: { rgb: borderColor } };
                ws[cr].s["right"] = { style: borderWidth, color: { rgb: borderColor } };
                for(let x = 1; x < col.colspan; x++) {
                  const merged_cr = alphabet[cur_ci + x] + String(cur_ri+1);
                  if(!ws[merged_cr]) ws[merged_cr] = { t: "s", s: {} };
                  ws[merged_cr].s["top"] = { style: borderWidth, color: { rgb: borderColor } };
                  ws[merged_cr].s["bottom"] = { style: borderWidth, color: { rgb: borderColor } };
                  ws[merged_cr].s["left"] = { style: borderWidth, color: { rgb: borderColor } };
                  ws[merged_cr].s["right"] = { style: borderWidth, color: { rgb: borderColor } };
                }
                for(let y = 1; y < col.rowspan; y++) {
                  const merged_cr = alphabet[cur_ci] + String(cur_ri + 1 + y);
                  if(!ws[merged_cr]) ws[merged_cr] = { t: "s", s: {} };
                  ws[merged_cr].s["top"] = { style: borderWidth, color: { rgb: borderColor } };
                  ws[merged_cr].s["bottom"] = { style: borderWidth, color: { rgb: borderColor } };
                  ws[merged_cr].s["left"] = { style: borderWidth, color: { rgb: borderColor } };
                  ws[merged_cr].s["right"] = { style: borderWidth, color: { rgb: borderColor } };
                }
                break;
              case 'textAlign':
                if(!ws[cr].s["alignment"]) ws[cr].s["alignment"] = {};
                ws[cr].s["alignment"]["horizontal"] = col.style[styleKey];
                break;
              case 'verticalAlign':
                if(!ws[cr].s["alignment"]) ws[cr].s["alignment"] = {};
                switch(col.style[styleKey]) {
                  case 'middle':
                    ws[cr].s["alignment"]["vertical"] = "center";
                    break;
                  default:
                    ws[cr].s["alignment"]["vertical"] = col.style[styleKey];
                    break;
                }
                break;
            }
          }
          if(col.colspan || col.rowspan) {
            const s = { c: cur_ci, r: cur_ri };
            const e = { 
              c: col.colspan ? cur_ci + col.colspan - 1 : cur_ci,
              r: col.rowspan ? cur_ri + col.rowspan - 1 : cur_ri
            }
            merge_data.push({ s, e });
          }
        });
        if(sheet_width < cur_ci) sheet_width = cur_ci;
      });

      console.log(ws);
      const ref = `A1:${alphabet[sheet_width]}${sheet_height}`;
      ws['!ref'] = ref;
      ws['!merges'] = merge_data;
      wb.SheetNames.push(sheet.name);
      wb.Sheets[sheet.name] = ws;
    });
    
    XLSX.writeFile(wb, name + ".xlsx", { cellStyles: true, bookSST: false });
  }

  readLocalExcel(url):Promise<any> {
    return new Promise(async(res, rej) => {
      const req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
      req.onload = (e) => {
        const data = new Uint8Array(req.response);
        const workbook = XLSX.read(req.response, {type:"buffer", bookImages: true, cellStyles: true});
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        res(ws);
      }
      req.onerror = (e) => {
        rej(e);
      }
      req.send();
    });
  }

  copyFile(url) {
    return new Promise(async(res, rej) => {
      const req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "blob";
      req.onload = (e) => {
        res(req.response);
      }
      req.onerror = (e) => {
        rej(e);
      }
      req.send();
    });
  }

  async getPdfDoc(pdf_url) {
    const doc = await pdfjsLib.getDocument({url: pdf_url});
    return doc;
  }
  getPdfPage(pdf_doc, page_num):Promise<string> {
    return new Promise(async(res) => {
      const page = await pdf_doc.getPage(page_num);
      const viewport = page.getViewport(1);
      const c = document.createElement('canvas');
      c.height = viewport.height;
      c.width = viewport.width;
      const render_contenxt = {
        canvasContext: c.getContext('2d'),
        viewport
      }
      await page.render(render_contenxt);
      c.toBlob(blob => {
        res(this.createObjectURL(blob));
        c.remove();
      });
    });
  }

  testExcel(url, filename) {
    return new Promise(async(res) => {
      const req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
  
      req.onload = (e) => {
        console.log(req.response);
        const data = new Uint8Array(req.response);
        console.log(data);
        const workbook = XLSX.read(req.response, {type:"buffer", bookImages: true});
        console.log(workbook);
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        console.log(ws['!images']);
        ws['!images'].push({
          "!pos": { x: 100, y: 100, w: 300, h: 300 },
          "!datatype": "binary",
          "!data": ws['!images'][0]['!data']
        });
        XLSX.writeFile(workbook, 'output.xlsx');
        res(ws['!images'][0]['!data']);
      }
      req.onerror = (e) => {
        res(e);
      }
      req.send();
    });
  }

  classToJSON(_class) {
    let clone:any = {};
    const proto = Object.getPrototypeOf(_class);
    for(let key of Object.getOwnPropertyNames(proto)) {
      const prop:any = _class[key];
      switch(key) {
        case 'constructor': case 'hasOwnProperty': case 'isPrototypeOf': case 'propertyIsEnumerable': case 'toLocaleString': case 'valueOf': case 'toString': case '__defineGetter__': case '__defineSetter__': case '__lookupGetter__': case '__lookupSetter__':
          break;
        default:
          clone[key] = prop;
          break;
      }
    }
    clone = {
      ...clone,
      ..._class
    }
    if(clone.origin) delete clone.origin;
    return clone;
  }

  /** prev ver. dont erase it */
  /* downloadExcel(url, filename, data_arr:any[] = [], start_number:number = 1) {
    return new Promise(async(res) => {
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
  
      req.onload = (e) => {
        var data = new Uint8Array(req.response);
        
        var workbook = XLSX.read(data, {type:"array", cellStyles: true});
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'];
        const ref = `A1:${alphabet[data_arr[0].length-1]}${start_number + data_arr.length-1}`;
        data_arr.map((row, i) => {
          row.map((v, j) => {
            const key = alphabet[j] + String(start_number + i);
            const value = v !== null ? v : '';
            workbook.Sheets[workbook.SheetNames[0]][key] = {
              t: "s", v: value, r: `<t>${value}</t>`, h: value, w: value
            }
          });
        });
        workbook.Sheets[workbook.SheetNames[0]]['!ref'] = ref;
        console.log(workbook.Sheets[workbook.SheetNames[0]]);
        XLSX.writeFile(workbook, filename);
        res(e);
      }
      req.onerror = (e) => {
        res(e);
      }
      req.send();
    });
  } */
}

export class interfaceClass {
  setOrigin(data) {
    if(data) {
      for(let key in this) {
        if(key === 'origin') continue;
        if(typeof data[key] === 'undefined') {
          this.origin[key] = this[key];
        }
        else if(typeof data[key] === 'object') {
          if(this[key]?.constructor.name === 'Array') {
            this[key] = data[key] === null ? this[key] : JSON.parse(JSON.stringify(data[key]));
            this.origin[key] = data[key] === null ? this[key] : JSON.parse(JSON.stringify(data[key]));
          } else {
            this[key] = data[key] === null ? this[key] : {...data[key]};
            this.origin[key] = data[key] === null ? this[key] : {...data[key]};
          }
        }
        else {
          this[key] = data[key];
          this.origin[key] = data[key];
        }
      }
      const proto = Object.getPrototypeOf(this);
      for(let key of Object.getOwnPropertyNames(proto)) {
        const prop:any = this[key];
        switch(key) {
          case 'constructor': case 'hasOwnProperty': case 'isPrototypeOf': case 'propertyIsEnumerable': case 'toLocaleString': case 'valueOf': case 'toString': case '__defineGetter__': case '__defineSetter__': case '__lookupGetter__': case '__lookupSetter__':
            break;
          default:
            this.origin[key] = prop;
            break;
        }
      }
    } else {
      for(let key in this) {
        if(key === 'origin') continue;
        if(typeof this[key] === 'object') {
          if(this[key].constructor.name === 'Array') {
            this.origin[key] = JSON.parse(JSON.stringify(this[key]));
          } else {
            this.origin[key] = {...this[key]};
          }
        } else {
          this.origin[key] = this[key];
        }
      }
    }
  }
  checkChange() {
    const _self:any = this;
    for(let key in _self) {
      if(key !== 'origin' && _self[key] !== _self.origin[key]) {
        if(typeof _self[key] === 'object') {
          if(JSON.stringify(_self[key]) !== JSON.stringify(_self.origin[key])) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
    return false;
  }
  toJSON() {
    let clone:any = {};
    const proto = Object.getPrototypeOf(this);
    for(let key of Object.getOwnPropertyNames(proto)) {
      const prop:any = this[key];
      switch(key) {
        case 'constructor': case 'hasOwnProperty': case 'isPrototypeOf': case 'propertyIsEnumerable': case 'toLocaleString': case 'valueOf': case 'toString': case '__defineGetter__': case '__defineSetter__': case '__lookupGetter__': case '__lookupSetter__':
          break;
        default:
          clone[key] = prop;
          break;
      }
    }
    clone = {
      ...clone,
      ...this
    }
    if(clone.origin) delete clone.origin;
    return clone;
  }
  origin:any = {};
}


export type Excel_Data = Array<Sheet_Data>;
export interface Sheet_Data {
  name: string,
  data: Array<Array<{
    text: string | number,
    rowspan?: number,
    colspan?: number,
    style?: Sheet_style
  }>>
};
export interface Sheet_style {
  color?: CSSStyleDeclaration["color"],
  background?: CSSStyleDeclaration["background"],
  backgroundColor?: CSSStyleDeclaration["backgroundColor"],
  textAlign?: CSSStyleDeclaration["textAlign"],
  border?: CSSStyleDeclaration["border"],
  verticalAlign?: CSSStyleDeclaration["verticalAlign"],
  width?: CSSStyleDeclaration["width"],
  height?: CSSStyleDeclaration["height"]
}