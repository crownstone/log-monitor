import {BaseParser} from "./BaseParser";


export class UptimeParser extends BaseParser {


  bucketSize = 10e3; // 10 seconds
  lastLoggedBucket = 0;
  data = []

  load(item) {
    let t = item[0];

    let bucket = t - t % this.bucketSize;

    if (this.lastLoggedBucket !== bucket) {
      this.data.push(bucket);
    }

    this.lastLoggedBucket = bucket;
  }

  export() {
    this._exportData['uptime'] = {
      data: this.data,
    }
  }

}