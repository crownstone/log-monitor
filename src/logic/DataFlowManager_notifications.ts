import {DataFlowManagerEvents} from "./DataFlowManager_events";

export class NotificationsDataFlowManager extends DataFlowManagerEvents {

  count = {}

  itemThreshold = 1000;
  priority = [
    "other_notifications",
  ]

  loadSpecificData(data: ParseDataResult) {
    let notifications = data?.notifications?.notifications ?? {};
    let groups = {}

    this.count = {}

    for (let type in notifications) {
      this.count[type] = notifications[type].length;
      for (let notification of notifications[type]) {
        let commandType = type;
        let userId = notification.content?.userId || notification.content?.data?.userId;
        let subType = commandType;
        let rendergroup = 'other_notifications';
        switch (commandType) {
          case "setSwitchStateRemotely":
            break;
          case "userExitSphere":
            subType += `_${userId}`; break;
          case "userEnterSphere":
            subType += `_${userId}`; break;
          case "userEnterLocation":
            subType += `_${userId}`; break;
          case "userExitLocation":
            subType += `_${userId}`; break;
        }
        groups[subType] = {id: subType, content: subType, style:'width: 430px'};

        if (this.rangeDataGroups[rendergroup] === undefined) { this.rangeDataGroups[rendergroup] = []; }

        this.rangeDataGroups[rendergroup].push({id: notification.id, start: notification.t, end: notification.t + 2, group: subType});
      }
    }

    for (let key in this.rangeDataGroups) {
      this.rangeDataGroups[key].sort((a,b) => { return a.start - b.start})
    }
    this.loadReboots(data);
    this.loadStartEndTimes(data);
    this.loadLocalization(data);
    this.groupDataSet.update(Object.values(groups));
  }

}
