import React from "react";
import {Backdrop, Paper} from "@mui/material";
import {EventBusClass} from "../../util/EventBus";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {StoreDataFlowManager} from "../../logic/DataFlowManager_store";

export class StoreTimeline extends React.Component<{ data: ParseDataResult, eventBus: EventBusClass, storeDataCallback: (d) => void, config: StoreConfig }, { overlayContent: any | null }> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: StoreDataFlowManager;
  unsubscribe = [];

  constructor(props) {
    super(props);
    this.state = {overlayContent: null};
    this.dataFlowManager = new StoreDataFlowManager(this.props.eventBus, this.props.config);
    this.dataFlowTimeline = new DataFlowTimeline(this.dataFlowManager, this.props.eventBus);
  }

  refreshData() {
    console.time("PreparingData");
    this.dataFlowManager.load(this.props.data);
    console.timeEnd("PreparingData");

    console.time("GettingData");
    this.dataFlowManager.getAll();
    console.timeEnd("GettingData");
  }

  componentDidMount() {
    const { viscontainer } = this.refs;

    this.refreshData();

    // Configuration for the Timeline
    var options = {
      stack: false
    };

    this.dataFlowTimeline.create(viscontainer, options)
    this.dataFlowTimeline.on('select', (properties) => {
      if (properties.items && properties.items.length > 0) {
        let index = properties.items[0].split("____")[1].split(".")[0];
        let subIndex = properties.items[0].split("____")[1].split(".")[1];
        if (this.props.data?.store?.actions?.[index]) {
          if (subIndex) {
            let reply = { action: this.props.data.store.actions[index].action.payload?.[subIndex], batch: this.props.data.store.actions[index]}
            this.props.storeDataCallback(reply)
          }
          else {
            this.props.storeDataCallback({action:this.props.data.store.actions[index]})
          }
        }
      }
    });

    this.unsubscribe.push(this.props.eventBus.on("REFRESH_DATA", () => {
      this.refreshData();
      this.dataFlowTimeline.drawMarkers();
    }));
  }

  componentWillUnmount() {
    this.dataFlowManager.destroy();
    this.dataFlowTimeline.destroy();
    this.unsubscribe.forEach((unsub) => { unsub(); })
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
