import {DataFlowManagerEvents} from "./DataFlowManager_events";
import {getGroupName} from "../parsers/util";
import {EventBusClass} from "../util/EventBus";

export class BluenetPromiseDataFlowManager extends DataFlowManagerEvents {

  options : any;
  idMap = {};

  constructor(eventBus : EventBusClass, options : BluenetPromiseConfig = {}) {
    super(eventBus, options);
    this.options = options?.dataflow ?? {};
  }

  itemThreshold = 1000;
  priority = [
    "promises_error",
    "promises_success",
    "promises_error_connection_cancelled",
  ]

  loadSpecificData(data: ParseDataResult) {
    let promises = data?.bluenetPromises?.promises ?? [];
    let nameMap = data?.nameMap;
    let groups = {}

    if (this.rangeDataGroups['promises_success'] === undefined) { this.rangeDataGroups['promises_success'] = []; }
    if (this.rangeDataGroups['promises_error']   === undefined) { this.rangeDataGroups['promises_error']   = []; }
    if (this.rangeDataGroups['promises_error_connection_cancelled'] === undefined) { this.rangeDataGroups['promises_error_connection_cancelled'] = []; }

    let index = 0;
    for (let promise of promises) {
      this.idMap[promise.id] = index++;
      groups[promise.command] = {id: promise.command, content: promise.command, style:'width: 300px'};
      if (promise.success) {
        let handle = promise.params[0];
        let groupName = handle && typeof handle === 'string' && getGroupName(nameMap, handle) || handle;
        if (!groupName || typeof groupName !== 'string') {
          groupName = ''
        }
        this.rangeDataGroups['promises_success'].push({id: promise.id, content: groupName, start: promise.tStart, end: promise.tEnd, group: promise.command, className:'success'});
      }
      else {
        if (promise.error === "CONNECTION_CANCELLED") {
          if (this.options.showCancelledConnections === true) {
            this.rangeDataGroups['promises_error_connection_cancelled'].push({id: promise.id, content: promise.error, start: promise.tStart, end: promise.tEnd, group: promise.command, className:'error'});
          }
        }
        else {
          this.rangeDataGroups['promises_error'].push({id: promise.id, content: promise.error, start: promise.tStart, end: promise.tEnd, group: promise.command, className:'error'});
        }
      }
    }

    for (let key in this.rangeDataGroups) {
      this.rangeDataGroups[key].sort((a,b) => { return a.start - b.start})
    }

    this.loadReboots(data);
    this.loadStartEndTimes(data);
    this.loadLocalization(data);
    this.groupDataSet.update(Object.values(groups));
  }

}
