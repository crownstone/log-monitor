import {SessionPhases} from "../parsers/app/parsers/ConstellationParser";
import {getGroupName} from "../parsers/util";
import {DataFlowManagerBase} from "./DataFlowManagerBase";

type SessionType = "unconnected" | "connecting" | "connectingFailed" | "connected" | "commandExecuted" | "ERROR"

export class SessionDataFlowManager extends DataFlowManagerBase {

  itemThreshold = 2000;
  priority = [
    "ERROR",
    "connectingFailed",
    "commandExecuted",
    "connected",
    "connecting",
    "unconnected",
  ]

  load(data: ParseDataResult) {
    let session;
    let constellation = data.constellation;
    let reboots = data.reboots;
    let nameMap = data.nameMap;
    let groups = {}

    for (let sessionId in constellation.sessions) {
      session = constellation.sessions[sessionId];
      let type : SessionType = 'unconnected';
      if (session.properties[SessionPhases.connecting]) {
        type = 'connecting';
      }

      if (session.properties[SessionPhases.connectingFailed]) {
        if (session.properties[SessionPhases.connectingFailed].error !== "CONNECTION_CANCELLED") {
          type = 'connectingFailed';
        }
      }

      if (session.properties[SessionPhases.connected]) {
        type = 'connected';
      }

      if (session.properties[SessionPhases.performCommand]) {
        type = 'commandExecuted';
      }

      if (!session.properties[SessionPhases.ended]) {
        type = 'ERROR';
      }

      let groupName = getGroupName(nameMap, session.handle);

      groups[groupName] = {id: groupName, content: groupName, style:'width: 300px'};

      if (!this.rangeDataGroups[type]) {
        this.rangeDataGroups[type] = [];
      }

      this.rangeDataGroups[type].push({id: sessionId, start: session.tStart, end: session.tEnd, group: groupName, className: type});

      this.startTime = Math.min(this.startTime, session.tStart);
      this.endTime = Math.max(this.endTime, session.tEnd);
    }

    this.eventDataGroups['reboots'] = [];
    for (let reboot of reboots) {
      let markerId = 'reboot' + reboot[1];
      this.eventDataGroups['reboots'].push({id: markerId, time: reboot[0], content: 'Reboot'})
    }


    this.groupDataSet.add(Object.values(groups));
  }

}