import React from "react";
import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {TimelineOptions} from "vis-timeline/types";
import {CommandPhases, SessionPhases} from "../parsers/app/parsers/ConstellationParser";


export class SessionPhaseTimeline extends React.Component<{ data: ConstellationParseResult, sessionId }, any> {

  timeline;
  itemsDataset = null;
  groupsDataset = null;

  componentDidMount() {
    this.init()
  }

  init() {
    const { viscontainer } = this.refs;
    let items = [];
    let startT = Infinity;
    let endT = -Infinity;

    let constellation = this.props.data;
    let sessions = constellation.sessions;
    let phases = sessions[this.props.sessionId].phases;
    let className;
    for (let phase of phases) {
      className = 'phase';
      let label = phase.label.replace("session_", "");

      if (phase.data.error) {
        label += "<br/>" + phase.data.error
      }


      if (phase.data.commandId) {
        let command = this.props.data.maps.commandId2commandMap[phase.data.commandId];
        label += "<br/>" + command.data.command.type;

        if (command.properties[CommandPhases.succeeded]) {
          className = 'performedCommandSuccess';
        }
        else if (command.properties[CommandPhases.failed]) {
          className = 'performedCommandFailed';
        }

        console.log(command)
      }


      startT = Math.min(startT, phase.time);
      endT = Math.max(endT, phase.time);
      items.push({start: new Date(phase.time), content: label, className: className});
    }

    // Create a DataSet (allows two way data-binding)
    this.itemsDataset = new vis.DataSet(items);
    this.groupsDataset = new vis.DataSet();

    // Configuration for the Timeline
    let range = endT - startT;
    let options : TimelineOptions = {
      start: startT - 0.1*range,
      end: endT + 0.1*range,
      cluster: {
        maxItems: 10
      },
      // stack: false
      minHeight: '600px',
      maxHeight: '800px',
    };

    if (items.length > 20) {
      options = {...options, start: new Date(startT-1000), end: new Date(Math.min(startT + 10000, endT+ 1000))}
    }

    // Create a Timeline
    this.timeline = new vis.Timeline(viscontainer as HTMLElement, this.itemsDataset, options);
  }

  render() {
    let constellation = this.props.data;
    let sessions = constellation.sessions;
    let session = sessions[this.props.sessionId]

    return (
      <div style={{position:'relative', width:'100%', minHeight: 800}}>
        <h3>{session.handle}:{this.props.sessionId}</h3>
        <div ref={'viscontainer'} />
      </div>
    );
  }
}