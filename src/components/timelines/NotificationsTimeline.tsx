import React from "react";
import {Backdrop, Paper} from "@mui/material";
import {EventBusClass} from "../../util/EventBus";
import {DataFlowTimeline} from "./DataFlowTimeline";
import {NotificationsDataFlowManager} from "../../logic/DataFlowManager_notifications";

export class NotificationsTimeline extends React.Component<{ data: ParseDataResult, eventBus: EventBusClass, countCallback: (d) => void, dataCallback: (d) => void, config: NotificationConfig }, { overlayContent: any | null }> {

  dataFlowTimeline: DataFlowTimeline;
  dataFlowManager: NotificationsDataFlowManager;
  unsubscribe = [];

  constructor(props) {
    super(props);
    this.state = {overlayContent: null};
    this.dataFlowManager = new NotificationsDataFlowManager(this.props.config);
    this.dataFlowTimeline = new DataFlowTimeline(this.dataFlowManager, this.props.eventBus);
  }

  refreshData() {
    console.time("PreparingData");
    this.dataFlowManager.load(this.props.data);
    this.props.countCallback(this.dataFlowManager.count)
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
      if (properties.items) {
        // if (this.props.data?.notifications?.requests?.[properties.items]) {
        //   this.props.dataCallback(this.props.data.notifications.requests[properties.items])
        // }
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
