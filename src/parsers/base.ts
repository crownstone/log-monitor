import {RebootParser} from "./app/parsers/RebootParser";
import {ConstellationParser} from "./app/parsers/ConstellationParser";
import {NameMapParser} from "./app/parsers/NameMapParser";
import {FileUtil} from "../util/FileUtil";

export function parseConsumerAppFileByLine(user, date, result, maxLines: number = 0, force=false) {
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
    ]
    let total = 0;
    file.on('line', (line) => {
      if (!line) return;
      if (total++ > maxLines && maxLines > 0) {
        return;
      }

      let item = [Number(line.substr(0,13)), line];
      for (let parser of parsers) {
        parser.load(item);
      }

      if (total%2500 === 0) {
        console.log("parsed", total)
      }
    });

    file.on("close", () => {
      for (let parser of parsers) {
        parser.export();
      }
      console.log("Parsing Done", user, date)
      FileUtil.storeProcessedData(user, date, result);
      resolve();
    })

  })
}
