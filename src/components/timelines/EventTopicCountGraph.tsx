import React from "react";
import {DataFlowGraph} from "./DataFlowGraph";
import {Graph} from "./base/Graph";
import {EventsTopicsDataFlowManager} from "../../logic/DataFlowManager_eventsTopics";

export class EventTopicCountGraph extends Graph<EventsConfig> {

  dataFlowGraph:   DataFlowGraph;
  dataFlowManager: EventsTopicsDataFlowManager;
  unsubscribe = [];

  constructor(props) {
    super(props);
    this.dataFlowManager = new EventsTopicsDataFlowManager(this.props.eventBus, this.props.config, this.props.bus);
    this.dataFlowGraph   = new DataFlowGraph(this.dataFlowManager, this.props.eventBus);
  }
}
