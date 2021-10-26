let createSessionR          = /Session: Creating session ([\w\-]*) ([\w\-]*)/
let activateR               = /Session: Start connecting to ([\w\-]*) ([\w\-]*)/
let performingCommand       = /Session: performing available command... ([\w\-]*) ([\w\-]*)/
let finishedCommand         = /Session: Finished available command... ([\w\-]*) ([\w\-]*)/
let killingCommand          = /Session: killing session requested... ([\w\-]*) ([\w\-]*)/
let killingCompletedCommand = /Session: killing session completed ([\w\-]*) ([\w\-]*)/
let endedCommand            = /Session: Session has ended.. ([\w\-]*) ([\w\-]*)/

export function constellationParser(logFileData: [number, string][], series: any[]) {
  let sessions = {}
  for (let item of logFileData) {
    if (search(item, createSessionR,          0, sessions)) { continue; }
    if (search(item, activateR,               1, sessions)) { continue; }
    if (search(item, performingCommand,       2, sessions)) { continue; }
    if (search(item, finishedCommand,         3, sessions)) { continue; }
    if (search(item, killingCommand,          4, sessions)) { continue; }
    if (search(item, killingCompletedCommand, 5, sessions)) { continue; }
    if (search(item, endedCommand,            6, sessions, true)) { continue; }
  }

  for (let sessionId of Object.keys(sessions)) {
    let session = sessions[sessionId];
    series.push({
      type:'line',
      dimensions: [`Session${sessionId}_${session.handle}`, 'time', 'number'],
      data: session.data
    })
  }
}

function search(item, regex, value, sessions, deleteIfPresent = false) {
  let regexSearch = item[1].match(regex);
  if (!regexSearch) return false;

  let handle    = regexSearch[1];
  let sessionId = regexSearch[2];

  if (deleteIfPresent) {
    delete sessions[sessionId];
    return true;
  }

  if (sessions[sessionId] === undefined) {
    sessions[sessionId] = {data:[]};
  }

  sessions[sessionId].handle = handle;
  sessions[sessionId].data.push([item[0], value]);
  return true;
}