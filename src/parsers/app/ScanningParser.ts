import {BaseParser} from "./BaseParser";


export class ScanningParser extends BaseParser {

  data

  load(item) {

  }

  export() {
    this._exportData['scanning'] = {
      data: this.data,
    }
  }

}