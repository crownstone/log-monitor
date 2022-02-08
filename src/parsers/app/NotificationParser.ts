import {BaseParser, fromJSON} from "./BaseParser";
import {Util} from "../../util/Util";

let notificationParsers : parserData[] = [
  {type:'notification',  label:'notification_received',  mapping:[{notification:fromJSON}], regex:/NotificationHandler: Received notification\W*({.*})/},
]

class NotificationCollector {

  data : any = {};

  collect(item, parser, parseResult: any) {
    if (parser.label === "notification_received") {
      let notification = parseResult.notification;
      let type = notification?.command ?? notification?.data?.command;
      if (!this.data[type]) { this.data[type] = []; }
      this.data[type].push({id: Util.getShortUUID(), t: item[0], content: notification})
    }
  }
}

export class NotificationParser extends BaseParser {

  collector = new NotificationCollector()

  load(item) {
    for (let parser of notificationParsers) {
      if (this.search(item, parser)) {
        break;
      }
    }
  }

  export() {
    this._exportData['notifications'] = {
      notifications: this.collector.data,
    };
  }


  handleParseResult(item, parser, parseResult) {
    if (parser.type === 'notification') {
      this.collector.collect(item, parser, parseResult);
    }
  }

}
