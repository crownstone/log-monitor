
export function removeDuplicates(data) {
  let newData = [];
  let prevValue = null;
  let lastPush = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i][1] !== prevValue) {
      prevValue = data[i][1]
      newData.push(data[i]);
      lastPush = i;
    }
  }
  if (lastPush < data.length-1) {
    newData.push(data[data.length-1]);
  }
  return newData;
}


const timeMatcher = /([0-9.]*) @/;
export function preProcessIOSLib(data: string) {
  let result = []
  let dataArr = data.split("\n");
  for (let line of dataArr) {
    if (!line) continue;
    let t = line.match(timeMatcher);
    if (!t) continue;
    let tValue = 1000*Number(t[1]);
    result.push([tValue, line])
  }
  return result;
}

export function preProcessConsumerApp(data: string) {
  let result = []
  let dataArr = data.split("\n");
  for (let line of dataArr) {
    if (!line) continue;
    result.push([Number(line.substr(0,13)), line])
  }
  return result;
}


export function getGroupName(nameMap : NameMap, handle : string) : string {
  let id = nameMap.stoneHandleMap?.[handle.toLowerCase()] ?? null;
  let stoneMap = nameMap.stoneIdMap?.[id] ?? null;
  if (stoneMap === null) { return handle; }
  let locationName = nameMap.locationIdMap?.[stoneMap.locationId]?.name ?? "unknown"

  return `${stoneMap.uid}: ${stoneMap.name} in ${locationName}`;
}
