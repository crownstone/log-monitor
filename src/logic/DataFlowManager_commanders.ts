import {DataFlowManagerBase} from "./DataFlowManagerBase";

const COMMANDER_GROUP = "Commander";


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


    groups['commanders'] = {id: 'commanders', content:'commanders',      subgroupStack: false, style:'width: 300px'}
    groups['broadcasters'] = {id: 'broadcasters', content:'broadcasters', subgroupStack: true, style:'width: 300px'}

    for (let commanderId in constellation.commanders) {
      commander = constellation.commanders[commanderId];
      let type = "commanders";
      if (commander.phases.length === 2) {
        type = "broadcasters";
      }

      if (!this.rangeDataGroups[type]) {
        this.rangeDataGroups[type] = [];
      }

      this.rangeDataGroups[type].push({
        id: commanderId,
        start: commander.tStart,
        end: commander.tEnd,
        content:commander.phases[1].data.commandType,
        group: type
      });

      this.startTime = Math.min(this.startTime, commander.tStart);
      this.endTime = Math.max(this.endTime, commander.tEnd);
    }

    this.eventDataGroups['reboots'] = [];
    for (let reboot of reboots) {
      let markerId = 'reboot' + reboot[1];
      this.eventDataGroups['reboots'].push({id: markerId, time: reboot[0], content: 'Reboot'})
    }


    this.groupDataSet.add(Object.values(groups));
  }

}