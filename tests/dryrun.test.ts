import path from "path";

jest.mock("../src/util/config", () => {
  return {
    USER_PATH: path.join(__dirname,'../logs')
  }
})

import {parseCustomFileByLine} from "../src/parsers/base";


beforeEach(async () => {})
beforeAll(async () => {})
afterEach(async () => { })
afterAll(async () => {})

test("experiment", async () => {
  let result : any = {};
  console.time("parseStart")
  await parseCustomFileByLine('/Users/alex/Dropbox/Crownstone/Projects/guardian/logs/Lieke.freeze.2022-02-06.22.40/CrownstoneAppLog2022-02-06.log', result);
  console.timeEnd("parseStart")

  console.log(result.uptime)
})
