import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {EventBusClass} from "../util/EventBus";

export class DataFlowManagerBase {

  groupOrder = null;
  priority : string[] = []

  itemThreshold = 1300;

  eventBus : EventBusClass;
  subscriptions = [];

  eventDataGroups : {[typeId: number]: any[]} = {}
  graphDataGroups : {[typeId: number]: any[]} = {}
  rangeDataGroups : {[typeId: number]: any[]} = {}

  itemDataSet:  vis.DataSet;
  groupDataSet: vis.DataSet;

  startTime = -Infinity;
  endTime = Infinity;

  getTimeout = null;
  breakTime = null;

  lastGetStartTime = null;
  lastGetEndTime   = null;

  constructor(eventBus: EventBusClass) {
    this.eventBus = eventBus;
    this.itemDataSet  = new vis.DataSet([], {queue: true});
    this.groupDataSet = new vis.DataSet([], {queue: true});

    this.eventBus.on("NEW_DATA", (data) => { this.update(data); })
  }

  reset() {
    this.subscriptions.forEach((s) => { s(); });
    this.subscriptions = [];
    this.itemDataSet.clear();
    this.groupDataSet.clear();
    this.groupDataSet.flush();
    this.itemDataSet.flush();
    this.eventDataGroups = {};
    this.rangeDataGroups = {};
  }

  load(data: ParseDataResult) {
    this.reset();
    this.loadSpecificData(data);
  }

  update(data) {
    this.eventDataGroups = {};
    this.graphDataGroups = {};
    this.rangeDataGroups = {};
    this.loadSpecificData(data);
    this.eventBus.emit("UPDATED_DATAFLOW_MANAGER");
    this.get(this.lastGetStartTime, this.lastGetEndTime);
  }

  loadSpecificData(data: ParseDataResult) {
    throw new Error("OVERRIDE_BY_CHILD");
  }

  destroy() {
    clearTimeout(this.getTimeout);
    this.itemDataSet.off("*")
    this.groupDataSet.off("*")
    this.reset();
  }

  delayedGet(start,end, callback) {
    clearTimeout(this.getTimeout);
    this.getTimeout = setTimeout(() => { this.get(start,end); callback(); }, 600);
  }

  get(start: number, end: number) {
    this.itemDataSet.clear();
    this.lastGetStartTime = start;
    this.lastGetEndTime   = end;

    let endTime = -Infinity;
    let aborted = false;

    let itemCount = 0;
    let items = [];
    for (let type of this.priority) {
      let typeData = this.rangeDataGroups[type];
      let itemCandidates = []
      if (typeData) {
        for (let datapoint of typeData) {
          // end in between
          if (datapoint.end && datapoint.end >= start && datapoint.end <= end) {
            itemCount++;
            itemCandidates.push(datapoint);
            endTime = Math.max(datapoint.end, endTime);
          }
          // start in between
          else if (datapoint.start >= start && datapoint.start <= end) {
            itemCount++;
            itemCandidates.push(datapoint);
            endTime = Math.max(datapoint.start, endTime);
          }

          if (itemCount >= this.itemThreshold) {
            aborted = true;
            break;
          }
        }
      }
      if (!aborted || items.length == 0) {
        items = items.concat(itemCandidates);
      }
    }

    for (let type of this.priority) {
      let typeData = this.graphDataGroups[type];
      let itemCandidates = []
      if (typeData) {
        for (let datapoint of typeData) {
          // end in between
          if (datapoint.x >= start && datapoint.x <= end) {
            itemCount++;
            itemCandidates.push(datapoint);
            endTime = Math.max(datapoint.x, endTime);
          }

          if (itemCount >= this.itemThreshold) {
            aborted = true;
            break;
          }
        }
      }
      if (!aborted || items.length == 0) {
        items = items.concat(itemCandidates);
      }
    }

    this.itemDataSet.add(items);
    this.breakTime = endTime;
    if (!aborted || this.breakTime === end) {
      this.breakTime = null;
    }

    this.groupDataSet.flush();
    this.itemDataSet.flush();
  }

  getAll() {
    this.get(this.startTime, this.endTime);
  }
}