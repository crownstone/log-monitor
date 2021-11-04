import React from "react";
import {Backdrop, Paper} from "@mui/material";
import {CommanderPhaseTimeline} from "./CommanderPhaseTimeline";
import {EventBusClass} from "../util/EventBus";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {CommanderDataFlowManager} from "../logic/DataFlowManager_commanders";

export class CommanderTimeline extends React.Component<{ data: ParseDataResult, eventBus: EventBusClass }, { overlayContent: any | null }> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: CommanderDataFlowManager;

  constructor(params) {
    super(params);
    this.state = {overlayContent: null};
    this.dataFlowManager = new CommanderDataFlowManager();
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
    let options = {
      minHeight: 600,
      cluster: { maxItems: 20 },
    };

    this.dataFlowTimeline.create(viscontainer, options)
    this.dataFlowTimeline.on('select', (properties) => {
      if (properties.items) {
        if (this.props.data.constellation.commanders[properties.items]?.phases) {
          this.setState({overlayContent: <CommanderPhaseTimeline commanderId={properties.items} data={this.props.data}/>});
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
      <div style={{width:'100%',height:'100%', maxHeight: '100vh'}}>
        <div ref={'viscontainer'} />
        <Backdrop open={this.state.overlayContent !== null} style={{zIndex:99999}} onClick={() => { this.setState({overlayContent: null})}}>
          <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '90vw'}} onClick={(event) => { event.stopPropagation() }}>{ this.state.overlayContent }</Paper>
        </Backdrop>
      </div>
    );
  }
}
