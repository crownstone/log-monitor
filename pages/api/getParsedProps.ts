// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {parseConsumerAppFileByLine} from "../../src/parsers/base";

export default async (req, res) => {
  console.time("Parsing")
  let result : ParseDataResult = {};
  await parseConsumerAppFileByLine(req.body.user, req.body.date, result, req.body.part ?? null, req.body.parts ?? null);
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

}

