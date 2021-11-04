import React from "react";
import * as vis from "vis-timeline/standalone/umd/vis-timeline-graph2d";
import {TimelineOptions} from "vis-timeline/types";
import {getGroupName} from "../parsers/util";
import {CommandPhases, SessionBrokerPhases, SessionManagerPhases} from "../parsers/app/ConstellationParser";

const COMMANDER_GROUP = "Commander";

export class CommanderPhaseTimeline extends React.Component<{ data: ParseDataResult, commanderId }, any> {

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
    let constellation = this.props.data.constellation;
    let commanders = constellation.commanders;
    let commander = commanders[this.props.commanderId];
    let phases = commanders[this.props.commanderId].phases;
    let commands = constellation.commands;
    let nameMap = this.props.data.nameMap;

    let groups = {};
    groups[COMMANDER_GROUP] = {id:COMMANDER_GROUP, content:"Commander", style:'width: 300px'};

    let sessionBrokerItems = {}
    let commanderSingularEvents = {}
    for (let phase of phases) {
     let handle = phase?.data?.handle ?? null;
      if (handle) {
        let groupName = getGroupName(nameMap, handle);
        groups[groupName] = {id: groupName, content: groupName, style:'width: 300px'};
        // items.push({start: new Date(phase.time), content: phase.label, group: groupName});

        if (sessionBrokerItems[handle] === undefined) {
          sessionBrokerItems[handle] = {startT: Infinity, endT: -Infinity, properties: {}, phases:[], group: groupName};
        }
        sessionBrokerItems[handle].startT = Math.min(phase.time, sessionBrokerItems[handle].startT);
        sessionBrokerItems[handle].endT   = Math.max(phase.time, sessionBrokerItems[handle].endT);
        sessionBrokerItems[handle].phases.push({start: phase.time, content: phase.label});
        sessionBrokerItems[handle].properties[phase.label] = phase;
      }
      else {
        if (phase.data.commandType) {
          items.push({start: phase.time, content: phase.label + "<br/>" + phase.data.commandType, group: COMMANDER_GROUP});
        }
        else if (phase.data.commandId) {
          let command = constellation.commands[phase.data.commandId];
          let commandType = command.data.command.type;
          items.push({start: phase.time, content: phase.label + "<br/>" + commandType, group: COMMANDER_GROUP});
        }
        else {
          items.push({start: phase.time, content: phase.label, group: COMMANDER_GROUP});
        }
      }
      //
      // let label = phase.label;
      // if (phase.commandId) {
      //   label += "<br/>" + commands[phase.commandId].data.command.type + " to <br />" + getGroupName(this.props.data.nameMap, phase.data.handle);
      // }
      startT = Math.min(startT, phase.time);
      endT   = Math.max(endT,   phase.time);
    }

    for (let handle in sessionBrokerItems) {
      let handleData = sessionBrokerItems[handle];
      let className = "unconnected";
      if (handleData.properties[SessionBrokerPhases.connected]) {
        className = "connected";
      }
      if (handleData.properties[SessionBrokerPhases.revoke]) {
        commanderSingularEvents["SESSION_REVOKE"] = {
          start: handleData.properties[SessionBrokerPhases.revoke].time,
          group: COMMANDER_GROUP,
          className: className,
          content:"SESSION_REVOKE"
        }
      }
      if (handleData.properties[CommandPhases.performing]) {
        className = "performingCommand";
      }
      if (handleData.properties[CommandPhases.succeeded]) {
        className = "performedCommandSuccess";
      }
      if (handleData.properties[CommandPhases.failed]) {
        className = "performedCommandFailed";
      }
      if (handleData.properties[CommandPhases.duplicate]) {
        className = "performedCommandFailed";
      }
      if (handleData.properties[SessionManagerPhases.sessionTimeout]) {
        className = "TIMEOUT";
        commanderSingularEvents["SESSION_TIMEOUT"] = {
          start: handleData.properties[SessionManagerPhases.sessionTimeout].time,
          group: COMMANDER_GROUP,
          className: className,
          content:"SESSION_TIMEOUT"
        }
      }

      items.push({start: handleData.startT, end: handleData.endT, group: handleData.group, className: className});
    }

    for (let event in commanderSingularEvents) {
      items.push(commanderSingularEvents[event]);
    }

    // Create a DataSet (allows two way data-binding)
    this.itemsDataset = new vis.DataSet(items);
    this.groupsDataset = new vis.DataSet(Object.values(groups));

    // Configuration for the Timeline
    let range = endT - startT;
    let options : TimelineOptions = {
      start: startT - 0.1*range,
      end: endT + 0.1*range,
      cluster: {
        maxItems: 10
      },
      // stack: false
      // height: '600px'
    };

    // Create a Timeline
    this.timeline = new vis.Timeline(viscontainer as HTMLElement, this.itemsDataset, this.groupsDataset, options);
  }

  render() {
    return (
      <div style={{position:'relative', width:'100%', height: 2000}}>
        <h3>{this.props.commanderId}</h3>
        <div ref={'viscontainer'} />
      </div>
    );
  }
}