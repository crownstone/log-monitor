import {BaseParser, fromJSON} from "./BaseParser";


let bluenetPromiseParsers : parserData[] = [
  {type:'events',  label:'eventData',  mapping:['state','topic','topicCount','totalCount','type','busId'], regex:/(\w*ubscribed).*topic\[(\w*)].*topicCount:\[(\w*)\].*totalCount:\[(\w*)\].*type:\[(\w*)\].*busId:\[([\w-]*)]/},
]

class EventCollector {

  bus : any = {};

  collect(item, parser, parseResult: any) {
    if (parser.label === "eventData") {
      if (this.bus[parseResult.type] === undefined) {
        this.bus[parseResult.type] = { topics: {}, count: [] };
      }


      let topic = parseResult.topic;
      if (this.bus[parseResult.type].topics[topic] === undefined) {
        this.bus[parseResult.type].topics[topic] = [];
      }

      if (parseResult.state === "Subscribed") {
        this.bus[parseResult.type].topics[topic].push({t: item[0], y: parseResult.topicCount})
      }
      else {
        // Unsubscribed
        this.bus[parseResult.type].topics[topic].push({t: item[0], y: parseResult.topicCount})
      }
      this.bus[parseResult.type].count.push({t: item[0], y: parseResult.totalCount})
    }
  }
}

export class EventCountParser extends BaseParser {

  collector = new EventCollector()

  load(item) {
    for (let parser of bluenetPromiseParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['eventBus'] = this.collector.bus;
  }


  handleParseResult(item, parser, parseResult) {
    if (parser.type === 'events') {
      this.collector.collect(item, parser, parseResult);
    }
  }
}
