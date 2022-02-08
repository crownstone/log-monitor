export const fromJSON = (d) => {
  d = d.replace(/\\/g,'');
  try {
    return JSON.parse(d);
  }
  catch (err) {
    console.log("COULD NOT PARSE", d, err);
    throw err
  }
};


export class BaseParser {

  _exportData: object;

  constructor(exportData: object) {
    this._exportData = exportData
  }

  load(item: [number, string]) {
    throw "IMPLEMENT_BY_CHILD";
  }

  export() {
    throw "IMPLEMENT_BY_CHILD";
  }

  search(item : ItemData, parser : parserData) {
    let regexSearch = item[1].match(parser.regex);
    if (!regexSearch) return false;

    let parseResult = {};
    let index = 1;
    for (let mapData of parser.mapping) {
      if (typeof mapData === 'object') {
        let key = Object.keys(mapData)[0];
        parseResult[key] = mapData[key](regexSearch[index++]);
      }
      else {
        parseResult[mapData] = regexSearch[index++];
      }
    }

    this.handleParseResult(item, parser, parseResult);
    return true;
  }

  handleParseResult(item : ItemData, parser : parserData, parseResult: any) {
    throw "IMPLEMENT_BY_CHILD";
  }

}
