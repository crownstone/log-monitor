import React from "react";
import {DataFlowGraph} from "./DataFlowGraph";
import {Graph} from "./base/Graph";
import {EventsTotalCountDataFlowManager} from "../../logic/DataFlowManager_eventsTotalCount";

export class EventTotalCountGraph extends Graph<EventsConfig> {

  dataFlowGraph: DataFlowGraph;
  dataFlowManager: EventsTotalCountDataFlowManager;
  unsubscribe = [];

  constructor(props) {
    super(props);
    this.dataFlowManager = new EventsTotalCountDataFlowManager(this.props.eventBus, this.props.config, this.props.bus);
    this.dataFlowGraph   = new DataFlowGraph(this.dataFlowManager, this.props.eventBus);
  }
}
