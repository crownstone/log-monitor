

let unsubscribe = /LOGi EVENT ------ : Unsubscribed from topic\[([\w_\-0-9]*)\], topicCount:\[(\d*)\], totalCount:\[(\d*)\] type:\[([\w_\-0-9]*)\] busId:\[([\w_\-0-9]*)\]/
let subscribe   = /LOGi EVENT ------ : Subscribed to topic\[([\w_\-0-9]*)\], topicCount:\[(\d*)\], totalCount:\[(\d*)\] type:\[([\w_\-0-9]*)\] busId:\[([\w_\-0-9]*)\]/
let clearAll    = /LOGi EVENT ------ : EventBus: Clearing all event listeners type:\[([\w_\-0-9]*)\] busId:\[([\w_\-0-9]*)\]/
let clearSome   = /EventBus: Clearing most event listeners. totalCount:\[(\d*)\] type:\[([\w_\-0-9]*)\] busId:\[([\w_\-0-9]*)\]/

let rebootApp = /BackgroundProcessHandler: received userLoggedInFinished event./

export function gatherEventStatistics(user: string, logFileData: [number, string][], series: any[], statistics: any) {
  let totalCount = {};
  let closedUnstartedEvents = {};
  let eventData = {}
  if (!statistics.events) {
    statistics.events = {};
  }

  function set(item, regex) {
    let data = search(item, regex)
    if (data) {
      if (eventData[user] === undefined) {
        eventData[user] = {};
      }
      if (eventData[user][data.busId] === undefined) {
        eventData[user][data.busId] = {__totalCount: [], __type: data.type};
      }
      if (eventData[user][data.busId][data.topic] === undefined) {
        eventData[user][data.busId][data.topic] = [];
      }

      eventData[user][data.busId][data.topic].push([item[0], data.count]);
      eventData[user][data.busId].__totalCount.push([item[0], data.totalCount]);
      return data;
    }
    return false;
  }

  let result = null
  for (let item of logFileData) {
    if (set(item, subscribe)) { continue; }
    if (set(item, unsubscribe)) { continue; }

    if (result = match(item, clearAll)) {
      eventData[user][result[1]].__totalCount.push([item[0], 0]);
      for (let topic in eventData[user][result[1]]) { eventData[user][result[1]][topic].push([item[0], 0]) }
      continue;
    }
    // if (match(item, rebootApp)) {
    //   for (let busId in eventData[user]) {
    //     eventData[user][busId].__totalCount.push([item[0], 0]);
    //     for (let topic in eventData[user][busId]) {
    //       eventData[user][busId][topic].push([item[0], 0]);
    //     }
    //   }
    //   continue;
    // }

    // let clearSomeData = match(item, clearSome)
    // if (clearSomeData) {
    //   totalCount.push([item[0], clearSomeData[1]]);
    //   continue;
    // }
  }


  // series.push({name:'totalListeners', showSymbol: false, type:'line',dimensions: [`totalListeners`, 'time', 'number'], data: totalCount, yAxisIndex: 1})
  for (let busId in eventData[user]) {
    let type = eventData[user][busId].__type
    // series.push({name:'totalListeners'+busId, showSymbol: false, type:'line',dimensions: [`totalListeners_bus:${busId}`, 'time', 'number'], data: eventData[user][busId].__totalCount, yAxisIndex: 1})
    for (let topic in eventData[user][busId]) {
      if (topic == "__type")       { continue; }
      if (topic == "__totalCount") { continue; }
      series.push({name:`${type}_topic_${topic}_${busId}`,showSymbol: false, type:'line',dimensions: [`${type}_topic_${topic}_${busId}`, 'time', 'number'], data: eventData[user][busId][topic]})
    }
  }


}

function search(item, regex) : any {
  let regexSearch = item[1].match(regex);
  if (!regexSearch) return false;

  let topic      = regexSearch[1];
  let count      = regexSearch[2];
  let totalCount = regexSearch[3];
  let type       = regexSearch[4];
  let busId      = regexSearch[5];

  return { topic, count, totalCount, type, busId}
}

function match(item,regex) {
  let regexSearch = item[1].match(regex);
  if (!regexSearch) return false;
  return regexSearch;
}