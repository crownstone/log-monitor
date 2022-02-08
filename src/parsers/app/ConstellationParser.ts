import {BaseParser, fromJSON} from "./BaseParser";

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
 created:               'session_created',
 connecting:            'session_connecting',
 connected:             'session_connected',
 connectingFailed:      'session_connectingFailed',
 retryConnection:       'session_retryConnection',
 performCommand:        'session_performCommand',
 performedCommand:      'session_performedCommand',
 interrupted:           'session_interrupted',
 killRequest:           'session_killRequest',
 killCompleted:         'session_killCompleted',
 ended:                 'session_ended',
 disconnectingCommand:  'session_disconnectingCommand',
 disconnectingPhone:    'session_disconnectingPhone',
 disconnectPromiseDone: 'session_disconnectPromiseDone',
 disconnectedRetry:     'session_disconnectedRetry',
 disconnected:          'session_disconnected',
}
export const CommandPhases = {
  created    : 'command_created',
  performing : 'command_performing',
  succeeded  : 'command_succeeded',
  failed     : 'command_failed',
  duplicate  : 'command_duplicate',
  loadingBroadcast    : 'command_loading_broadcast',
  broadcastDelayed    : 'command_delayed_broadcast',
  broadcastDuplicate  : 'command_cancelled_broadcast_duplicate',
  broadcastStart      : 'command_broadcast_started',
  broadcastSuccess    : 'command_broadcast_success',
  broadcastError      : 'command_broadcast_error',
}

export const SessionBrokerPhases = {
 requesting:       "sessionBroker_requesting",
 connected:        "sessionBroker_connected",
 alreadyConnected: "sessionBroker_alreadyConnected",
 timeout:          "sessionBroker_timeout",
 removedFromQueue: "sessionBroker_removedFromQueue",
 failed:           "sessionBroker_failed",
 revoke:           "sessionBroker_revoke",
 success:          "sessionBroker_success",
}
export const SessionManagerPhases = {
 sessionTimeout:   "sessionManager_sessionTimeout",
}

