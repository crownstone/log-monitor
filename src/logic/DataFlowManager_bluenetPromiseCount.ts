import {DataFlowManagerEvents} from "./DataFlowManager_events";

export class BluenetPromiseCountDataFlowManager extends DataFlowManagerEvents {

  options : any;

  constructor(options : BluenetPromiseConfig = {}) {
    super();
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
      this.graphDataGroups['count'].push({x: count.t, y: Number(count.value), group:1});
    }

    this.groupDataSet.add({
      id: 1,
      content: 'Open promises',
      // Optional: a field 'visible'
      // Optional: a field 'className'
      // Optional: options
    })
  }

}
