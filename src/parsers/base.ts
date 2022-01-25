import {RebootParser} from "./app/RebootParser";
import {ConstellationParser} from "./app/ConstellationParser";
import {NameMapParser} from "./app/NameMapParser";
import {FileUtil} from "../util/FileUtil";
import {LocalizationParser} from "./app/LocalizationParser";
import {CloudParser} from "./app/CloudParser";


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


export function parseConsumerAppFileByLine(user, date, result, part: number = null, parts: number = null, force= false) {
  return new Promise<void>(async (resolve, reject) => {
    // use cached data.
    if (force === false) {
      let processedData = FileUtil.getProcessedData(user, date, part);
      if (processedData) {
        console.log("USING CACHE")
        // shallow copy into result
        for (let key in processedData) {
          result[key] = processedData[key];
        }
        resolve();
        return;
      }
    }

    let startLine = 0;
    let endLine = 0;

    let filePath = FileUtil.getFilePath(user,date);
    if (part !== null) {
      let amountOfLines = await getLineCount(filePath)
      console.log("total line count =", amountOfLines)

      let linesPerChunk = Math.ceil(amountOfLines / parts);

      startLine = linesPerChunk*part;
      endLine = startLine + linesPerChunk;

    }

    const file = FileUtil.getFileStream(filePath);

    let parsers = [
      new NameMapParser(result),
      new RebootParser(result),
      new ConstellationParser(result),
      new LocalizationParser(result),
      new CloudParser(result),
    ]
    let total = 0;
    let firstTime = null;
    let lastTime = null;
    file.on('line', (line) => {
      if (!line) return;

      total++;
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
      console.log("Parsing Done", user, date)
      FileUtil.storeProcessedData(user, date, result, part);
      resolve();
    })

  })
}
