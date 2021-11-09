import {BaseParser} from "./BaseParser";

let fromJSON = (d) => {
  return JSON.parse(d);
};

let cloudParsers : parserData[] = [
  {type:'sync', label:'syncStart', mapping:[], regex:/Sync: Start Syncing./},
  {type:'sync', label:'syncFailed', mapping:[], regex:/Sync: Failed/},
  {type:'sync', label:'syncEnd',  mapping:[], regex:/Sync: Finished. Dispatching/},
  {type:'cloud', label:'request', mapping:['method', 'url', {config: fromJSON}, 'id'],            regex:/(\w*)\W*requesting from URL:\W*(.*)","config\W*({.*})\W*(\w*)/},
  {type:'cloud', label:'reply',   mapping:['url', {config: fromJSON}, {result: fromJSON}, 'id'], regex:/REPLY from\W*(.*)"," with options\W*({.*})\W*" is: "\W*({.*})\W*([\w*]*)/}
]


class CloudCollecter {

  data : any = {};
  syncEvents = [];

  syncStarted = false;
  syncStart

  collect(item, parser, parseResult: any) {
    if (parser.label === "request") {
      this.data[parseResult.id] = {tStart: item[0], tEnd: null, request: {
        config: parseResult.config,
        url: parseResult.url,
      }, reply:{}};
    }
    else if (parser.label === 'reply') {
      this.data[parseResult.id].tEnd = item[0];
      this.data[parseResult.id].reply = {
        result: parseResult.result,
        url: parseResult.url,
      }
    }
  }

  collectSync(item, parser, parseResult) {
    if (parser.label === 'syncStart' && this.syncStarted === false) {
      this.syncStarted = true;
      this.syncStart = item[0]
    }
    if (parser.label === 'syncEnd' && this.syncStarted === true) {
      this.syncStarted = false;
      this.syncEvents.push({tStart: this.syncStart, tEnd: item[0]})
    }
    if (parser.label === 'syncFailed' && this.syncStarted === true) {
      this.syncStarted = false;
      this.syncEvents.push({tStart: this.syncStart, tEnd: item[0], error: true})
    }
  }
}

export class CloudParser extends BaseParser {

  cloudCollector = new CloudCollecter();

  load(item) {
    for (let parser of cloudParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }


  export() {
    this._exportData['cloud'] = {
      requests: this.cloudCollector.data,
      syncs: this.cloudCollector.syncEvents
    };
  }


  handleParseResult(item, parser, parseResult) {
    if (parser.type === 'sync') {
      this.cloudCollector.collectSync(item, parser, parseResult);
    }
    else {
      this.cloudCollector.collect(item, parser, parseResult);
    }
  }

}
