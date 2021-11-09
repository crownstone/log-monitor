import React from "react";
import {Backdrop, Paper} from "@mui/material";
import {EventBusClass} from "../../util/EventBus";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {CloudDataFlowManager} from "../../logic/DataFlowManager_cloud";

export class CloudTimeline extends React.Component<{ data: ParseDataResult, eventBus: EventBusClass, cloudDataCallback: (d) => void }, { overlayContent: any | null }> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: CloudDataFlowManager;

  constructor(props) {
    super(props);
    this.state = {overlayContent: null};
    this.dataFlowManager = new CloudDataFlowManager();
    this.dataFlowTimeline = new DataFlowTimeline(this.dataFlowManager, this.props.eventBus);
  }

  componentDidMount() {
    const { viscontainer } = this.refs;

    console.time("PreparingData");
    this.dataFlowManager.load(this.props.data);
    console.timeEnd("PreparingData");

    console.time("GettingData");
    this.dataFlowManager.getAll();
    console.timeEnd("GettingData");

    // Configuration for the Timeline
    var options = {
      stack: false
    };

    this.dataFlowTimeline.create(viscontainer, options)
    this.dataFlowTimeline.on('select', (properties) => {
      if (properties.items) {
        if (this.props.data?.cloud?.requests?.[properties.items]) {
          this.props.cloudDataCallback(this.props.data.cloud.requests[properties.items])
        }
      }
    });
  }

  componentWillUnmount() {
    this.dataFlowManager.destroy();
    this.dataFlowTimeline.destroy();
  }


  render() {
    return (
      <div style={{width:'100%'}}>
        <div ref={'viscontainer'} />
        <Backdrop open={this.state.overlayContent !== null} style={{zIndex:99999}} onClick={() => { this.setState({overlayContent: null})}}>
          <Paper style={{maxHeight: '90vh', overflow:'auto', padding:20, width: '80vw'}} onClick={(event) => { event.stopPropagation() }}>{ this.state.overlayContent }</Paper>
        </Backdrop>
      </div>
    );
  }
}
