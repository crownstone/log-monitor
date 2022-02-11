import {BaseParser} from "./BaseParser";


export class UptimeParser extends BaseParser {

  bucketSize = 30e3; // 10 seconds
  lastLoggedBucket = 0;
  data = []

  load(item) {
    let t = item[0];

    let bucket = t - t % this.bucketSize;

    if (this.lastLoggedBucket !== bucket) {
      let dt = bucket - this.lastLoggedBucket;
      if (dt > 120000 && this.lastLoggedBucket > 0) {
        this.data.push({t:this.lastLoggedBucket+1, value:0});
        this.data.push({t:bucket-1, value:0});
      }
      this.data.push({t:bucket, value:1});
    }

    this.lastLoggedBucket = bucket;
  }

  export() {
    this._exportData['uptime'] = {
      data: this.data,
    }
  }

}