import {BaseParser} from "./BaseParser";

let nameMap = /MapProvider: logMap\W*(\[.*\])"]/

export class NameMapParser extends BaseParser {

  data = [];

  load(item) {
    let mapDetected = item[1].match(nameMap);
    if (mapDetected) {
      let jsonDestringified = mapDetected[1].replace(/\\/g,'');
      this.data = JSON.parse(jsonDestringified);
    }
  }

  export() {
    let resultMap = {};
    for (let point of this.data) {
      if (point.handle) {
        resultMap[point.handle.toLowerCase()] = point
      }
    }


    this._exportData['nameMap'] = resultMap;
  }
}