// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {parseConsumerAppFileByLine} from "../../src/parsers/base";

export default async (req, res) => {
  console.time("Parsing")
  let result = {};
  await parseConsumerAppFileByLine(req.body.user,req.body.date, result);
  console.timeEnd("Parsing")
  res.end(JSON.stringify(result))
}

