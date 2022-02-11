import {DataFlowManagerBase} from "./DataFlowManagerBase";
import {EventBusClass} from "../util/EventBus";

export class UptimeDataFlowManager extends DataFlowManagerBase {

  options : any;

  constructor(eventBus : EventBusClass, options : UptimeConfig = {}) {
    super(eventBus);
    this.options = options?.dataflow ?? {};
  }

  itemThreshold = 100000;
  priority = [
    "uptime",
  ]

  loadSpecificData(data: ParseDataResult) {
    let buckets = data?.uptime?.data ?? [];

    if (this.graphDataGroups['uptime'] === undefined) { this.graphDataGroups['uptime'] = []; }

    for (let bucket of buckets) {
      this.graphDataGroups['uptime'].push({x: bucket.t, y: bucket.value, group:'1'});
    }

    this.groupDataSet.update({
      id: '1',
      content: 'Uptime',
      options: { drawPoints: { style: "circle", size: 3 } },
      className: 'uptimePoints'
    })
  }

}
