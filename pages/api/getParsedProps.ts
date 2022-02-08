// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {parseConsumerAppFileByLine, parseCustomFileByLine} from "../../src/parsers/base";

export default async (req, res) => {
  console.time("Parsing")
  let result : ParseDataResult = {};

  if (req.body.path) {
    await parseCustomFileByLine(req.body.path, result);
  }
  else {
    await parseConsumerAppFileByLine(req.body.user, req.body.date, result, req.body.part ?? null, req.body.parts ?? null);
  }

  console.timeEnd("Parsing")


  if (req.body.type === 'cloud') {
    res.end(JSON.stringify({
      cloud:         result.cloud,
      reboots:       result.reboots,
      localization:  result.localization,
      startTime:     result.startTime,
      endTime:       result.endTime
    }));
    return;
  }

  if (req.body.type === 'constellation') {
    res.end(JSON.stringify({
      reboots:       result.reboots,
      constellation: result.constellation,
      nameMap:       result.nameMap,
      localization:  result.localization,
      startTime:     result.startTime,
      endTime:       result.endTime
    }));
    return;
  }

  if (req.body.type === 'notifications') {
    res.end(JSON.stringify({
      reboots:       result.reboots,
      notifications: result.notifications,
      nameMap:       result.nameMap,
      localization:  result.localization,
      startTime:     result.startTime,
      endTime:       result.endTime
    }));
    return;
  }

  if (req.body.type === 'bluenetPromises') {
    res.end(JSON.stringify({
      reboots:         result.reboots,
      bluenetPromises: result.bluenetPromises,
      nameMap:         result.nameMap,
      localization:    result.localization,
      startTime:       result.startTime,
      endTime:         result.endTime
    }));
    return;
  }

}

