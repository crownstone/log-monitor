

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
}