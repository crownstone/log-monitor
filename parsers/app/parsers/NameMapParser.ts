import {BaseParser} from "./BaseParser";

let nameMap = /Initializing Logprocessor./

export class NameMapParser extends BaseParser {

  data = {};

  load(item) {
    let rebootDetected = item[1].match(nameMap);
    if (rebootDetected) {
      // this.data.push([item[0]-1,this.reboots++])
    }
  }

  export() {
    this._exportData['nameMap'] = this.data;
  }
}