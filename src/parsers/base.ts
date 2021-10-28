import {RebootParser} from "./app/parsers/RebootParser";
import {ConstellationParser} from "./app/parsers/ConstellationParser";
import {NameMapParser} from "./app/parsers/NameMapParser";
import {FileUtil} from "../util/FileUtil";

const readline = require('readline');
const path = require('path');
const fs = require("fs")

// export async function gatherStatistics() : Promise<{ series: any[], statistics: any}> {
//   let users = findUsers();
//
//   let series = [];
//   let statistics = {}
//   for (let user of users) {
//     let logs = findLogs(user);
//     for (let log of logs) {
//       let filePath = path.join('logs', user, log);
//       parse_iOS_bridge_statistics(user, filePath, series, statistics)
//       await parse_app_statistics(user, filePath, series, statistics);
//     }
//   }
//
//   return {
//     series, statistics
//   }
// }
//
//
// function parse_iOS_lib_statistics(user:string, filename: string, series, statistics) {
//   const libLogRegex = /(BluenetLog)/;
//   let match = filename.match(libLogRegex)
//   if (match) {
//     let data = fs.readFileSync(filename, 'utf-8');
//     let libData = preProcessIOSLib(data);
//     console.log("Processing iOS Lib file", filename);
//   }
// }
//
// function parse_iOS_bridge_statistics(user:string, filename: string, series, statistics) {
//   const libLogRegex = /(BridgeLog)/;
//   let match = filename.match(libLogRegex)
//   if (match) {
//     let data = fs.readFileSync(filename, 'utf-8');
//     let libData = preProcessIOSLib(data);
//     console.log("Processing iOS Bridge file", filename);
//     ramParser(libData, series);
//   }
// }
//
//
// let found = false
// async function parse_app_statistics(user: string, filename: string, series, statistics) {
//   const libLogRegex = /(CrownstoneAppLog)/;
//   let match = filename.match(libLogRegex)
//   if (match) {
//     await parseConsumerAppFileByLine(filename, series)
//   }
// }

export function parseConsumerAppFileByLine(user, date, result, maxLines: number = 0) {
  return new Promise<void>((resolve, reject) => {
    const file = FileUtil.getFileStream(user, date)

    let parsers = [
      new RebootParser(result),
      new ConstellationParser(result),
      new NameMapParser(result),
    ]
    let total = 0;
    file.on('line', (line) => {
      if (!line) return;
      if (maxLines > 0 && total++ > maxLines) {
        return;
      }

      let item = [Number(line.substr(0,13)), line];
      for (let parser of parsers) {
        parser.load(item);
      }

    });

    file.on("close", () => {
      for (let parser of parsers) {
        parser.export();
      }
      console.log("Parsing Done", user, date)
      resolve();
    })

  })
}




export function startParsers() {

  // let lib    = fs.readFileSync(`logs/BluenetLog${date}.log`,'utf-8');
  // let bridge = fs.readFileSync(`logs/BridgeLog${date}.log`,'utf-8');
  // let app    = fs.readFileSync(`logs/CrownstoneAppLog${date}.log`,'utf-8');
  //
  // let libData    = preProcessIOSLib(lib);
  // let bridgeData = preProcessIOSLib(bridge)
  // let appData    = preProcessConsumerApp(app);

  // let users = findUsers();
  //
  // let series = [];
  // for (let user of users) {
  //   let logs = findLogs(user);
  //   for (let log of logs) {
  //     parse_iOS_lib(log, series)
  //   }
  // }



  // batteryParser(libData, series);
  // ramParser(libData, series);
  // constellationParser(appData, series);

  // return series;
}


function parse_iOS_lib(filename: string, series) {
  const libLogRegex = /(BluenetLog)/;
  let match = filename.match(libLogRegex)
  if (match) {
    // let data = fs.readDirSync(filename)
    console.log("HERE")
  }
}



function findUsers() {
  let dir = fs.readdirSync('logs/');
  return dir;
}

function findLogs(user: string) {
  let filePath = path.join('logs', user);
  let stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return fs.readdirSync(filePath);
  }
  return [];
}

