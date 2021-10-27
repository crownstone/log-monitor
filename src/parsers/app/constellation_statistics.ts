let createSessionR = /Session: Creating session ([\w\-]*) ([\w\-]*)/
let activateR = /Session: Start connecting to ([\w\-]*) ([\w\-]*)/
let connectedR = /Session: Connected to ([\w\-]*) ([\w\-]*)/
let performingCommand = /Session: performing available command... ([\w\-]*) ([\w\-]*)/
let finishedCommand = /Session: Finished available command... ([\w\-]*) ([\w\-]*)/
let killingCommand = /Session: killing session requested... \w* ([\w\-]*) ([\w\-]*)/
let killingCompletedCommand = /Session: killing session completed ([\w\-]*) ([\w\-]*)/
let endedCommand = /Session: Session has ended.. ([\w\-]*) ([\w\-]*)/

let initBootstrapper = /Session: Initializing bootstrapper ([\w\-]*) ([\w\-]*)/
let closeBootstrapper = /Session: Clearing bootstrapper ([\w\-]*) ([\w\-]*)/

let rebootApp = /Initializing Logprocessor./

let enums = {
  created:            0,
  initBootstrapper:   1,
  activated:          2,
  connected:          3,
  performing:         4,
  finished:           5,
  killing:            6,
  killingCompleted:   7,
  closedBootstrapper: 8,
  ended:              9,
}

