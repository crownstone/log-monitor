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
let commander_created    = {regex:/Commander: Created for target",\[*([\w\-,"]*)\W*,"id:","([\w-]*)/, mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},'commanderId']};
let commander_loadAction = {regex:/Commander: Loading command",\[*([\w\-,"]*)\W*,"id:","([\w-]*)/, mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},'commanderId']};
let command_failure      = {regex:/Commander: Failed to load command",\[*([\w\-,"]*)\W*,"id:","([\w-]*)/, mapping: [{targets:(d) => { return d.replace(/"/,'').split(",")}},'commanderId']};


let sessionBroker_requesting       = {regex:/SessionBroker: actually requesting session\W*"([\w-]*)"\W*for\W*([\w-]*).*private\W*(\w*)\W*commandType\W*([\w-]*)/, mapping: ["handle", "commanderId", "privateRequest", "commandType"]};
let sessionBroker_connected        = {regex:/SessionBroker: Session has connected to\W*([\w-]*)\W*for\W*([\w-]*)/,    mapping: ["handle", "commanderId"]};
let sessionBroker_alreadyConnected = {regex:/SessionBroker: Require session has thrown an ALREADY_REQUESTED_TIMEOUT error\W*([\w-]*)\W*,\W*([\w-]*)\W*/,  mapping: ["handle", "commanderId"]};
let sessionBroker_timeout          = {regex:/SessionBroker: Session failed to connect: SESSION_REQUEST_TIMEOUT\W*([\w-]*)\W*for\W*([\w-]*)/,              mapping: ["handle", "commanderId"]};
let sessionBroker_removedFromQueue = {regex:/SessionBroker: Session removed from queue\W*([\w-]*)\W*for\W*([\w-]*)/,  mapping: ["handle", "commanderId"]};
let sessionBroker_failed           = {regex:/SessionBroker: Failed to request session\W*([\w-]*)\W*for\W*([\w-]*)/,   mapping: ["handle", "commanderId"]};
let sessionBroker_revoke           = {regex:/SessionBroker: Revoke session\W*([\w-]*)\W*for\W*([\w-]*)/,              mapping: ["handle", "commanderId"]};

let commandCreated           = {regex:/BleCommandManager: Loading command\W*({.*})"]/,                            mapping: [{command: (d) => { return JSON.parse(d); }}]};
let command_performing       = {regex:/BleCommandManager: Performing command\W*(\w*)\W*on\W*([\w-]*)\W*([\w-]*)/, mapping: ['commandType', 'handle', 'commandId']};
let command_succeeded        = {regex:/BleCommandManager: Succeeded command\W*(\w*)\W*on\W*([\w-]*)\W*([\w-]*)/,  mapping: ['commandType', 'handle', 'commandId']};
let command_failed           = {regex:/BleCommandManager: Something went wrong while performing\W*(\w*)\W*([\w-]*)\W*,([\w-]*)\W*([\w-]*)/, mapping: ['commandType', 'handle', 'error', 'commandId']};
let command_duplicate        = {regex:/BleCommandCleaner: Removed command due to duplicate\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)\W*([\w-]*)/,    mapping: ['removedCommandId', 'commandId', 'commandType', 'commanderId']};


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
 disconnectActionDone: 'session_disconnectActionDone',
 disconnectedRetry:    'session_disconnectedRetry',
 disconnected:         'session_disconnected',
}

let sessions = {};
let sessionParsers = [
  {type:'session', label: SessionPhases.created,              mapping:['handle','sessionId'],    regex:/Session: Creating session\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.connecting,           mapping:['handle','sessionId'],    regex:/Session: Start connecting to\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.connected,            mapping:['handle','sessionId'],    regex:/Session: Connected to\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.connectingFailed,     mapping:['error','handle','sessionId','killedFlag'],  regex:/Session: Failed to connect\W*([^,]*)","([\w-]*)\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.retryConnection,      mapping:['handle','sessionId'],    regex:/Session: Reinitializing the bootstrapper to reactivate the session\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.performCommand,       mapping:['handle','sessionId'],    regex:/Session: performing available command\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.performedCommand,     mapping:['handle','sessionId'],    regex:/Session: Finished available command\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.interrupted,          mapping:['handle','sessionId'],    regex:/Session: Session interrupted\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.killRequest,          mapping: ["state", "handle", "sessionId"],  regex:/Session: killing session requested...\W*(\w*)\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.killCompleted,        mapping: ["handle", "sessionId"],  regex:/Session: killing session completed\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.ended,                mapping: ["handle", "sessionId"],  regex:/Session: Session has ended\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectingCommand, mapping: ["handle", "sessionId"],  regex:/Session: telling the Crownstone to disconnect\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectingPhone,   mapping: ["handle", "sessionId"],  regex:/Session: disconnecting from phone\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectActionDone, mapping: ["handle", "sessionId"],  regex:/Session: disconnect done\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnectedRetry,    mapping: ["handle", "sessionId"],  regex:/Session: Disconnected from Crownstone, Ready for reconnect\W*([\w-]*)\W*([\w-]*)/},
  {type:'session', label: SessionPhases.disconnected,         mapping: ["handle", "sessionId"],  regex:/Session: Disconnected from Crownstone, ending session\W*([\w-]*)\W*([\w-]*)/},
];

class SessionCollector {

  data = {}

  collect(item, parser, parseResult: any) {
    if (parseResult.sessionId) {
      if (this.data[parseResult.sessionId] === undefined) {
        this.data[parseResult.sessionId] = {tStart: item[0], tEnd: item[0], handle: parseResult.handle, phases:[], properties:{}};
      }

      this.data[parseResult.sessionId].tStart = Math.min(this.data[parseResult.sessionId].tStart, item[0])
      this.data[parseResult.sessionId].tEnd   = Math.max(this.data[parseResult.sessionId].tStart, item[0])
      this.data[parseResult.sessionId].phases.push({time: item[0], label: parser.label, data: parseResult})
      this.data[parseResult.sessionId].properties[parser.label] = parseResult;
    }
  }
}


export class ConstellationParser extends BaseParser {

  sessionCollector = new SessionCollector()

  load(item) {
    for (let parser of sessionParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['constellation'] = {
      sessions: this.sessionCollector.data
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
        this.sessionCollector.collect(item, parser, parseResult);
    }

    return true;
  }
}
