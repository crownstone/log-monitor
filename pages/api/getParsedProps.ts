// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {
  parseConsumerAppFileByLine,
  parseCustomFileByLine,
  parseCustomFileByLineForStreaming
} from "../../src/parsers/base";

export default async (req, res) => {
  console.time("Parsing")
  let result : ParseDataResult = {};
  if (req.body.path && req.body.stream) {
    await parseCustomFileByLineForStreaming(req.body.path, result);
  }
  else if (req.body.path) {
    await parseCustomFileByLine(req.body.path, result);
  }
  else {
    await parseConsumerAppFileByLine(req.body.user, req.body.date, result, req.body.part, req.body.parts);
  }

  console.timeEnd("Parsing")


  if (req.body.type === 'cloud') {
    res.end(JSON.stringify({
      cloud:            result.cloud,
      reboots:          result.reboots,
      scanning:         result.scanning,
      appState:         result.appState,
      localization:     result.localization,
      startTime:        result.startTime,
      endTime:          result.endTime
    }));
    return;
  }

  if (req.body.type === 'constellation') {
    res.end(JSON.stringify({
      reboots:          result.reboots,
      constellation:    result.constellation,
      nameMap:          result.nameMap,
      scanning:         result.scanning,
      appState:         result.appState,
      localization:     result.localization,
      startTime:        result.startTime,
      endTime:          result.endTime
    }));
    return;
  }

  if (req.body.type === 'notifications') {
    res.end(JSON.stringify({
      reboots:          result.reboots,
      notifications:    result.notifications,
      scanning:         result.scanning,
      appState:         result.appState,
      nameMap:          result.nameMap,
      localization:     result.localization,
      startTime:        result.startTime,
      endTime:          result.endTime
    }));
    return;
  }

  if (req.body.type === 'bluenetPromises') {
    res.end(JSON.stringify({
      reboots:          result.reboots,
      bluenetPromises:  result.bluenetPromises,
      appState:         result.appState,
      scanning:         result.scanning,
      nameMap:          result.nameMap,
      localization:     result.localization,
      startTime:        result.startTime,
      endTime:          result.endTime
    }));
    return;
  }

  if (req.body.type === 'uptime') {
    res.end(JSON.stringify({
      nameMap:          result.nameMap,
      reboots:          result.reboots,
      uptime:           result.uptime,
      scanning:         result.scanning,
      appState:         result.appState,
      localization:     result.localization,
      startTime:        result.startTime,
      endTime:          result.endTime
    }));
    return;
  }

}

