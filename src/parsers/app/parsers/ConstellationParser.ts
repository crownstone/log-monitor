import {BaseParser} from "./BaseParser";

/**
 * Sessions are tracked by:
 * - requested (commanderId, private, (check for stillRequired))
 * - claimed
 * - created
 * - connecting
 * - connected
 * - command X
 * - command X
 * - kill Requested
 * - disconnecting
 * - closing commands performed
 * - disconnect done
 * - disconnect event received
 * - session has ended
 */


/**
 * Commands will be tracked by:
 * - Creation (with full details)
 * - Duplicate failing
 * - Execution
 *  - success
 *  - failure
 * - removal
 */

// Commander tracking
/**
 * Commanders are tracked by:
 * - creation
 * - requested sessions
 * - created commands
 * - successful sessions
 * - failed sessions
 *    - SESSION_REQUEST_TIMEOUT
 *        could not connect in window
 *    - ALREADY_REQUESTED_TIMEOUT (should not happen!)
 *        duplicate action, this is a bug if it happens.
 *    - REMOVED_FROM_QUEUE
 *        Happens when a requested sessions has timeouted. The session manager will timeout the entire
 *  - killConnectedSessions
 *  - performed commands
 *  - failed commands
 */

export const SessionPhases = {
 created:              'session_created',
 connecting:           'session_connecting',
 connected:            'session_connected',
 connectingFailed:     'session_connectingFailed',
 retryConnection:      'session_retryConnection',
 performCommand:       'session_performCommand',
 performedCommand:     'session_performedCommand',
 interrupted:          'session_interrupted',
 killRequest:          'session_killRequest',
 killCompleted:        'session_killCompleted',
 ended:                'session_ended',
 disconnectingCommand: 'session_disconnectingCommand',
 disconnectingPhone:   'session_disconnectingPhone',
 disconnectPromiseDone: 'disconnectPromiseDone',
 disconnectedRetry:    'session_disconnectedRetry',
 disconnected:         'session_disconnected',
}
export const CommandPhases = {
  created    : 'created',
  performing : 'performing',
  succeeded  : 'succeeded',
  failed     : 'failed',
  duplicate  : 'duplicate',
}

