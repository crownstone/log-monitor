import {DataFlowManagerBase} from "./DataFlowManagerBase";
import {CommandPhases, SessionBrokerPhases, SessionManagerPhases} from "../parsers/app/ConstellationParser";

export class CommanderDataFlowManager extends DataFlowManagerBase {

  itemThreshold = 2000;
  priority = [
    "commanders",
    "broadcasters",
  ]

  load(data: ParseDataResult) {
    let commander;
    let groups = {};
    let constellation = data.constellation;
    let reboots = data.reboots;
    let localization = data.localization;

    groups['commanders']   = {id: 'commanders',   content:'commanders',   subgroupStack: false, style:'width: 300px'};
    groups['broadcasters'] = {id: 'broadcasters', content:'broadcasters', subgroupStack: true,  style:'width: 300px', cluster:false};
    groups['private']      = {id: 'private',      content:'private',      subgroupStack: true,  style:'width: 300px', cluster:false};

    for (let commanderId in constellation.commanders) {
      let className = 'unconnected';
      commander = constellation.commanders[commanderId];
      let commanderType = "commanders";

      if (commander.data.private) {
        commanderType = 'private'
      }
      else if (commander.targets.length > 0 && commander.targets[0] === "BROADCAST") {
        commanderType = 'broadcasters'
      }
      else if (commander.properties[CommandPhases.loadingBroadcast]) {
        commanderType = 'broadcasters';
      }

      if (!this.rangeDataGroups[commanderType]) {
        this.rangeDataGroups[commanderType] = [];
      }

      if (commander.properties[SessionManagerPhases.sessionTimeout]) {
        className = 'TIMEOUT'
      }
      else if (commander.properties[SessionBrokerPhases.success] || commander.properties[CommandPhases.broadcastSuccess]) {
        className = 'performedCommandSuccess'
      }
      else if (commander.properties[CommandPhases.duplicate] || commander.properties[CommandPhases.broadcastDuplicate]) {
        className = 'duplicateCommand'
      }
      else if (commander.properties[CommandPhases.broadcastError]) {
        className = 'performedCommandFailed'
      }


      this.rangeDataGroups[commanderType].push({
        id:      commanderId,
        start:   commander.tStart,
        end:     commander.tEnd,
        content: commander.phases[1].data.commandType,
        group:   commanderType,
        className
      });

      this.startTime = Math.min(this.startTime, commander.tStart);
      this.endTime   = Math.max(this.endTime,   commander.tEnd);
    }

    this.eventDataGroups['reboots'] = [];
    for (let reboot of reboots) {
      let markerId = 'reboot' + reboot[1];
      this.eventDataGroups['reboots'].push({id: markerId, time: reboot[0], content: 'Reboot'})
    }

    this.eventDataGroups['localization'] = [];
    let localizationCount = 0;
    for (let localizationData of localization.locations) {
      let markerId = 'localization' + localizationCount++;
      let locationName = data.nameMap?.locationIdMap?.[localizationData.data.locationId]?.name || localizationData.data.locationId;
      this.eventDataGroups['localization'].push({id: markerId, time: localizationData.time, content: locationName})
    }
    for (let localizationData of localization.spheres) {
      let markerId = 'sphere' + localizationCount++;
      let sphereName = data.nameMap?.sphereIdMap?.[localizationData.data.sphereId]?.name || localizationData.data.sphereId;
      this.eventDataGroups['localization'].push({id: markerId, time: localizationData.time, content: localizationData.label + "<br/>" + sphereName})
    }


    this.groupDataSet.add(Object.values(groups));
  }

}