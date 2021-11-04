import React from "react";
import {EventBusClass} from "../util/EventBus";
import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {DataFlowManagerBase} from "../logic/DataFlowManagerBase";


export class DataFlowTimeline {

  timeline;
  dataFlowManager: DataFlowManagerBase;
  eventBus: EventBusClass;
  unsubscribe = [];

  constructor(dataFlowManager: DataFlowManagerBase, eventBus: EventBusClass) {
    this.eventBus = eventBus
    this.dataFlowManager = dataFlowManager
  }

  create(container, options) {
    this.timeline = new vis.Timeline(container, this.dataFlowManager.itemDataSet, this.dataFlowManager.groupDataSet, options);

    this.timeline.on('rangechange',(data) => {
      this.eventBus.emit("RANGE_CHANGED", data);
      this.dataFlowManager.delayedGet(data.start.valueOf(), data.end.valueOf(), () => {
        this._updateDynamicItems()
      })
    })

    this.unsubscribe.push(this.eventBus.on("RANGE_CHANGED", (data) => {
      this.timeline.setWindow(data.start, data.end, {animation: false})
    }))

    // abort marker!
    this._updateDynamicItems()

    // draw reboot markers
    if (this.dataFlowManager.eventDataGroups['reboots']) {
      for (let reboot of this.dataFlowManager.eventDataGroups['reboots']) {
        this.timeline.addCustomTime(new Date(reboot.time), reboot.id, false);
        this.timeline.setCustomTimeMarker(reboot.content, reboot.id, false);
      }
    }

    // draw localization markers
    // if (this.dataFlowManager.eventDataGroups['localization']) {
    //   for (let localizationMarker of this.dataFlowManager.eventDataGroups['localization']) {
    //     this.timeline.addCustomTime(new Date(localizationMarker.time), localizationMarker.id, false);
    //     this.timeline.setCustomTimeMarker(localizationMarker.content, localizationMarker.id, false);
    //   }
    // }


    // draw localization markers
    if (this.dataFlowManager.eventDataGroups['startTime']) {
      this.timeline.addCustomTime(this.dataFlowManager.eventDataGroups['startTime'], 'startTime', false);
      this.timeline.setCustomTimeMarker('START', 'startTime', false);
    }


    // draw localization markers
    if (this.dataFlowManager.eventDataGroups['endTime']) {
      this.timeline.addCustomTime(this.dataFlowManager.eventDataGroups['endTime'], 'endTime', false);
      this.timeline.setCustomTimeMarker('END OF LOGS', 'endTime', false);
    }
  }

  on(event, callback) {
    this.timeline.on(event, callback);
  }

  destroy() {
    this.timeline.destroy();
    for (let unsub of this.unsubscribe) { unsub(); }
  }

  _updateDynamicItems() {
    let abortMarkerId = 'ABORT_MARKER';
    if (this.dataFlowManager.breakTime !== null) {
      try {
        this.timeline.getCustomTime(abortMarkerId)
        this.timeline.setCustomTime(new Date(this.dataFlowManager.breakTime), abortMarkerId);
      } catch (err) {
        this.timeline.addCustomTime(new Date(this.dataFlowManager.breakTime),abortMarkerId, false);
      }
      this.timeline.setCustomTimeMarker("Stopped drawing new items.",abortMarkerId, false);
    }
    else {
      // clean up flag
      try { this.timeline.removeCustomTime(abortMarkerId); } catch (err) {}
    }
  }
}

