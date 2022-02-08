import {DataFlowManagerBase} from "./DataFlowManagerBase";
import {EventBusClass} from "../util/EventBus";

export class BluenetPromiseCountDataFlowManager extends DataFlowManagerBase {

  options : any;

  constructor(eventBus : EventBusClass, options : BluenetPromiseConfig = {}) {
    super(eventBus);
    this.options = options?.dataflow ?? {};
  }

  itemThreshold = 100000;
  priority = [
    "count",
  ]

  loadSpecificData(data: ParseDataResult) {
    let counts = data?.bluenetPromises?.count ?? [];

    if (this.graphDataGroups['count'] === undefined) { this.graphDataGroups['count'] = []; }

    for (let count of counts) {
      this.graphDataGroups['count'].push({x: count.t, y: Number(count.value), group:'1'});
    }

    this.groupDataSet.update({
      id: '1',
      content: 'Open promises',
      options: { drawPoints: { style: "circle", size: 4 } },
      className: 'promiseGraphPoints'
    })
  }

}
