import {BaseParser, fromJSON} from "./BaseParser";


let storeParsers : parserData[] = [
  {type:'store', label:'dispatch', mapping:[{payload: fromJSON}], regex:/LOG. Store.*will dispatch\s*({.*})/},
]


class StoreCollecter {

  data : any = []

  collect(item, parser, parseResult: any) {
    if (parser.label === "dispatch") {
      this.data.push({t: item[0], action: parseResult.payload})
    }
  }
}

export class StoreParser extends BaseParser {

  collector = new StoreCollecter();

  load(item) {
    for (let parser of storeParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['store'] = {
      actions: this.collector.data,
    };
  }

  handleParseResult(item, parser, parseResult) {
    this.collector.collect(item, parser, parseResult);
  }

}
