interface DataFlowOptions {
  showRoomLocalization?:   boolean,
  showSphereLocalization?: boolean,
}



interface DataFlowConfig {
  dataflow?: DataFlowOptions
}

interface ConstellationConfig extends DataFlowConfig {
}

interface CloudConfig extends DataFlowConfig  {
}