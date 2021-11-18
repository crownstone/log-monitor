// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


import {FileUtil} from "../../src/util/FileUtil";

export default async (req, res) => {
  let user = req.body.user;
  let date = req.body.date;
  FileUtil.removeProcessedData(user,date)
  res.end('{}')
}

