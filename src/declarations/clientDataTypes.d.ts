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

interface NotificationConfig extends DataFlowConfig  {
}

interface BluenetPromiseConfig extends DataFlowConfig  {
  dataflow?: {
    showRoomLocalization?:    boolean,
    showSphereLocalization?:  boolean,
    showCancelledConnections: boolean
  }
}