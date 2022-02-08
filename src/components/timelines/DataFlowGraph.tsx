import React from "react";
import {EventBusClass} from "../../util/EventBus";
import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {DataFlowManagerBase} from "../../logic/DataFlowManagerBase";


export class DataFlowGraph {

  timeline;
  dataFlowManager: DataFlowManagerBase;
  eventBus: EventBusClass;
  unsubscribe = [];

  markers = [];

  constructor(dataFlowManager: DataFlowManagerBase, eventBus: EventBusClass) {
    this.eventBus = eventBus
    this.dataFlowManager = dataFlowManager
  }

  create(container, options) {
    this.timeline = new vis.Graph2d(container, this.dataFlowManager.itemDataSet, this.dataFlowManager.groupDataSet, options);

    this.timeline.on('rangechange',(data) => {
      this.eventBus.emit("RANGE_CHANGED", data);
    })

    this.unsubscribe.push(this.eventBus.on("RANGE_CHANGED", (data) => {
      this.timeline.setWindow(data.start, data.end, {animation: false})
    }))

    // abort marker!
    this._updateDynamicItems()

    this.drawMarkers();
  }

  drawMarkers() {
    this.clearMarkers();
    // draw reboot markers
    if (this.dataFlowManager.eventDataGroups['reboots']) {
      for (let reboot of this.dataFlowManager.eventDataGroups['reboots']) {
        this.markers.push(reboot.id);
        this.timeline.addCustomTime(new Date(reboot.time), reboot.id, false);
        this.timeline.setCustomTimeMarker(reboot.content, reboot.id, false);
      }
    }

    // draw localization markers
    if (this.dataFlowManager.eventDataGroups['localization']) {
      for (let localizationMarker of this.dataFlowManager.eventDataGroups['localization']) {
        this.markers.push(localizationMarker.id);
        this.timeline.addCustomTime(new Date(localizationMarker.time), localizationMarker.id, false);
        this.timeline.setCustomTimeMarker(localizationMarker.content, localizationMarker.id, false);
      }
    }


    // draw localization markers
    if (this.dataFlowManager.eventDataGroups['startTime']) {
      this.markers.push('startTime');
      this.timeline.addCustomTime(this.dataFlowManager.eventDataGroups['startTime'], 'startTime', false);
      this.timeline.setCustomTimeMarker('START', 'startTime', false);
    }


    // draw localization markers
    if (this.dataFlowManager.eventDataGroups['endTime']) {
      this.markers.push('endTime');
      this.timeline.addCustomTime(this.dataFlowManager.eventDataGroups['endTime'], 'endTime', false);
      this.timeline.setCustomTimeMarker('END OF LOGS', 'endTime', false);
    }
  }

  clearMarkers() {
    for (let markerId of this.markers) {
      try { this.timeline.removeCustomTime(markerId); } catch (err) { console.log("FAILED TO REMOVE MARKER", markerId, err)}
    }
    this.markers = [];
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

