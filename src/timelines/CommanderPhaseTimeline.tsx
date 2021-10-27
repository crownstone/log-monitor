import React from "react";
import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {TimelineOptions} from "vis-timeline/types";


export class CommanderPhaseTimeline extends React.Component<{ data: any }, any> {

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
    let phases = this.props.data.phases;
    let commands = this.props.data.commands;
    for (let phase of phases) {
      let label = phase.label;
      if (phase.commandId) {
        label += "<br/>" + commands[phase.commandId].data.command.type + " to <br />" + phase.data.handle;
      }
      startT = Math.min(startT, phase.time);
      endT = Math.max(endT, phase.time);
      items.push({start: new Date(phase.time), content: label});
    }

    // Create a DataSet (allows two way data-binding)
    this.itemsDataset = new vis.DataSet(items);

    this.groupsDataset = new vis.DataSet();

    // Configuration for the Timeline
    var options : TimelineOptions = {
      start: startT - 1000,
      end: endT + 1000,
      cluster: {
        maxItems: 10
      },
      // stack: false
      height: '600px'
    };

    if (items.length > 20) {
      options = {...options, start: new Date(startT-1000), end: new Date(Math.min(startT + 10000, endT+ 1000))}
    }

    // Create a Timeline
    this.timeline = new vis.Timeline(viscontainer as HTMLElement, this.itemsDataset, options);
  }

  render() {
    return (
      <div style={{position:'relative', width:'100%', height: 600}}>
        <div ref={'viscontainer'} />
      </div>
    );
  }
}