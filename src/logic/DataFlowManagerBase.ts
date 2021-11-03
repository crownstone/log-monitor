import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {Util} from "../util/Util";

export class DataFlowManagerBase {

  priority : string[] = []

  itemThreshold = 2000;

  eventDataGroups : {[typeId: number]: any[]}  = {}
  rangeDataGroups : {[typeId: number] : any[]} = {}

  itemDataSet:  vis.DataSet;
  groupDataSet: vis.DataSet;

  startTime = Infinity;
  endTime = -Infinity;

  getTimeout = null;

  breakTime = null;

  constructor() {
    this.itemDataSet  = new vis.DataSet([], {queue: true});
    this.groupDataSet = new vis.DataSet([], {queue: true});
  }

  load(data: ParseDataResult) {
    throw new Error("OVERRIDE_BY_CHILD");
  }

  destroy() {
    clearTimeout(this.getTimeout);
    this.itemDataSet.off("*")
    this.groupDataSet.off("*")
    this.itemDataSet.clear();
    this.groupDataSet.clear();
    this.groupDataSet.flush();
    this.itemDataSet.flush();
    this.eventDataGroups = {};
    this.rangeDataGroups = {};
  }

  delayedGet(start,end, callback) {
    clearTimeout(this.getTimeout);
    this.getTimeout = setTimeout(() => { this.get(start,end); callback(); }, 200);
  }

  get(start: number, end: number) {
    this.itemDataSet.clear()

    let itemsAdded = 0;
    let endTime = -Infinity;
    let broken = false;

    for (let type of this.priority) {
      let typeData = this.rangeDataGroups[type];
      if (typeData) {
        let minIndex = Util.binSearch(start, typeData, 'end');
        let maxIndex = Util.binSearch(end, typeData, 'start');

        if (!minIndex) { minIndex = 0; }
        if (!maxIndex) { maxIndex = typeData.length-1; }

        let itemCount = maxIndex - minIndex;

        if (itemsAdded + itemCount > this.itemThreshold) {
          if (itemsAdded >= this.itemThreshold) {
            broken = true;
            break;
          }
          else {
            maxIndex = this.itemThreshold - itemsAdded + minIndex;
          }
        }

        endTime = Math.max(typeData[maxIndex].start, endTime);
        itemsAdded += maxIndex - minIndex;
        this.itemDataSet.add(typeData.slice(minIndex, maxIndex+1));
      }
    }

    this.breakTime = endTime;
    if (!broken) {
      this.breakTime = null;
    }

    this.groupDataSet.flush();
    this.itemDataSet.flush();
  }

  getAll() {
    this.get(this.startTime, this.endTime);
  }
}