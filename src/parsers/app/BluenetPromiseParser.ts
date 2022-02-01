import {BaseParser} from "./BaseParser";

let fromJSON = (d) => { return JSON.parse(d); };

let bluenetPromiseParsers : parserData[] = [
  {type:'bluenetPromise',  label:'promiseStarted',  mapping:['command', {params:fromJSON},'id','appState'], regex:/BluenetPromise: called bluenetPromise\W([\w_]*)\W*with params (\[.*\])\W*for ID:\W(.*)\WAppState:\W(.*)/},
  {type:'bluenetPromise',  label:'promiseRejected', mapping:['command','error','id','appState'],            regex:/BluenetPromise: promise rejected in bridge:\W*([\w_]*)  error:\W(.*)\Wfor ID:\W(.*)\WAppState: (.*)/},
  {type:'bluenetPromise',  label:'promiseResolved', mapping:['command','result','id','appState'],           regex:/BluenetPromise: promise resolved in bridge:\W*([\w_]*)\W*with data:\W*(.*) for ID:\W*([\w\d.]*)\WAppState:\W(\w*)/},
  {type:'bluenetPromise',  label:'promiseResolved', mapping:['command','result','id','appState'],           regex:/BluenetPromise: promise resolved in bridge:\W*([\w_]*)\W*npm start:\W*(.*) for ID:\W*([\w\d.]*)\WAppState:\W(\w*)/},
  {type:'bluenetPromise',  label:'promiseCount',    mapping:['count'],                                      regex:/BluenetPromise: newPromise\W*Amount of currently open promises:\W(\d*)/},
  // {type:'bluenetPromise',  label:'openPromises_start', mapping:[{openPromises:fromJSON}],                      regex:/BluenetPromise: newPromise\W*Currently open promises:\W({.*})/},
  {type:'bluenetPromise',  label:'promiseCount',    mapping:['count'],                                      regex:/BluenetPromise: donePromise\W*Amount of currently open promises:\W(\d*)/},
  // {type:'bluenetPromise',  label:'openPromises_done',  mapping:[{openPromises:fromJSON}],                      regex:/BluenetPromise: donePromise\W*Currently open promises:\W({.*})/},
]

class BluenetPromiseCollector {

  data : any = [];
  count: any[] = [];

  openPromises : any = {};

  collect(item, parser, parseResult: any) {
    if (parser.label === "promiseStarted") {
      this.openPromises[parseResult.id] = {
        id:      parseResult.id,
        tStart:  item[0],
        tEnd:    null,
        success: null,
        command: parseResult.command,
        error:   null,
        params:  parseResult.params,
        result:  null,
        appStateStart: parseResult.appState,
        appStateEnd: null,
      };
    }
    else if (parser.label === "promiseRejected") {
      if (!this.openPromises[parseResult.id]) { return; }

      this.openPromises[parseResult.id].tEnd = item[0];
      this.openPromises[parseResult.id].success = false
      this.openPromises[parseResult.id].error = parseResult.error;
      this.openPromises[parseResult.id].appStateEnd = parseResult.appStateEnd;

      this.data.push(this.openPromises[parseResult.id]);
      delete this.openPromises[parseResult.id];
    }
    else if (parser.label === "promiseResolved") {
      if (!this.openPromises[parseResult.id]) { return; }

      this.openPromises[parseResult.id].tEnd = item[0];
      this.openPromises[parseResult.id].success = true
      this.openPromises[parseResult.id].result = parseResult.result;
      this.openPromises[parseResult.id].appStateEnd = parseResult.appStateEnd;

      this.data.push(this.openPromises[parseResult.id]);
      delete this.openPromises[parseResult.id];
    }
    else if (parser.label === "promiseCount") {
      this.count.push({t:item[0], value: parseResult.count })
    }
  }
}

export class BluenetPromiseParser extends BaseParser {

  collector = new BluenetPromiseCollector()

  load(item) {
    for (let parser of bluenetPromiseParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['bluenetPromises'] = {
      promises: this.collector.data,
      count:    this.collector.count,
    };
  }


  handleParseResult(item, parser, parseResult) {
    if (parser.type === 'bluenetPromise') {
      this.collector.collect(item, parser, parseResult);
    }
  }
}
