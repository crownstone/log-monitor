import path from "path";

jest.mock("../src/util/config", () => {
  return {
    USER_PATH: path.join(__dirname,'../logs')
  }
})

import {parseConsumerAppFileByLine} from "../src/parsers/base";


beforeEach(async () => {})
beforeAll(async () => {})
afterEach(async () => { })
afterAll(async () => {})

test("experiment", async () => {
  let result : any = {};
  console.time("parseStart")
  await parseConsumerAppFileByLine('Alex', '2021-10-28', result);
  console.timeEnd("parseStart")
  let commanders = result.constellation.sessions;
  for (let commanderId in commanders) {
    console.log(commanders[commanderId].phases)
  }
})