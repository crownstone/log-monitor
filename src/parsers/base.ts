import {RebootParser} from "./app/RebootParser";
import {ConstellationParser} from "./app/ConstellationParser";
import {NameMapParser} from "./app/NameMapParser";
import {FileUtil} from "../util/FileUtil";
import {LocalizationParser} from "./app/LocalizationParser";
import {CloudParser} from "./app/CloudParser";
import {NotificationParser} from "./app/NotificationParser";
import {BluenetPromiseParser} from "./app/BluenetPromiseParser";


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
    if (force === false && false) {
      let processedData = FileUtil.getProcessedData(user, date, part);
      if (processedData) {
        console.log("USING CACHE")
        // shallow copy into result
        for (let key in processedData) {
          result[key] = processedData[key];
        }
        return;
      }
    }

    let filePath = FileUtil.getFilePath(user,date);
    let startLine = 0;
    let endLine = 0;

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

  if (amountOfLines > 2e4) {
    endLine = amountOfLines;
    startLine = endLine - 2e4;
  }

  await _parseAppLog(filePath, result, startLine, endLine);
}


function _parseAppLog(filePath: string, result: ParseDataResult, startLine: number = 0, endLine: number = 0) {
  return new Promise<void>((resolve, reject) => {
    const file = FileUtil.getFileStream(filePath);
    let parsers = [
      new NameMapParser(result),
      new NotificationParser(result),
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
        parsers[0].load(item);
        return;
      }

      if (total > endLine && endLine > 0) {
        parsers[0].load(item);
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