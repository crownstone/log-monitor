import React from "react";
import { GetStaticProps } from 'next'
import * as vis from 'vis'
import {parseConsumerAppFileByLine} from "../parsers/base";
import {SessionPhases} from "../parsers/app/parsers/ConstellationParser";
import {Backdrop, Card, ClickAwayListener, Paper} from "@mui/material";

export const getStaticProps: GetStaticProps = async (context) => {
  console.time("Parsing")
  let result = {};
  await parseConsumerAppFileByLine('Alex','2021-10-23', result)
  console.timeEnd("Parsing")
  return {
    props: {title:"Constellation", data: result},
  }
}

export default class Experiment extends React.Component<{ data: any, statistics: any }, { overlayContent: any | null }> {

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
    console.log("PreparingData")
    // console.log(this.props.data)

    let items = [];
    let session;
    let total = 0;
    let constellation = this.props.data.constellation;
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
        console.log("executed command")
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

      if (total > 1000) {
        lastT = Math.max(session.tEnd, lastT);
        console.log("Stopped prematurely.", new Date(lastT))
        break;
      }
    }


    // Create a DataSet (allows two way data-binding)
    this.itemsDataset = new vis.DataSet(items);

    this.groupsDataset = new vis.DataSet(Object.values(groups));

    // Configuration for the Timeline
    var options = {
      stack: false
    };

    console.log("prepared")
    // Create a Timeline
    this.timeline = new vis.Timeline(viscontainer, this.itemsDataset, this.groupsDataset, options);
    if (lastT > 0) {
      this.timeline.addCustomTime(new Date(lastT), 'lastT');
    }
    this.timeline.on('select', (properties) => {
      if (properties.items) {
        this.setState({overlayContent: <SessionTimeline data={constellation.sessions[properties.items].phases} /> });
      }
    });
    console.log("Connecting Count", connectingCount)
    console.log("Connected Count", connectCount)
  }

  render() {
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <div ref={'viscontainer'} />
        <Backdrop open={this.state.overlayContent !== null} style={{zIndex:99999}} onClick={() => { this.setState({overlayContent: null})}}>
          <Paper style={{maxHeight: '90vh', overflow:'auto', padding:20, width: '60vw'}}>{ this.state.overlayContent }</Paper>
        </Backdrop>
      </div>
    );
  }

}

class SessionTimeline extends React.Component<{ data: any[] }, any> {

  timeline;
  itemsDataset = null;
  groupsDataset = null;


  componentDidMount() {
    const { viscontainer } = this.refs;
    let items = [];
    for (let phase of this.props.data) {
      let label = phase.label;
      console.log(phase)
      if (phase.data.error) {
        label += " " + phase.data.error
      }

      items.push({start: new Date(phase.time), content: label});
    }


    console.log(items)

    // Create a DataSet (allows two way data-binding)
    this.itemsDataset = new vis.DataSet(items);

    this.groupsDataset = new vis.DataSet();

    // Configuration for the Timeline
    var options = {
      // stack: false
      height: '400px'
    };

    // Create a Timeline
    this.timeline = new vis.Timeline(viscontainer, this.itemsDataset, options);
  }

  render() {
    return (
      <div style={{width:'100%', height: 400}}>
        <div ref={'viscontainer'} />
      </div>
    );
  }
}