import {BaseParser} from "./BaseParser";

let parsers = [
  {type:'sphere',   label: "enter_sphere",   mapping: ["sphereId"],  regex:/LocationHandler: ENTER SPHERE\W*([\w-]*)/},
  {type:'sphere',   label: "exit_sphere",    mapping: ["sphereId"],  regex:/LocationHandler: LEAVING SPHERE\W*([\w-]*)/},
  {type:'location', label: "enter_location", mapping: ["sphereId", "locationId"],  regex:/LocationHandler: USER_ENTER_LOCATION\W*([\w-]*)\W*([\w-]*)/},
];

export class LocalizationParser extends BaseParser {

  sphereEvents = [];
  locationEvents = [];

  load(item) {
    for (let parser of parsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['localization'] = {
      spheres: this.sphereEvents,
      locations: this.locationEvents,
    }
  }

  search(item, parser) {
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

    switch (parser.type) {
      case 'sphere':
        this.sphereEvents.push({time: item[0], label: parser.label, data: parseResult}); break;
      case 'location':
        this.locationEvents.push({time: item[0], label: parser.label, data: parseResult}); break;
    }

    return true;
  }
}