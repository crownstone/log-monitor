import React from "react";
import {Backdrop, Paper} from "@mui/material";
import {CommanderPhaseTimeline} from "./CommanderPhaseTimeline";
import {EventBusClass} from "../util/EventBus";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {CommanderDataFlowManager} from "../logic/DataFlowManager_commanders";

export class CommanderTimeline extends React.Component<{ data: ParseDataResult, eventBus: EventBusClass }, { overlayContent: any | null }> {

  dfTimeline_public:    DataFlowTimeline;
  dfTimeline_private:   DataFlowTimeline;
  dfTimeline_broadcast: DataFlowTimeline;
  dataFlowManager_public:     CommanderDataFlowManager;
  dataFlowManager_private:    CommanderDataFlowManager;
  dataFlowManager_broadcast:  CommanderDataFlowManager;

  constructor(params) {
    super(params);
    this.state = {overlayContent: null};
    this.dataFlowManager_public     = new CommanderDataFlowManager('public');
    this.dataFlowManager_private    = new CommanderDataFlowManager('private');
    this.dataFlowManager_broadcast  = new CommanderDataFlowManager('broadcasters');

    this.dfTimeline_public    = new DataFlowTimeline(this.dataFlowManager_public, this.props.eventBus);
    this.dfTimeline_private   = new DataFlowTimeline(this.dataFlowManager_private, this.props.eventBus);
    this.dfTimeline_broadcast = new DataFlowTimeline(this.dataFlowManager_broadcast, this.props.eventBus);
  }

  componentDidMount() {
    const { viscontainer_public, viscontainer_private, viscontainer_broadcast } = this.refs;

    console.time("PreparingData");
    this.dataFlowManager_public.load(this.props.data);
    this.dataFlowManager_private.load(this.props.data);
    this.dataFlowManager_broadcast.load(this.props.data);
    console.timeEnd("PreparingData");

    console.time("GettingData");
    this.dataFlowManager_public.getAll();
    this.dataFlowManager_private.getAll();
    this.dataFlowManager_broadcast.getAll();
    console.timeEnd("GettingData");


    this.dfTimeline_public.create(viscontainer_public, {cluster: { maxItems: 20 }, showMajorLabels: false, showMinorLabels: false})
    this.dfTimeline_private.create(viscontainer_private, {cluster: { maxItems: 20 }, showMajorLabels: false, showMinorLabels: false})
    this.dfTimeline_broadcast.create(viscontainer_broadcast, {stack: false})

    let clickHandler = (properties) => {
      if (properties.items) {
        if (this.props.data.constellation.commanders[properties.items]?.phases) {
          this.setState({overlayContent: <CommanderPhaseTimeline commanderId={properties.items} data={this.props.data}/>});
        }
      }
    };

    this.dfTimeline_public.on('select', clickHandler);
    this.dfTimeline_private.on('select', clickHandler);
    this.dfTimeline_broadcast.on('select', clickHandler);
  }

  componentWillUnmount() {
    this.dataFlowManager_public.destroy();
    this.dataFlowManager_private.destroy();
    this.dataFlowManager_broadcast.destroy();

    this.dfTimeline_public.destroy();
    this.dfTimeline_private.destroy();
    this.dfTimeline_broadcast.destroy();
  }

  render() {
    return (
      <div style={{width:'100%',height:'100%', maxHeight: '100vh'}}>
        <div ref={'viscontainer_public'}    />
        <div ref={'viscontainer_private'}   />
        <div ref={'viscontainer_broadcast'} />
        <Backdrop open={this.state.overlayContent !== null} style={{zIndex:99999}} onClick={() => { this.setState({overlayContent: null})}}>
          <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '90vw'}} onClick={(event) => { event.stopPropagation() }}>{ this.state.overlayContent }</Paper>
        </Backdrop>
      </div>
    );
  }
}
