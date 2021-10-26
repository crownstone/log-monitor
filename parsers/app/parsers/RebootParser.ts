import {BaseParser} from "./BaseParser";

let rebootApp = /Initializing Logprocessor./

export class RebootParser extends BaseParser {

  data = [];
  reboots = 0

  load(item) {
    let rebootDetected = item[1].match(rebootApp);
    if (rebootDetected) {
      this.data.push([item[0]-1,this.reboots++])
    }
  }

  export() {
    this._exportData['reboots'] = this.data;
  }
}