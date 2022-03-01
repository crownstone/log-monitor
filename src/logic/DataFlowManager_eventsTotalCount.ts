import {DataFlowManagerBase} from "./DataFlowManagerBase";
import {EventBusClass} from "../util/EventBus";

export class EventsTotalCountDataFlowManager extends DataFlowManagerBase {

  options : any;
  busType: string;

  constructor(eventBus : EventBusClass, options : EventsConfig = {}, busType: string) {
    super(eventBus);
    this.options = options?.dataflow ?? {};
    this.busType = busType;
  }

  itemThreshold = 100000;
  priority = [
    "count",
  ]

  loadSpecificData(data: ParseDataResult) {
    let eventData = data?.eventBus?.[this.busType]
    let countArray = eventData.count;

    if (this.graphDataGroups['count'] === undefined) { this.graphDataGroups['count'] = []; }

    for (let count of countArray) {
      this.graphDataGroups['count'].push({x: count.t, y: Number(count.y), group:'1'});
    }

    this.groupDataSet.update({
      id: '1',
      content: `active event listeners in ${this.busType}`,
      options: { drawPoints: { style: "circle", size: 4 } },
      className: 'promiseGraphPoints'
    })
  }

}