export function gatherConstellationStatistics(user: string, logFileData: [number, string][], series: any[], statistics: any) {
  let sessions = {}

  if (!statistics.sessions) {
    statistics.sessions = {
      __global: { sessionCount: 0 }
    };
  }

  if (!statistics.sessions[user]) {
    statistics.sessions[user] = {
      sessionCount: 0,
      sessionStart: 0,
      bootstrapped: 0,
      activated: 0,
      connected: 0,
      performing: 0,
      finished: 0,
      killing: 0,
      killed: 0,
      ended: 0,
      cleanedUp: 0,
      open: 0,
      openIds: {},
      handleUncreatedSession: {},
    }
  }

  let data = {
    sessionStart: [],
    bootstrapped: [],
    activated:    [],
    connected:    [],
    performing:   [],
    finished:     [],
    killing:      [],
    killed:       [],
    ended:        [],
    cleanedUp:    [],
    open:         [],
  }

  let markPoints = []

  let t = 0;
  let sessionId = null;
  for (let item of logFileData) {
    let rebootDetected = item[1].match(rebootApp);
    if (rebootDetected) {
      statistics.sessions[user].sessionCount =  0;
      statistics.sessions[user].sessionStart =  0;
      statistics.sessions[user].bootstrapped =  0;
      statistics.sessions[user].activated =  0;
      statistics.sessions[user].connected =  0;
      statistics.sessions[user].performing =  0;
      statistics.sessions[user].finished =  0;
      statistics.sessions[user].killing =  0;
      statistics.sessions[user].killed =  0;
      statistics.sessions[user].ended =  0;
      statistics.sessions[user].cleanedUp =  0;
      statistics.sessions[user].open =  0;
      statistics.sessions[user].handleUncreatedSession = {};
      continue;
    }



    if (sessionId = search(item, createSessionR, enums.created, sessions, statistics, user, true)) {
      statistics.sessions[user].sessionStart += 1;
      statistics.sessions[user].open += 1;
      statistics.sessions[user].openIds[sessionId] = String(new Date(item[0]));

      data.sessionStart.push([item[0],statistics.sessions[user].sessionStart]);
      data.open.push([item[0],statistics.sessions[user].open]);
      continue;
    }
    if (search(item, initBootstrapper,  enums.initBootstrapper, sessions, statistics, user)) {
      statistics.sessions[user].bootstrapped += 1;
      data.bootstrapped.push([item[0],statistics.sessions[user].bootstrapped]);
      continue;
    }
    if (search(item, connectedR, enums.connected, sessions, statistics, user)) {
      statistics.sessions[user].connected += 1;
      data.connected.push([item[0],statistics.sessions[user].connected]);
      continue;
    }
    if (search(item, activateR, enums.activated, sessions, statistics, user)) {
      statistics.sessions[user].activated += 1;
      data.activated.push([item[0],statistics.sessions[user].activated]);
      continue;
    }
    if (search(item, performingCommand, enums.performing, sessions, statistics, user)) {
      statistics.sessions[user].performing += 1;
      data.performing.push([item[0],statistics.sessions[user].performing]);
      continue;
    }
    if (search(item, finishedCommand, enums.finished, sessions, statistics, user)) {
      statistics.sessions[user].finished += 1;
      data.finished.push([item[0],statistics.sessions[user].finished]);
      continue;
    }
    if (search(item, killingCommand, enums.killing, sessions, statistics, user)) {
      statistics.sessions[user].killing += 1;
      data.killing.push([item[0],statistics.sessions[user].killing]);
      continue;
    }
    if (search(item, killingCompletedCommand, enums.killingCompleted, sessions, statistics, user)) {
      statistics.sessions[user].killed += 1;
      data.killed.push([item[0],statistics.sessions[user].killed]);
      continue;
    }
    if (search(item, closeBootstrapper, enums.closedBootstrapper, sessions, statistics, user)) {
      statistics.sessions[user].cleanedUp += 1;
      data.cleanedUp.push([item[0],statistics.sessions[user].cleanedUp]);
      continue;
    }
    if (sessionId = search(item, endedCommand, enums.ended, sessions, statistics, user)) {
      statistics.sessions[user].ended += 1;
      statistics.sessions[user].open -= 1;

      delete statistics.sessions[user].openIds[sessionId];
      data.ended.push([item[0],statistics.sessions[user].ended]);
      data.open.push([item[0],statistics.sessions[user].open]);
      continue;
    }

    // t++;
    // if (t > 1000) {
    //   break
    // }
  }

  series.push({name:'open',         showSymbol: false, type:'line',dimensions: [`open`, 'time', 'number'],data: data.open, yAxisIndex: 1})
  series.push({name:'sessionStart', showSymbol: false, type:'line',dimensions: [`sessionStart`, 'time', 'number'],data: data.sessionStart})
  series.push({name:'bootstrapped', showSymbol: false, type:'line',dimensions: [`bootstrapped`, 'time', 'number'],data: data.bootstrapped})
  series.push({name:'activated',    showSymbol: false, type:'line',dimensions: [`activated`, 'time', 'number'],data: data.activated})
  series.push({name:'connected',    showSymbol: false, type:'line',dimensions: [`connected`, 'time', 'number'],data: data.connected})
  series.push({name:'performing',   showSymbol: false, type:'line',dimensions: [`performing`, 'time', 'number'],data: data.performing})
  series.push({name:'finished',     showSymbol: false, type:'line',dimensions: [`finished`, 'time', 'number'],data: data.finished})
  series.push({name:'killing',      showSymbol: false, type:'line',dimensions: [`killing`, 'time', 'number'],data: data.killing})
  series.push({name:'killed',       showSymbol: false, type:'line',dimensions: [`killed`, 'time', 'number'],data: data.killed})
  series.push({name:'closed',       showSymbol: false, type:'line',dimensions: [`cleanedUp`, 'time', 'number'],data: data.cleanedUp})
  series.push({name:'ended',        showSymbol: false, type:'line',dimensions: [`ended`, 'time', 'number'],data: data.ended})

  for (let sessionId of Object.keys(sessions)) {
    let session = sessions[sessionId];
    statistics.sessions.__global.sessionCount += 1;
    statistics.sessions[user].sessionCount += 1;
  }
}

function check(data, value) {
  for (let point of data) {
    if (point[1] === value) {
      return true;
    }
  }
  return false;
}

function count(data, value) {
  let res = 0;
  for (let point of data) {
    if (data[1] === value) {
      res++;
    }
  }
  return res;
}

function search(item, regex, value, sessions, statistics, user, create = false) {
  let regexSearch = item[1].match(regex);
  if (!regexSearch) return false;

  let handle    = regexSearch[1];
  let sessionId = regexSearch[2];

  if (sessions[sessionId] === undefined) {
    if (create) {
      sessions[sessionId] = {data: []};
    }
    else {
      if (statistics.sessions[user].handleUncreatedSession[value] === undefined) {
        statistics.sessions[user].handleUncreatedSession[value] = {count:0, sessionIds: []};
      }
      statistics.sessions[user].handleUncreatedSession[value].count++;
      statistics.sessions[user].handleUncreatedSession[value].sessionIds.push(sessionId);

      return sessionId;
    }
  }

  sessions[sessionId].handle = handle;
  sessions[sessionId].data.push([item[0], value]);
  return sessionId;
}