import React from "react";
import {DataFlowGraph} from "./DataFlowGraph";
import {UptimeDataFlowManager} from "../../logic/DataFlowManager_uptime";
import {Graph} from "./base/Graph";

export class UptimeGraph extends Graph<UptimeConfig> {

  dataFlowGraph: DataFlowGraph;
  dataFlowManager: UptimeDataFlowManager;
  unsubscribe = [];

  constructor(props) {
    super(props);
    this.dataFlowManager = new UptimeDataFlowManager(this.props.eventBus, this.props.config);
    this.dataFlowGraph = new DataFlowGraph(this.dataFlowManager, this.props.eventBus);

    this.options = {
      sampling:false
    }
  }
}
