import {BaseParser, fromJSON} from "./BaseParser";

let scannerParsers : parserData[] = [
  {type:'scanningStart',  label:'startNormalScanning',  mapping:[], regex:/BatterySavingUtil: startNormalUsage, Start Scanning/},
  {type:'batterySavingStart',  label:'startBatterySaving',  mapping:[], regex:/BatterySavingUtil: startBatterySaving, execute/},
]


export class ScanningParser extends BaseParser {

  data = []

  load(item) {
    for (let parser of scannerParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['scanning'] = this.data;
  }

  handleParseResult(item, parser, parseResult) {
    if (parser.type === 'scanningStart') {
      this.data.push({t:item[0], state: 'scanningStart'});
    }
    else if (parser.type === 'batterySavingStart') {
      this.data.push({t:item[0], state: 'batterySavingStart'});
    }
  }

}