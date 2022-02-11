import React from "react";
import {Timeline} from "./base/Timeline";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {SphereDataFlowManager} from "../../logic/DataFlowManager_sphere";

export class SphereTimeline extends Timeline<any> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: SphereDataFlowManager;
  unsubscribe = [];

  options = {
    showMajorLabels: false,
    showMinorLabels: false,
  }

  constructor(props) {
    super(props);
    this.dataFlowManager  = new SphereDataFlowManager(this.props.eventBus, this.props.config);
    this.dataFlowTimeline = new DataFlowTimeline(this.dataFlowManager, this.props.eventBus);
    this.dataFlowTimeline.options = this.options;
  }
}
