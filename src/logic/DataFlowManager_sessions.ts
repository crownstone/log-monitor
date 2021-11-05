import {SessionPhases} from "../parsers/app/ConstellationParser";
import {getGroupName} from "../parsers/util";
import {DataFlowManagerEvents} from "./DataFlowManager_events";

type SessionType = "unconnected" | "connecting" | "connectingFailed" | "connected" | "commandExecuted" | "ERROR"

export class SessionDataFlowManager extends DataFlowManagerEvents {

  itemThreshold = 1000;
  priority = [
    "ERROR",
    "connectingFailed",
    "commandExecuted",
    "connected",
    "connecting",
    "unconnected",
  ]

  loadSpecificData(data: ParseDataResult) {
    let session;
    let constellation = data?.constellation;
    let sessions = constellation?.sessions;
    let nameMap = data?.nameMap;
    let groups = {}

    if (sessions) {
      for (let sessionId in sessions) {
        session = sessions[sessionId];
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
    }

    this.loadReboots(data);
    this.loadStartEndTimes(data);

    this.groupDataSet.add(Object.values(groups));
  }

}