import React from "react";
import {Backdrop, Paper} from "@mui/material";
import {SessionPhaseTimeline} from "./SessionPhaseTimeline";
import {EventBusClass} from "../util/EventBus";
import {SessionDataFlowManager} from "../logic/DataFlowManager_sessions";
import {DataFlowTimeline} from "./DataFlowTimeline";

export class SessionTimeline extends React.Component<{ data: ParseDataResult, eventBus: EventBusClass }, { overlayContent: any | null }> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: SessionDataFlowManager;

  constructor(params) {
    super(params);
    this.state = {overlayContent: null};
    this.dataFlowManager = new SessionDataFlowManager();
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
        if (this.props.data.constellation.sessions[properties.items]?.phases) {
          this.setState({overlayContent: <SessionPhaseTimeline sessionId={properties.items} data={this.props.data.constellation}/>});
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
          <Paper style={{maxHeight: '90vh', overflow:'auto', padding:20, width: '60vw'}} onClick={(event) => { event.stopPropagation() }}>{ this.state.overlayContent }</Paper>
        </Backdrop>
      </div>
    );
  }
}
