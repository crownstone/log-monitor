// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {parseConsumerAppFileByLine} from "../../src/parsers/base";

export default async (req, res) => {
  let result = {}
  await parseConsumerAppFileByLine('Alex','2021-11-05', result, null, null,true);
  res.end('done');
}

