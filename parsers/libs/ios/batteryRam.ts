import {removeDuplicates} from "../../util";

let batteryMatcher = /battery:([0-9.]*)/
let ramMatcher = /ram:([0-9.]*)MB/

export function ramParser(logFileData: [number, string][], series: any[]) {
  let result = [];
  let regexSearch = null;
  for (let item of logFileData) {
    regexSearch = item[1].match(ramMatcher);
    if (!regexSearch) continue;
    result.push([item[0], Number(regexSearch[1])]);
  }

  let ram = removeDuplicates(result)
  series.push({type:'line',showSymbol: false, dimensions: ["ram", 'time', 'number'], data: ram});
}


export function batteryParser(logFileData: [number, string][], series: any[]) {
  let result = [];
  let regexSearch = null;
  for (let item of logFileData) {
    regexSearch = item[1].match(batteryMatcher);
    if (!regexSearch) continue;
    result.push([item[0], Number(regexSearch[1])]);
  }

  let battery = removeDuplicates(result)
  series.push({type:'line', showSymbol: false, dimensions: ["battery", 'time', 'number'], data: battery});
}