export const sessionParsers : parserData[] = [
  {type:'commander',     label:'created',                             mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},{commanderOptions: fromJSON}], regex:/Commander: Created for target\W*\[\W([\w\-,]*)[\W\]]*options: ({.*}*)/},
  {type:'commander',     label:'loadAction',                          mapping: ['commandType','allowMeshRelays','commanderId'], regex:/Commander: Loading command\W*(\S*)\W*([\w]*)\W*id:\W*(\S*)/},
  {type:'commander',     label:'failure',                             mapping: ['errorMessage','commanderId'], regex:/Commander: Failed to load command\W*([\w]*)\W*id:\W*(\S*)/},

  {type:'command',       label:CommandPhases.created,                 mapping: [{command: fromJSON}],                                                   regex:/BleCommandManager: Loading command\W*({.*})/},
  {type:'command',       label:CommandPhases.performing,              mapping: ['commandType', 'handle', 'commandId'],                                  regex:/BleCommandManager: Performing command\W*(\w*)\W*on\W*(\S*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.succeeded,               mapping: ['commandType', 'handle', 'commandId'],                                  regex:/BleCommandManager: Succeeded command\W*(\w*)\W*on\W*(\S*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.failed,                  mapping: ['commandType', 'handle', 'error', 'commandId'],                         regex:/BleCommandManager: Something went wrong while performing\W*(\w*)\W*(\S*)\W*(.*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.duplicate,               mapping: ['commandId', 'removedByCommandId', 'commandType','commandTargetType', 'commanderId'], regex:/BleCommandCleaner: Removed command due to duplicate\W*(\S*)\W*(\S*)\W*(\S*)\W*(\S*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.loadingBroadcast,        mapping: [{command: fromJSON}], regex:/BroadcastCommandManager: Loading command for broadcast\W*({.*})/},
  {type:'command',       label:CommandPhases.broadcastDelayed,        mapping: ['commandType','commandId'], regex:/BroadcastCommandManager: Scheduling broadcast for later\W*([\w]*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.broadcastDuplicate,      mapping: ['commandType','commandId'], regex:/BroadcastCommandManager: Remove item from duplicate queue[\W\d]*(\w*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.broadcastStart,          mapping: ['commandType','commandId'], regex:/BroadcastCommandManager: broadcasting\W*(\w*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.broadcastSuccess,        mapping: ['commandType','commandId'], regex:/BroadcastCommandManager: Successfully broadcast\W*(\w*)\W*(\S*)/},
  {type:'command',       label:CommandPhases.broadcastError,          mapping: ['commandType','commandId','error'], regex:/BroadcastCommandManager: Error broadcasting\W*(\w*)\W*(\S*)[\W]*([\w]*)/},

  {type:'sessionBroker', label: SessionBrokerPhases.requesting,       mapping: ["handle", "commanderId", "privateRequest", "commandType"], regex:/SessionBroker: actually requesting session\W*(\S*)\W*for\W*(\S*).*private\W*(\w*)\W*commandType\W*(\S*)/},
  {type:'sessionBroker', label: SessionBrokerPhases.connected,        mapping: ["handle", "commanderId"], regex:/SessionBroker: Session has connected to\W*(\S*)\W*for\W*(\S*)/,   },
  {type:'sessionBroker', label: SessionBrokerPhases.alreadyConnected, mapping: ["handle", "commanderId"], regex:/SessionBroker: Require session has thrown an ALREADY_REQUESTED_TIMEOUT error\W*(\S*)\W*,\W*(\S*)\W*/},
  {type:'sessionBroker', label: SessionBrokerPhases.timeout,          mapping: ["handle", "commanderId"], regex:/SessionBroker: Session failed to connect: SESSION_REQUEST_TIMEOUT\W*(\S*)\W*for\W*(\S*)/},
  {type:'sessionBroker', label: SessionBrokerPhases.removedFromQueue, mapping: ["handle", "commanderId"], regex:/SessionBroker: Session removed from queue\W*(\S*)\W*for\W*(\S*)/},
  {type:'sessionBroker', label: SessionBrokerPhases.failed,           mapping: ["handle", "commanderId"], regex:/SessionBroker: Failed to request session\W*(\S*)\W*for\W*(\S*)/},
  {type:'sessionBroker', label: SessionBrokerPhases.revoke,           mapping: ["handle", "commanderId"], regex:/SessionBroker: Revoke session\W*(\S*)\W*for\W*(\S*)/},
  {type:'sessionBroker', label: SessionBrokerPhases.success,          mapping: ["commandId", "commanderId"], regex:/SessionBroker: Command finished.\W*(\S*)\W*(\S*)/},

  {type:'sessionManager', label: SessionManagerPhases.sessionTimeout, mapping: ["handle", "commanderId"], regex:/SessionManager: SESSION_REQUEST_TIMEOUT Timeout called for\W*(\S*)\W*(\S*)/},


  {type:'session', label: SessionPhases.created,                      mapping:['handle','sessionId'],                      regex:/Session: Creating session\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.connecting,                   mapping:['handle','sessionId'],                      regex:/Session: Start connecting to\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.connected,                    mapping:['handle','sessionId'],                      regex:/Session: Connected to\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.connectingFailed,             mapping:['error','handle','sessionId','killedFlag'], regex:/Session: Failed to connect\W*([^,^ ]*) ([\w-:]*) (\S*) (\S*)/},
  {type:'session', label: SessionPhases.retryConnection,              mapping:['handle','sessionId'],                      regex:/Session: Reinitializing the bootstrapper to reactivate the session\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.performCommand,               mapping:['commandId', 'handle','sessionId'],         regex:/Session: performing available command\W*(\S*)\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.performedCommand,             mapping:['commandId', 'handle','sessionId'],         regex:/Session: Finished available command\W*(\S*)\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.interrupted,                  mapping:['handle','sessionId'],                      regex:/Session: Session interrupted\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.killRequest,                  mapping: ["state", "handle", "sessionId"],           regex:/Session: killing session requested...\W*(\w*)\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.killCompleted,                mapping: ["handle", "sessionId"],                    regex:/Session: killing session completed\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.ended,                        mapping: ["handle", "sessionId"],                    regex:/Session: Session has ended\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.disconnectingCommand,         mapping: ["handle", "sessionId"],                    regex:/Session: telling the Crownstone to disconnect\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.disconnectingPhone,           mapping: ["handle", "sessionId"],                    regex:/Session: disconnecting from phone\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.disconnectPromiseDone,        mapping: ["handle", "sessionId"],                    regex:/Session: disconnect done\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.disconnectedRetry,            mapping: ["handle", "sessionId"],                    regex:/Session: Disconnected from Crownstone, Ready for reconnect\W*(\S*)\W*(\S*)/},
  {type:'session', label: SessionPhases.disconnected,                 mapping: ["handle", "sessionId"],                    regex:/Session: Disconnected from Crownstone, ending session\W*(\S*)\W*(\S*)/},
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

  commanderData : CommanderDataMap   = {}
  handleMap     : HandleToCommandMap = {}
  commandData   : CommandData        = {};
  commandId2CommanderIdMap : CommandIdToCommanderIdMap = {}
  commandId2CommandMap     : CommandIdToCommandMap     = {}

  _ensureCommanderEntry(item, commanderId) {
    if (this.commanderData[commanderId] === undefined) {
      this.commanderData[commanderId] = { data: null, tStart: item[0], tEnd: item[0], targets: {}, commands: {}, phases: [], properties:{}};
    }
  }

  collect(item, parser, parseResult: any) {
    let commanderId = null;
    if (parseResult.commanderOptions) {
      commanderId = parseResult.commanderOptions.commanderId;
    }
    else if (parseResult.commanderId) {
      commanderId = parseResult.commanderId;
    }

    this._ensureCommanderEntry(item, commanderId);
    if (parseResult.commanderOptions) {
      this.commanderData[commanderId].data = parseResult.commanderOptions;
    }

    if (parseResult.targets) {
      this.commanderData[commanderId].targets = parseResult.targets;
    }

    this.commanderData[commanderId].phases.push({ time: item[0], label: parser.label, data:parseResult });

    this.commanderData[commanderId].tStart = Math.min( this.commanderData[commanderId].tStart, item[0])
    this.commanderData[commanderId].tEnd   = Math.max( this.commanderData[commanderId].tEnd, item[0])
    this.commanderData[commanderId].properties[parser.label] = parseResult;
  }

  collectCommand(item, parser, parseResult) {
    let command = parseResult.command;

    let commanderId = null;
    let commandId = null;
    // this is the first creation of the command.
    if (command) {
      commanderId = command.commanderId;
      commandId   = command.id;

      this.commandId2CommanderIdMap[commandId] = command.commanderId;
      this._ensureCommanderEntry(item, commanderId);

      if (this.commanderData[commanderId].commands[commandId] === undefined) {
        this.commanderData[commanderId].commands[commandId] = true
      }

      if (this.commandData[commandId] === undefined) {
        this.commandData[commandId] = { data: command, phases: [{time: item[0], label: parser.label}], properties: {} }
      }

      if (this.handleMap[command.commandTarget] === undefined) {
        this.handleMap[command.commandTarget] = [];
      }
      this.handleMap[command.commandTarget].push({time: item[0], commandId: commandId})
      this.commandId2CommandMap[commandId] = this.commandData[commandId];
    }

    if (parseResult.commandId) {
      commandId   = parseResult.commandId;
      commanderId = this.commandId2CommanderIdMap[commandId];
      if (this.commanderData[commanderId] === undefined) {
        console.log(parser, parseResult)
        console.log("Missing commander")
        return;
      }
      this.commanderData[commanderId].phases.push({time:item[0], label: parser.label, commandId: commandId, data: parseResult});

    }

    if (commandId) {
      this.commandData[commandId].properties[parser.label] = parseResult;
      this.commandData[commandId].phases.push({time: item[0], label: parser.label, data: parseResult});
    }

    if (commanderId) {
      this.commanderData[commanderId].tStart = Math.min( this.commanderData[commanderId].tStart, item[0]);
      this.commanderData[commanderId].tEnd   = Math.max( this.commanderData[commanderId].tEnd, item[0]);
      this.commanderData[commanderId].properties[parser.label] = parseResult;
    }
  }


  collectSessionBroker(item, parser, parseResult) {
    let commanderId = parseResult.commanderId;
    if (commanderId) {
      this._ensureCommanderEntry(item, parseResult.commanderId);
      this.commanderData[commanderId].properties[parser.label] = parseResult;
      this.commanderData[commanderId].phases.push({time:item[0], label: parser.label, data: parseResult});
      this.commanderData[commanderId].tStart = Math.min( this.commanderData[commanderId].tStart, item[0])
      this.commanderData[commanderId].tEnd   = Math.max( this.commanderData[commanderId].tEnd, item[0])
    }
  }

  collectSessionManager(item, parser, parseResult) {
    let commanderId = parseResult.commanderId;
    if (commanderId) {
      this._ensureCommanderEntry(item, parseResult.commanderId);
      this.commanderData[commanderId].properties[parser.label] = parseResult;
      this.commanderData[commanderId].phases.push({time:item[0], label: parser.label, data: parseResult});
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

  handleParseResult(item, parser, parseResult) {
    switch (parser.type) {
      case 'session':
        this.sessionCollector.collect(item, parser, parseResult); break;
      case 'commander':
        this.commanderCollector.collect(item, parser, parseResult); break;
      case 'command':
        this.commanderCollector.collectCommand(item, parser, parseResult); break;
      case 'sessionBroker':
        this.commanderCollector.collectSessionBroker(item, parser, parseResult); break;
      case 'sessionManager':
        this.commanderCollector.collectSessionManager(item, parser, parseResult); break;
    }
  }
}
