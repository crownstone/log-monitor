import React from "react";
import {AppStateDataFlowManager} from "../../logic/DataFlowManager_appState";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {Timeline} from "./base/Timeline";

export class AppStateTimeline extends Timeline<any> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: AppStateDataFlowManager;
  unsubscribe = [];

  options = {
    showMajorLabels: false,
    showMinorLabels: false,

  }

  constructor(props) {
    super(props);
    this.dataFlowManager  = new AppStateDataFlowManager(this.props.eventBus, this.props.config, this.props.groupWidth);
    this.dataFlowTimeline = new DataFlowTimeline(this.dataFlowManager, this.props.eventBus);
    this.dataFlowTimeline.options = this.options;
  }
}
