import {RebootParser} from "./app/RebootParser";
import {ConstellationParser} from "./app/ConstellationParser";
import {NameMapParser} from "./app/NameMapParser";
import {FileUtil} from "../util/FileUtil";
import {LocalizationParser} from "./app/LocalizationParser";
import {CloudParser} from "./app/CloudParser";
import {NotificationParser} from "./app/NotificationParser";
import {BluenetPromiseParser} from "./app/BluenetPromiseParser";
import {UptimeParser} from "./app/UptimeParser";
import {ScanningParser} from "./app/ScanningParser";
import { AppStateParser } from "./app/AppStateParser";
import {EventCountParser} from "./app/EventCountParser";


export function getLineCount(path) {
  return new Promise<number>((resolve, reject) => {
    const file = FileUtil.getFileStream(path)

    // use cached data.
    let count = 0
    file.on('line', (line) => {
      count++;
    });

    file.on("close", () => {
      resolve(count);
    })

  })
}


export async function parseConsumerAppFileByLine(user, date, result, part: number = null, parts: number = null, force= false) {
    // use cached data.
    if (force === false) {
      let processedData = FileUtil.getProcessedData(user, date, part);
      if (processedData) {
        // shallow copy into result
        for (let key in processedData) {
          result[key] = processedData[key];
        }
        return;
      }
    }

    let filePath = FileUtil.getFilePath(user,date);
    let startLine = 0;
    let endLine   = 0;


    if (part !== null) {
      let amountOfLines = await getLineCount(filePath)
      console.log("total line count =", amountOfLines)

      let linesPerChunk = Math.ceil(amountOfLines / parts);

      startLine = linesPerChunk*part;
      endLine = startLine + linesPerChunk;
    }

    await _parseAppLog(filePath, result, startLine, endLine);

    FileUtil.storeProcessedData(user, date, result, part);
}



export async function parseCustomFileByLine(filePath, result) {
  let amountOfLines = await getLineCount(filePath)
  console.log("total line count =", amountOfLines)

  await _parseAppLog(filePath, result);
}


export async function parseCustomFileByLineForStreaming(filePath, result) {
  let amountOfLines = await getLineCount(filePath)
  console.log("total line count =", amountOfLines)

  let startLine = 0;
  let endLine = 0;

  let window = 15e3; // amount of lines from the end

  if (amountOfLines > window) {
    endLine = amountOfLines;
    startLine = endLine - window;
  }

  await _parseAppLog(filePath, result, startLine, endLine);
}


function _parseAppLog(filePath: string, result: ParseDataResult, startLine: number = 0, endLine: number = 0) {
  return new Promise<void>((resolve, reject) => {
    const file = FileUtil.getFileStream(filePath);
    let nameMapParser = new NameMapParser(result);
    let parsers = [
      nameMapParser,
      new NotificationParser(result),
      new UptimeParser(result),
      new ScanningParser(result),
      new AppStateParser(result),
      new EventCountParser(result),
      new RebootParser(result),
      new BluenetPromiseParser(result),
      new ConstellationParser(result),
      new LocalizationParser(result),
      new CloudParser(result),
    ];
    let total = 0;
    let firstTime = null;
    let lastTime  = null;

    file.on('line', (line) => {
      if (!line) return;

      total++;
      if (line.substr(0,4) === " LOG") {
        line = line.substr(6)
      }
      let item = [Number(line.substr(0,13)), line];

      if (startLine > total) {
        nameMapParser.load(item);
        return;
      }

      if (total > endLine && endLine > 0) {
        nameMapParser.load(item);
        return;
      }


      if (firstTime === null) { firstTime = item[0] }

      for (let parser of parsers) {
        parser.load(item);
      }

      if (total%2500 === 0) {
        console.log("parsed", total)
      }
      lastTime = item[0];
    });

    file.on("close", () => {
      for (let parser of parsers) {
        parser.export();
      }
      result.startTime = firstTime;
      result.endTime   = lastTime;
      console.log("Parsing Done", filePath)
      resolve();
    });


  })
}