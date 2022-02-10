import {BaseParser} from "./BaseParser";

let change = {type:'app state',   label: "app state",   mapping: ["state"],  regex:/App State Change (\S*)/}
let state  = {type:'app state',   label: "app state",   mapping: ["state"],  regex:/Current app state\W*(\S*)/}

export class AppStateParser extends BaseParser {

  data = [];

  load(item) {
    if (this.data.length === 0) {
      if (this.search(item, state)) {
        return
      }
    }
    this.search(item, change)
  }

  export() {
    this._exportData['appState'] = this.data;
  }

  handleParseResult(item, parser, parseResult) {
    switch (parser.type) {
      case 'app state':
        this.data.push({time: item[0], state: parseResult.state}); break;
    }

    return true;
  }
}