let sessionParsers = [
  {type:'commander',     label:'created',           mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},'commanderId'], regex:/Commander: Created for target",\[*([\w\-,"]*)\W*,"id:","([\w-]*)/},
  {type:'commander',     label:'loadAction',        mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},'commanderId'], regex:/Commander: Loading command",\[*([\w\-,"]*)\W*,"id:","([\w-]*)/},
  {type:'commander',     label:'failure',           mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},'commanderId'], regex:/Commander: Failed to load command",\[*([\w\-,"]*)\W*,"id:","([\w-]*)/},

  {type:'command',       label:CommandPhases.created,    mapping: [{command: (d) => { d = d.replace(/\\/g,''); return JSON.parse(d); }}],  regex:/BleCommandManager: Loading command\W*({.*})"]/},
  {type:'command',       label:CommandPhases.performing, mapping: ['commandType', 'handle', 'commandId'],                                  regex:/BleCommandManager: Performing command\W*(\w*)\W*on\W*([\w-]*)\W*([\w-]*)/},
  {type:'command',       label:CommandPhases.succeeded,  mapping: ['commandType', 'handle', 'commandId'],                                  regex:/BleCommandManager: Succeeded command\W*(\w*)\W*on\W*([\w-]*)\W*([\w-]*)/},
  {type:'command',       label:CommandPhases.failed,     mapping: ['commandType', 'handle', 'error', 'commandId'],                         regex:/BleCommandManager: Something went wrong while performing\W*(\w*)\W*([\w-]*)\W*,([\w-]*)\W*([\w-]*)/},
  {type:'command',       label:CommandPhases.duplicate,  mapping: ['removedCommandId', 'commandId', 'commandType','commandTargetType', 'commanderId'], regex:/BleCommandCleaner: Removed command due to duplicate\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)/},

  {type:'sessionBroker', label: 'requesting',       mapping: ["handle", "commanderId", "privateRequest", "commandType"], regex:/SessionBroker: actually requesting session\W*"([\w-]*)"\W*for\W*([\w-]*).*private\W*(\w*)\W*commandType\W*([\w-]*)/},
  {type:'sessionBroker', label: 'connected',        mapping: ["handle", "commanderId"], regex:/SessionBroker: Session has connected to\W*([\w-]*)\W*for\W*([\w-]*)/,   },
  {type:'sessionBroker', label: 'alreadyConnected', mapping: ["handle", "commanderId"], regex:/SessionBroker: Require session has thrown an ALREADY_REQUESTED_TIMEOUT error\W*([\w-]*)\W*,\W*([\w-]*)\W*/},
  {type:'sessionBroker', label: 'timeout',          mapping: ["handle", "commanderId"], regex:/SessionBroker: Session failed to connect: SESSION_REQUEST_TIMEOUT\W*([\w-]*)\W*for\W*([\w-]*)/},
  {type:'sessionBroker', label: 'removedFromQueue', mapping: ["handle", "commanderId"], regex:/SessionBroker: Session removed from queue\W*([\w-]*)\W*for\W*([\w-]*)/},
  {type:'sessionBroker', label: 'failed',           mapping: ["handle", "commanderId"], regex:/SessionBroker: Failed to request session\W*([\w-]*)\W*for\W*([\w-]*)/},
  {type:'sessionBroker', label: 'revoke',           mapping: ["handle", "commanderId"], regex:/SessionBroker: Revoke session\W*([\w-]*)\W*for\W*([\w-]*)/},

  {type:'session', label: SessionPhases.created,              mapping:['handle','sessionId'],    regex:/Session: Creating session\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.connecting,           mapping:['handle','sessionId'],    regex:/Session: Start connecting to\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.connected,            mapping:['handle','sessionId'],    regex:/Session: Connected to\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.connectingFailed,     mapping:['error','handle','sessionId','killedFlag'],  regex:/Session: Failed to connect\W*([^,]*)","([\w-]*)\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.retryConnection,      mapping:['handle','sessionId'],    regex:/Session: Reinitializing the bootstrapper to reactivate the session\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.performCommand,       mapping:['commandId', 'handle','sessionId'],    regex:/Session: performing available command\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.performedCommand,     mapping:['commandId', 'handle','sessionId'],    regex:/Session: Finished available command\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.interrupted,          mapping:['handle','sessionId'],    regex:/Session: Session interrupted\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.killRequest,          mapping: ["state", "handle", "sessionId"],  regex:/Session: killing session requested...\W*(\w*)\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.killCompleted,        mapping: ["handle", "sessionId"],  regex:/Session: killing session completed\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.ended,                mapping: ["handle", "sessionId"],  regex:/Session: Session has ended\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectingCommand, mapping: ["handle", "sessionId"],  regex:/Session: telling the Crownstone to disconnect\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectingPhone,   mapping: ["handle", "sessionId"],  regex:/Session: disconnecting from phone\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectPromiseDone,mapping: ["handle", "sessionId"],  regex:/Session: disconnect done\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectedRetry,    mapping: ["handle", "sessionId"],  regex:/Session: Disconnected from Crownstone, Ready for reconnect\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnected,         mapping: ["handle", "sessionId"],  regex:/Session: Disconnected from Crownstone, ending session\W*([\w-]*)\W*([\w-]*)/},
];



class SessionCollector {

  data : SessionData = {}

  collect(item, parser, parseResult: any) {
    if (parseResult.sessionId) {
      if (this.data[parseResult.sessionId] === undefined) {
        this.data[parseResult.sessionId] = {tStart: item[0], tEnd: item[0], handle: parseResult.handle, phases:[], properties:{}};
      }

      this.data[parseResult.sessionId].tStart = Math.min(this.data[parseResult.sessionId].tStart, item[0])
      this.data[parseResult.sessionId].tEnd   = Math.max(this.data[parseResult.sessionId].tEnd, item[0])
      this.data[parseResult.sessionId].phases.push({time: item[0], label: parser.label, data: parseResult})
      this.data[parseResult.sessionId].properties[parser.label] = parseResult;
    }
  }
}



class CommanderCollector {

  commanderData : CommanderData = {}
  handleMap : HandleToCommandMap = {}
  commandId2CommanderIdMap : CommandIdToCommanderIdMap = {}
  commandId2CommandMap : CommandIdToCommandMap = {}
  commandData : CommandData = {};

