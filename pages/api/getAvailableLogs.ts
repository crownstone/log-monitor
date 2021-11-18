// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


import {FileUtil} from "../../src/util/FileUtil";

export default async (req, res) => {
  res.end(JSON.stringify(FileUtil.getUsers()))
}

