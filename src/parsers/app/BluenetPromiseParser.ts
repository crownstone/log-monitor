import {BaseParser, fromJSON} from "./BaseParser";


let bluenetPromiseParsers : parserData[] = [
  {type:'bluenetPromise',  label:'promiseStarted',  mapping:['command', {params:fromJSON},'id','appState'], regex:/BluenetPromise: called bluenetPromise\s([\w_]*)\s*with params (\[.*\])\s*for ID:\s(.*)\sAppState:\s(.*)/},
  {type:'bluenetPromise',  label:'promiseRejected', mapping:['command','error','id','appState'],            regex:/BluenetPromise: promise rejected in bridge:\s*([\w_]*)  error:\s(.*)\sfor ID:\s(.*)\sAppState: (.*)/},
  {type:'bluenetPromise',  label:'promiseResolved', mapping:['command','result','id','appState'],           regex:/BluenetPromise: promise resolved in bridge:\s*([\w_]*)\s*with data:\s*(.*) for ID:\s*([\w\d.]*)\sAppState:\s(\w*)/},
  {type:'bluenetPromise',  label:'promiseCount',    mapping:['count'],                                      regex:/BluenetPromise: newPromise\s*Amount of currently open promises:\s(\d*)/},
  // {type:'bluenetPromise',  label:'openPromises_start', mapping:[{openPromises:fromJSON}],                      regex:/BluenetPromise: newPromise\s*Currently open promises:\s({.*})/},
  {type:'bluenetPromise',  label:'promiseCount',    mapping:['count'],                                      regex:/BluenetPromise: donePromise\s*Amount of currently open promises:\s(\d*)/},
  // {type:'bluenetPromise',  label:'openPromises_done',  mapping:[{openPromises:fromJSON}],                      regex:/BluenetPromise: donePromise\s*Currently open promises:\s({.*})/},
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
