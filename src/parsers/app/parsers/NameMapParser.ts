import {BaseParser} from "./BaseParser";

let nameMap = /Initializing Logprocessor./

export class NameMapParser extends BaseParser {

  data = {};

  load(item) {
    let mapDetected = item[1].match(nameMap);
    if (mapDetected) {
      this.data = mapDetected[2]
    }
  }

  export() {
    // this._exportData['nameMap'] = JSON.parse(this.data);
  }
}