  collect(item, parser, parseResult: any) {
    if (parseResult.commanderId) {
      if (this.commanderData[parseResult.commanderId] === undefined) {
        this.commanderData[parseResult.commanderId] = { tStart: item[0], tEnd: item[0], targets: {}, commands: {}, phases: [] };
      }
      this.commanderData[parseResult.commanderId].phases.push({ time: item[0], label: parser.label, data:parseResult });
    }

     this.commanderData[parseResult.commanderId].tStart = Math.min( this.commanderData[parseResult.commanderId].tStart, item[0])
     this.commanderData[parseResult.commanderId].tEnd   = Math.max( this.commanderData[parseResult.commanderId].tEnd, item[0])
  }

  collectCommand(item, parser, parseResult) {
    // console.log("command", parser.label, parseResult)
    let command = parseResult.command;

    let commanderId = null;
    let commandId = null;
    // this is the first creation of the command.
    if (command) {
      commanderId = command.commanderId;
      commandId   = command.id;
      
      this.commandId2CommanderIdMap[commandId] = command.commanderId;

      if (this.commanderData[commanderId] === undefined) {
        console.log("Missing commander", commanderId);
        return;
      }
      if (this.commanderData[commanderId].commands[commandId] === undefined) {
        this.commanderData[commanderId].commands[commandId] = {
          data: command,
          phases: [{time: item[0], label: parser.label}],
          properties: {[parser.label]: parseResult}
        };
      }

      if (this.commandData[commandId] === undefined) {
        this.commandData[commandId] = { data: command, phases: [{time: item[0], label: parser.label}], properties: {} }
      }

      if (this.handleMap[command.commandTarget] === undefined) {
        this.handleMap[command.commandTarget] = [];
      }
      this.handleMap[command.commandTarget].push({time: item[0], commandId: commandId})
      this.commandId2CommandMap[commandId] = this.commanderData[commanderId].commands[commandId];
    }

    if (parseResult.commandId) {
      commandId   = parseResult.commandId;
      commanderId = this.commandId2CommanderIdMap[commandId];
      if (this.commanderData[commanderId] === undefined) {
        return;
      }
      this.commanderData[commanderId].phases.push({time:item[0], label: 'command_' + parser.label, commandId: commandId, data: parseResult});
      this.commandData[parseResult.commandId].phases.push({time: item[0], label: parser.label});
    }

    if (commanderId) {
      this.commanderData[commanderId].tStart = Math.min( this.commanderData[commanderId].tStart, item[0]);
      this.commanderData[commanderId].tEnd   = Math.max( this.commanderData[commanderId].tEnd, item[0]);
      if (commandId) {
        this.commanderData[commanderId].commands[commandId].properties[parser.label] = parseResult;
        this.commanderData[commanderId].commands[commandId].phases.push({time:item[0], label: parser.label, data: parseResult});
      }
    }
  }


  collectSessionBroker(item, parser, parseResult) {
    let commanderId = parseResult.commanderId;
    if (commanderId) {
      this.commanderData[commanderId].phases.push({time:item[0], label: 'sessionBroker_' + parser.label, data: parseResult});
      this.commanderData[commanderId].tStart = Math.min( this.commanderData[commanderId].tStart, item[0])
      this.commanderData[commanderId].tEnd   = Math.max( this.commanderData[commanderId].tEnd, item[0])
    }
  }
}


export class ConstellationParser extends BaseParser {

  sessionCollector   = new SessionCollector();
  commanderCollector = new CommanderCollector();

  load(item) {
    for (let parser of sessionParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['constellation'] = {
      sessions:   this.sessionCollector.data,
      commanders: this.commanderCollector.commanderData,
      commands:   this.commanderCollector.commandData,
      maps: {
        commandId2commandMap: this.commanderCollector.commandId2CommandMap,
        handle2commandMap:    this.commanderCollector.handleMap,
      }
    }
  }

  search(item, parser) {
    let regexSearch = item[1].match(parser.regex);
    if (!regexSearch) return false;

    let parseResult = {};
    let index = 1;
    for (let mapData of parser.mapping) {
      if (typeof mapData === 'object') {
        let key = Object.keys(mapData)[0];
        parseResult[key] = mapData[key](regexSearch[index++]);
      }
      else {
        parseResult[mapData] = regexSearch[index++];
      }
    }

    switch (parser.type) {
      case 'session':
        this.sessionCollector.collect(item, parser, parseResult); break;
      case 'commander':
        this.commanderCollector.collect(item, parser, parseResult); break;
      case 'command':
        this.commanderCollector.collectCommand(item, parser, parseResult); break;
      case 'sessioBroker':
        this.commanderCollector.collectSessionBroker(item, parser, parseResult); break;
    }

    return true;
  }
}
