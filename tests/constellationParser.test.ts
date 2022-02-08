import path from "path";

jest.mock("../src/util/config", () => {
  return {
    USER_PATH: path.join(__dirname,'../logs')
  }
})

import {parseConsumerAppFileByLine} from "../src/parsers/base";
import {ConstellationParser, sessionParsers} from "../src/parsers/app/ConstellationParser";


beforeEach(async () => {})
beforeAll(async () => {})
afterEach(async () => { })
afterAll(async () => {})

// test("experiment", async () => {
  // let result : any = {};
  // console.time("parseStart")
  // await parseConsumerAppFileByLine('Alex', '2021-10-28', result);
  // console.timeEnd("parseStart")
  // let commanders = result.constellation.sessions;
  // for (let commanderId in commanders) {
  //   console.log(commanders[commanderId].phases)
  // }
// })

test("Check Constellation Regex correctness", async () => {
  let exportData = {};
  let baseParser = new ConstellationParser(exportData);

  let testString = [
    '1641942051824 - Wed Jan 12 2022 00:00:51 GMT+0100 (CET) - LOGi CONSTELLATION : Commander: Created for target ["61b65886-de3-fab-e46c-efadd9ebb1a"] options: {"commanderId":"4bcdb135-1e8-a597-906d-f64ba48e9bd8","sphereId":"61b65886-de3-fab-e46c-efadd9ebb1a","commandType":"MESH","commandTargets":["61b65886-de3-fab-e46c-efadd9ebb1a"],"private":false,"minConnections":3,"timeout":300}',
    '1641942051830 - Wed Jan 12 2022 00:00:51 GMT+0100 (CET) - LOGi CONSTELLATION : Commander: Loading command trackedDeviceHeartbeat false id: 4bcdb135-1e8-a597-906d-f64ba48e9bd8',
    /** Failed to load Command not available in current logs **/
    '1642147558092 - Fri Jan 14 2022 09:05:58 GMT+0100 (CET) - LOGi CONSTELLATION : BleCommandManager: Loading command {"id":"6102aba7-e00a-fa67-8077-f7abba3c770","minConnections":3,"commanderId":"5e959d8f-b2ae-9dee-80e0-b377511525c","sphereId":"61b65886-de3-fab-e46c-efadd9ebb1a","commandType":"MESH","private":false,"timeout":300,"commandTarget":"61b65886-de3-fab-e46c-efadd9ebb1a","command":{"canBroadcast":false,"type":"registerTrackedDevice","trackingNumber":5,"profileId":0,"rssiOffset":0,"ignoreForPresence":false,"tapToToggleEnabled":false,"deviceToken":11572605,"ttlMinutes":120},"startTime":1642147558089,"linkedId":null,"executedBy":[],"attemptingBy":[],"promise":{"promise":{"_U":0,"_V":0,"_W":null,"_X":null}}}',
    '1641942053201 - Wed Jan 12 2022 00:00:53 GMT+0100 (CET) - LOGi CONSTELLATION : BleCommandManager: Performing command trackedDeviceHeartbeat on 73772CDD-3700-7A89-A94F-8979D7BE8439 25e3da7b-7659-803f-b489-c07978be9f59 ',
    '1641942053398 - Wed Jan 12 2022 00:00:53 GMT+0100 (CET) - LOGi CONSTELLATION : BleCommandManager: Succeeded command trackedDeviceHeartbeat on 73772CDD-3700-7A89-A94F-8979D7BE8439 25e3da7b-7659-803f-b489-c07978be9f59 ',
    '1641970794618 - Wed Jan 12 2022 07:59:54 GMT+0100 (CET) - LOGw CONSTELLATION : BleCommandManager: Something went wrong while performing registerTrackedDevice 1EE094D3-4931-FCDF-7ED9-A29CA6A06998 TIMEOUT a20e50c3-e50c-ba7b-6e6b-7e64e4f2363c',
    '1641970505447 - Wed Jan 12 2022 07:55:05 GMT+0100 (CET) - LOGi CONSTELLATION : BleCommandCleaner: Removed command due to duplicate d92fe286-b67e-6dc-afa7-ca18ee91caf c1e1fb1f-d153-b3f-fcb7-a70bdc32332f registerTrackedDevice MESH 7c5b84bd-8823-16aa-f90b-82a01a79df10',
    '1641994341281 - Wed Jan 12 2022 14:32:21 GMT+0100 (CET) - LOGi CONSTELLATION : BroadcastCommandManager: Loading command for broadcast {"id":"3e7a803a-af03-cd6e-a64e-f96bb9fe807f","commanderId":"b7deffc9-dc2b-63ee-1274-df68af799848","sphereId":"61b65886-de3-fab-e46c-efadd9ebb1a","commandType":"BROADCAST","commandTarget":"BROADCAST","command":{"canBroadcast":true,"type":"setTimeViaBroadcast","time":1641997941.279,"sunriseTime":31706,"sunsetTime":60695,"timeBasedSessionNonce":true},"startTime":1641994341280,"linkedId":null,"executedBy":[],"attemptingBy":[],"promise":{"promise":{"_U":0,"_V":0,"_W":null,"_X":null}}} ',
    '1642003867143 - Wed Jan 12 2022 17:11:07 GMT+0100 (CET) - LOGi CONSTELLATION : BroadcastCommandManager: Scheduling broadcast for later. multiSwitch 94348466-9516-495a-7108-a490ce79a8c ',
    '1642003867159 - Wed Jan 12 2022 17:11:07 GMT+0100 (CET) - LOGi CONSTELLATION : BroadcastCommandManager: Remove item from duplicate queue 0 multiSwitch 94348466-9516-495a-7108-a490ce79a8c ',
    '1642003867228 - Wed Jan 12 2022 17:11:07 GMT+0100 (CET) - LOGi CONSTELLATION : BroadcastCommandManager: broadcasting multiSwitch 4e4a495a-f141-6041-7091-7e7d69cb7afc ',
    '1642003872024 - Wed Jan 12 2022 17:11:12 GMT+0100 (CET) - LOGi CONSTELLATION : BroadcastCommandManager: Successfully broadcast multiSwitch 9644bfb3-242c-149c-a42a-ecd2e9c63e18 ',
    '1642003868981 - Wed Jan 12 2022 17:11:08 GMT+0100 (CET) - LOGi CONSTELLATION : BroadcastCommandManager: Error broadcasting multiSwitch d587c71-c228-9f6d-ad53-e22a5f8aa1a5 BROADCAST_ABORTED ',
    '1642003907664 - Wed Jan 12 2022 17:11:47 GMT+0100 (CET) - LOGi CONSTELLATION : SessionBroker: actually requesting session E9CAA809-8B20-E02C-FCC2-E252D49E8A10 for 3b563a8c-2029-8338-3f8d-14a8df72e530 private false commandType registerTrackedDevice ',
    '1642003916111 - Wed Jan 12 2022 17:11:56 GMT+0100 (CET) - LOGi CONSTELLATION : SessionBroker: Session has connected to 97F4479C-14B3-8643-7C63-8539C33739CD for ae12ef49-ee7d-16c4-808-babb1414452f ',
    /** Require session has thrown an ALREADY_REQUESTED_TIMEOUT not available in current logs **/
    '1641927729430 - Tue Jan 11 2022 20:02:09 GMT+0100 (CET) - LOGi CONSTELLATION : SessionBroker: Session failed to connect: SESSION_REQUEST_TIMEOUT D2A85E70-BD9A-7BEB-6C7C-9ADDE24762F7 for 15197fa6-b4ba-6987-140c-45e5509754d2 ',
    '1641926706267 - Tue Jan 11 2022 19:45:06 GMT+0100 (CET) - LOGi CONSTELLATION : SessionBroker: Session removed from queue 2F062B7E-D878-F49D-34F0-29D3F12A5D3A for 67efb5bd-c53f-ed19-e428-48a1e71e2677 ',
    /** Failed to request session not available in current logs **/
    '1642147660084 - Fri Jan 14 2022 09:07:40 GMT+0100 (CET) - LOGi CONSTELLATION : SessionBroker: Revoke session E9CAA809-8B20-E02C-FCC2-E252D49E8A10 for 6d317e59-75d8-5d97-ae30-16b139e516be',
    '1642010712361 - Wed Jan 12 2022 19:05:12 GMT+0100 (CET) - LOGi CONSTELLATION : SessionBroker: Command finished. 65b5a326-a1e4-7cf2-b506-264bef3bfb67 6b752073-e2af-995e-264c-3d1bb568a07 ',
    '1642006579218 - Wed Jan 12 2022 17:56:19 GMT+0100 (CET) - LOGi CONSTELLATION : SessionManager: SESSION_REQUEST_TIMEOUT Timeout called for  64AD4870-7F58-31F6-13DE-95C39E0B8EF6 4f7d32ca-4dd8-46fe-e77f-a47e206fab ',
    '1642006581171 - Wed Jan 12 2022 17:56:21 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Creating session 849DE420-9335-872C-FABB-AC27D74EE108 356eddaa-5afc ',
    '1642006579221 - Wed Jan 12 2022 17:56:19 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Start connecting to 1CB1314F-B85A-10A0-9540-EEBDD38A8348 af83d456-6b71 ',
    '1642006418822 - Wed Jan 12 2022 17:53:38 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Connected to 1E479EE5-C634-70C5-37A3-1B751561B73E b00cb172-eaa1 ',
    '1642006331380 - Wed Jan 12 2022 17:52:11 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Failed to connect CONNECTION_CANCELLED 755470A9-9C19-72AF-AEF8-7743796D62B4 e26237bc-789a true true ',
    '1642004549566 - Wed Jan 12 2022 17:22:29 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Reinitializing the bootstrapper to reactivate the session 1CB1314F-B85A-10A0-9540-EEBDD38A8348 d56b1bcd-31b1 ',
    '1642004489543 - Wed Jan 12 2022 17:21:29 GMT+0100 (CET) - LOGi CONSTELLATION : Session: performing available command... 11dac486-b1b9-bbe0-97a7-38d595054fe 1E479EE5-C634-70C5-37A3-1B751561B73E 41e5fab7-e72f ',
    '1642004480274 - Wed Jan 12 2022 17:21:20 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Finished available command. 70011b35-9b8d-f7b6-c792-aa43dd018bde 7721FF0B-F6B2-2120-B08B-ED54DF8E9904 148b613c-5964 ',
    '1641927875493 - Tue Jan 11 2022 20:04:35 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Session interrupted 97F4479C-14B3-8643-7C63-8539C33739CD ee7b850f-8402 ',
    '1642010929366 - Wed Jan 12 2022 19:08:49 GMT+0100 (CET) - LOGi CONSTELLATION : Session: killing session requested... CONNECTING D2A85E70-BD9A-7BEB-6C7C-9ADDE24762F7 48097e3f-2f41 ',
    '1642010918906 - Wed Jan 12 2022 19:08:38 GMT+0100 (CET) - LOGi CONSTELLATION : Session: killing session completed 73772CDD-3700-7A89-A94F-8979D7BE8439 2226178e-56ec ',
    '1642010918906 - Wed Jan 12 2022 19:08:38 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Session has ended.. 73772CDD-3700-7A89-A94F-8979D7BE8439 2226178e-56ec ',
    '1642157709617 - Fri Jan 14 2022 11:55:09 GMT+0100 (CET) - LOGi CONSTELLATION : Session: telling the Crownstone to disconnect... 5A1874A7-15DC-74E1-D738-E092078364C3 a548f25-4520 ',
    '1642157587633 - Fri Jan 14 2022 11:53:07 GMT+0100 (CET) - LOGi CONSTELLATION : Session: disconnecting from phone... 5A1874A7-15DC-74E1-D738-E092078364C3 209fdda6-c111 ',
    '1642157587646 - Fri Jan 14 2022 11:53:07 GMT+0100 (CET) - LOGi CONSTELLATION : Session: disconnect done 5A1874A7-15DC-74E1-D738-E092078364C3 209fdda6-c111 ',
    /**Session: Disconnected from Crownstone, Ready for reconnect missing in current logs **/
    '1642113880315 - Thu Jan 13 2022 23:44:40 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Disconnected from Crownstone, ending session... E0D0E1B1-430D-3FF8-2E46-22F4F72FA026 fa5b4aa5-be6 ',
];

  let matches = 0;
  let expected = 0;
  let lastItem = null;
  baseParser.handleParseResult = (item, parser, parseResult) => {
    // console.log(parseResult);
    matches++;
    if (matches !== expected) {
      console.log("FAILED", lastItem[1])
    }
    expect(matches).toBe(expected);
  }

  for (let string of testString) {
    expected++;
    let item = [123, string];
    baseParser.load(item);
    lastItem = item;
  }

  expect(matches).toBe(testString.length)
})


test("Check Constellation Regex correctness 2", async () => {
  let exportData = {};
  let baseParser = new ConstellationParser(exportData);

  let testString = [
    '1642092969268 - Thu Jan 13 2022 17:56:09 GMT+0100 (CET) - LOGi CONSTELLATION : Session: Failed to connect UNKNOWN ERROR IN connect Error Domain=CBErrorDomain Code=6 "The connection has timed out unexpectedly." UserInfo={NSLocalizedDescription=The connection has timed out unexpectedly.} uuid:4F86C1BE-06EB-493D-A3B7-0A02483003C4 A35D3C74-334E-4CFD-916D-DB9BB4F54938 23d3fa2f-cc6e false false'
  ];

  let matches = 0;
  let expected = 0;
  let lastItem = null;
  baseParser.handleParseResult = (item, parser, parseResult) => {
    console.log(parseResult);
    matches++;
    if (matches !== expected) {
      console.log("FAILED", lastItem[1])
    }
    expect(matches).toBe(expected);
  }

  for (let string of testString) {
    expected++;
    let item = [123, string];
    baseParser.load(item);
    lastItem = item;
  }

  expect(matches).toBe(testString.length)
})