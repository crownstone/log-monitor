import React from "react";
import {SessionPhases} from "../parsers/app/parsers/ConstellationParser";
import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {SessionPhaseTimeline} from "./SessionPhaseTimeline";
import {Backdrop, Paper} from "@mui/material";

export class SessionTimeline extends React.Component<{ data: any }, { overlayContent: any | null }> {

  timeline;

  itemsDataset = null;
  groupsDataset = null;

  constructor(params) {
    super(params);
    this.state = {overlayContent: null};
    // console.log(this.props.data)
  }

  componentDidMount() {
    const { viscontainer } = this.refs;
    console.time("PreparingData")
    // console.log(this.props.data)

    let items = [];
    let session;
    let total = 0;
    let constellation = this.props.data.constellation;
    let reboots = this.props.data.reboots;
    let nameMap = this.props.data.nameMap;
    let groups = {};

    let viewMap = {
      unconnected:      false,
      connecting:       false,
      connectingFailed: true,
      connected:        true,
      commandExecuted:  true,
      ERROR:            true,
    }

    let lastT = 0
    let connectCount = 0;
    let connectingCount = 0;

    for (let sessionId in constellation.sessions) {
      session = constellation.sessions[sessionId];
      let className = 'unconnected';
      if (session.properties[SessionPhases.connecting]) {
        className = 'connecting';
        connectingCount++;
      }
      if (session.properties[SessionPhases.connectingFailed]) {
        if (session.properties[SessionPhases.connectingFailed].error !== "CONNECTION_CANCELLED") {
          className = 'connectingFailed';
        }
      }
      if (session.properties[SessionPhases.connected]) {
        className = 'connected';
        connectCount++;
      }
      if (session.properties[SessionPhases.performCommand]) {
        className = 'commandExecuted'
      }
      if (!session.properties[SessionPhases.ended]) {
        className = 'ERROR'
      }

      groups[session.handle] = {id: session.handle, content: session.handle};
      if (viewMap[className] === false) {
        continue;
      }


      items.push({id: sessionId, start: session.tStart, end: session.tEnd, group: session.handle, className: className});
      total++;

      if (total > 10000) {
        lastT = Math.max(session.tEnd, lastT);
        console.log("Stopped prematurely.", new Date(lastT))
        break;
      }
    }

    console.timeEnd("PreparingData")
    console.time("Loading")

    // Create a DataSet (allows two way data-binding)
    this.itemsDataset = new vis.DataSet(items);
    this.groupsDataset = new vis.DataSet(Object.values(groups));

    // Configuration for the Timeline
    var options = {
      stack: false
    };

    console.timeEnd("Loading")
    // Create a Timeline
    console.time("Initializing")
    this.timeline = new vis.Timeline(viscontainer as HTMLElement, this.itemsDataset, this.groupsDataset, options);
    console.timeEnd("Initializing")
    if (lastT > 0) {
      let markerId = 'ABORT_MARKER';
      this.timeline.addCustomTime(new Date(lastT),markerId, false);
      this.timeline.setCustomTimeMarker("Stopped drawing new items.",markerId, false);
    }
    for (let reboot of reboots) {
      let markerId = 'reboot' + reboot[1];
      this.timeline.addCustomTime(new Date(reboot[0]), markerId, false);
      this.timeline.setCustomTimeMarker("Reboot",markerId, false);
    }
    this.timeline.on('select', (properties) => {
      if (properties.items) {
        if (constellation.sessions[properties.items]?.phases) {
          this.setState({overlayContent: <SessionPhaseTimeline data={constellation.sessions[properties.items].phases}/>});
        }
      }
    });
    console.log("Connecting Count", connectingCount)
    console.log("Connected Count", connectCount)
  }

  render() {
    return (
      <div style={{width:'100%',height:'100%'}}>
        <div ref={'viscontainer'} />
        <Backdrop open={this.state.overlayContent !== null} style={{zIndex:99999}} onClick={() => { this.setState({overlayContent: null})}}>
          <Paper style={{maxHeight: '90vh', overflow:'auto', padding:20, width: '60vw'}} onClick={(event) => { event.stopPropagation() }}>{ this.state.overlayContent }</Paper>
        </Backdrop>
      </div>
    );
  }
}
