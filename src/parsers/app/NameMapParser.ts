import {BaseParser} from "./BaseParser";

let nameMap = /MapProvider: nameMap\W*({.*)"\]/

export class NameMapParser extends BaseParser {

  data : any = {};

  load(item) {
    let mapDetected = item[1].match(nameMap);
    if (mapDetected) {
      let jsonDestringified = mapDetected[1].replace(/\\/g,'');
      this.data = JSON.parse(jsonDestringified);
    }
  }

  export() {
    let resultMap = {};
    let handles = Object.keys(this.data.stoneHandleMap ?? {});
    for (let handle of handles) {
      resultMap[handle.toLowerCase()] = this.data.stoneHandleMap[handle];
    }

    this.data.stoneHandleMap = resultMap;

    this._exportData['nameMap'] = this.data;
  }
}