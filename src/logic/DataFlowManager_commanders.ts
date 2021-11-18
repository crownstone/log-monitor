import {CommandPhases, SessionBrokerPhases, SessionManagerPhases} from "../parsers/app/ConstellationParser";
import {DataFlowManagerEvents} from "./DataFlowManager_events";

export class CommanderDataFlowManager extends DataFlowManagerEvents {

  itemThreshold = 800;
  priority = [
    "public",
    "private",
    "broadcasters",
  ]

  commanderType = null;
  constructor(commanderType: string, options : DataFlowConfig = {}) {
    super(options);
    this.commanderType = commanderType;
  }

  getCommanderType(commander: CommanderData) {
    let commanderType = "public";
    if (commander.data && commander.data.private) {
      commanderType = 'private'
    }
    else if (commander.targets.length > 0 && commander.targets[0] === "BROADCAST") {
      commanderType = 'broadcasters'
    }
    else if (commander.properties[CommandPhases.loadingBroadcast]) {
      commanderType = 'broadcasters';
    }
    return commanderType;
  }

  loadSpecificData(data: ParseDataResult) {
    let commander;
    let groups = {};
    let constellation = data?.constellation;
    let commanders = constellation?.commanders;

    groups[this.commanderType] = {id: this.commanderType, content:this.commanderType, style:'width: 300px'};

    if (commanders) {
      for (let commanderId in commanders) {
        let className = 'connectingFailed';
        commander = commanders[commanderId];
        let commanderType = this.getCommanderType(commander);
        if (this.commanderType !== commanderType) {
          continue;
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

        if (!this.rangeDataGroups[this.commanderType]) {
          this.rangeDataGroups[this.commanderType] = [];
        }

        this.rangeDataGroups[this.commanderType].push({
          id:      commanderId,
          start:   commander.tStart,
          end:     commander.tEnd,
          content: commander.phases[1].data.commandType,
          group:   this.commanderType,
          className
        });

        this.startTime = Math.min(this.startTime, commander.tStart);
        this.endTime   = Math.max(this.endTime,   commander.tEnd);
      }
    }

    this.loadReboots(data);
    this.loadLocalization(data);
    this.loadStartEndTimes(data);

    for (let key in this.rangeDataGroups) {
      this.rangeDataGroups[key].sort((a,b) => { return a.end - b.end})
    }
    this.groupDataSet.add(Object.values(groups));
  }

}
