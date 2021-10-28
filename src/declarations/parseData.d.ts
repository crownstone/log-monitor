
type RebootData = [number, number];

interface ParseDataResult {
  reboots: RebootData[],
  constellation: ConstellationParseResult,
  nameMap: NameMap,
}


interface NameMap {
  [handle: string]: StoneMap,
}

interface ConstellationParseResult {
  sessions:   SessionData,
  commanders: CommanderData,
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

interface CommanderData {
  [commanderId: string] : {
    tStart: number, tEnd: number, commands: CommandData, targets: any, phases: CommanderPhase[]
  }
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