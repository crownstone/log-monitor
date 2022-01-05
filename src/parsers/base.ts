import {RebootParser} from "./app/RebootParser";
import {ConstellationParser} from "./app/ConstellationParser";
import {NameMapParser} from "./app/NameMapParser";
import {FileUtil} from "../util/FileUtil";
import {LocalizationParser} from "./app/LocalizationParser";
import {CloudParser} from "./app/CloudParser";

export function parseConsumerAppFileByLine(user, date, result, maxLines: number = 0, force= false) {
  return new Promise<void>((resolve, reject) => {
    // use cached data.
    if (force === false) {
      let processedData = FileUtil.getProcessedData(user, date);
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

    const file = FileUtil.getFileStream(user, date)

    let parsers = [
      new RebootParser(result),
      new ConstellationParser(result),
      new NameMapParser(result),
      new LocalizationParser(result),
      new CloudParser(result),
    ]
    let total = 0;
    let firstTime = null;
    let lastTime = null;
    file.on('line', (line) => {
      if (!line) return;

      if (total++ > maxLines && maxLines > 0) {
        return;
      }

      let item = [Number(line.substr(0,13)), line];

      if (firstTime === null) { firstTime = item[0]}

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
      FileUtil.storeProcessedData(user, date, result);
      resolve();
    })

  })
}
