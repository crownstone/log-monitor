import React from "react";
import {Timeline} from "./base/Timeline";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {ScanningDataFlowManager} from "../../logic/DataFlowManager_scanning";

export class ScanningTimeline extends Timeline<any> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: ScanningDataFlowManager;
  unsubscribe = [];

  options = {
    showMajorLabels: false,
    showMinorLabels: false,
  }

  constructor(props) {
    super(props);
    this.dataFlowManager  = new ScanningDataFlowManager(this.props.eventBus, this.props.config);
    this.dataFlowTimeline = new DataFlowTimeline(this.dataFlowManager, this.props.eventBus);
    this.dataFlowTimeline.options = this.options;
  }
}
