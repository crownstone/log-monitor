// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {parseConsumerAppFileByLine} from "../../src/parsers/base";
import path from "path";

export default async (req, res) => {
  let result = {}
  await parseConsumerAppFileByLine('Alex','2021-11-04', result, 1e6, true);
  res.end('done');
}

