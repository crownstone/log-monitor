import React from "react";
import {BluenetPromiseCountDataFlowManager} from "../../logic/DataFlowManager_bluenetPromiseCount";
import {DataFlowGraph} from "./DataFlowGraph";
import {Graph} from "./base/Graph";

export class BluenetPromiseCountGraph extends Graph<BluenetPromiseConfig> {

  dataFlowGraph: DataFlowGraph;
  dataFlowManager: BluenetPromiseCountDataFlowManager;
  unsubscribe = [];

  constructor(props) {
    super(props);
    this.dataFlowManager = new BluenetPromiseCountDataFlowManager(this.props.eventBus, this.props.config);
    this.dataFlowGraph = new DataFlowGraph(this.dataFlowManager, this.props.eventBus);
  }
}
