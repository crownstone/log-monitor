type RebootData = [number, number];

interface ParseDataResult {
  reboots?:         RebootData[],
  constellation?:   ConstellationParseResult,
  nameMap?:         NameMap,
  localization?:    LocalizationParseResult,
  cloud?:           CloudParseResult,
  store?:           StoreParseResult,
  notifications?:   NotificationsParseResult,
  bluenetPromises?: BluenetPromisesParseResult,
  eventBus?:        EventParseResult,

  uptime?:          UptimeParseResult,
  appState?:        AppStateParseResult[],
  scanning?:        ScanningParseResult[],

  startTime?: number,
  endTime?:   number,
}

interface UptimeParseResult {
  data: {
    t: number,
    value: number,
  }[];
}


interface ScanningParseResult {
  t: number,
  state: 'startScanning' | 'startBatterySaving'
}


interface EventParseResult {
  [eventBusType: sting]: {
    topics: {[topicId: string]: {t:number, y: number}[]},
    count:  {t:number, y: number}[]
  }
}

interface AppStateParseResult {
  t: number,
  state: 'active' | 'inactive' | 'background'
}


interface BluenetPromisesParseResult {
  promises: {
    id:      string
    tStart:  number,
    tEnd:    number,
    command: string,
    success: boolean,
    error:   string,
    params:  any[],
    result:  string,
    appStateStart: parseResult.appState,
    appStateEnd: null,
  }[],
  count: {
    value: number,
    t: number
  }[]
}

interface NotificationsParseResult {
  notifications: {
    [type: string]: {
      id:      string,
      t:       number,
      content: any
    }[]
  }
}

interface StoreParseResult {
  actions: { t: timestamp, action: any }[]
}

interface CloudParseResult {
  requests: CloudRequest,
  syncs: {tStart: number, tEnd: number, error?: boolean}[]
}

interface CloudRequest {
  tStart: number,
  tEnd: number,
  request: { url: string, config: any }
  reply:   { url: string, result: any }
}

interface LocalizationParseResult {
  spheres:   {time: number, label: string, data: {sphereId: string}}[],
  locations: {time: number, label: string, data: {locationId: string, sphereId: string}}[],
}

type stoneAppId    = string;
type locationAppId = string;

interface NameMap {
  sphereIdMap:    {[sphereAppId:   string] : {name: string, cloudId: string, uid: number,  uuid: string}}
  locationIdMap:  {[locationAppId: string] : {name: string, cloudId: string, uid: number}}
  stoneIdMap:     {[stoneAppId:    string] : {name: string, cloudId: string, uid: number, locationId: locationAppId}}
  stoneHandleMap: {[stoneHandle:   string] : stoneAppId}
}

interface ConstellationParseResult {
  sessions:   SessionData,
  commanders: CommanderDataMap,
  commands:   CommandData,
  maps: {
    commandId2commandMap: CommandIdToCommandMap,
    handle2commandMap:    HandleToCommandMap,
  }
}

interface SessionData {
  [sessionId: string] : SessionDescription
}

interface SessionDescription {
  tStart: number, tEnd: number, handle: string, phases: Phase[], properties: Properties
}

interface Properties {
  [label: string]: ParseResult
}

type ParseResult = any;

interface Phase {
  time: number,
  label: string,
  data?: ParseResult,
}
interface CommanderPhase extends Phase {
  commandId?: string
}

interface CommanderDataMap {
  [commanderId: string] : CommanderData
}

interface CommanderData {
  data: commandOptions,
  tStart: number,
  tEnd: number,
  commands: {[commandId: string]: boolean },
  targets: any,
  phases: CommanderPhase[],
  properties:Properties
}

interface CommandData {
  [commandId: string] : CommandDescription
}

interface CommandDescription {
  data: BleCommand,
  phases: Phase[],
  properties: Properties
}

interface CommandIdToCommandMap {
  [commandId: string]: CommandDescription
}

interface CommandIdToCommanderIdMap {
  [commandId: string]: string
}

interface HandleToCommandMap {
  [handle: string]: { time: number, commandId: string }[]
}


interface parserData {
  type: string,
  label: string,
  mapping: MappingData[],
  regex: RegExp
}

type MappingData = string | {[key: string]: (data: string) => any }

type ItemData = [number, string];