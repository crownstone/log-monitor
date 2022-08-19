import {DataFlowManagerEvents} from "./DataFlowManager_events";

export class StoreDataFlowManager extends DataFlowManagerEvents {

  itemThreshold = 1000;
  priority = [
    "store",
  ]

  loadSpecificData(data: ParseDataResult) {
    let actions = data?.store?.actions ?? [];
    let groups = {}

    let index = 0;
    for (let data of actions) {
      let rendergroup = 'store';
      if (this.rangeDataGroups[rendergroup] === undefined) { this.rangeDataGroups[rendergroup] = []; }
      let subType = data.action.type;
      if (data.action.type === "BATCHING_REDUCER.BATCH") {
        let subIndex = 0;
        for (let batchAction of data.action.payload) {
          subType = batchAction.type;
          groups[subType] = {id: subType, content: subType, style:'width: 430px'};
          this.rangeDataGroups[rendergroup].push({id: `${subType}____${index}.${subIndex}`, start: data.t, end: data.t + 150, group: subType});
          subIndex++;
        }
      }
      else {
        groups[subType] = {id: subType, content: subType, style:'width: 430px'};
        this.rangeDataGroups[rendergroup].push({id: `${subType}____${index}`, start: data.t, end: data.t + 150, group: subType});
      }

      this.startTime = Math.min(this.startTime, data.t);
      this.endTime = Math.max(this.endTime, data.t);
      index++;
    }

    this.loadReboots(data);
    this.loadStartEndTimes(data);
    this.loadLocalization(data);

    for (let key in this.rangeDataGroups) {
      this.rangeDataGroups[key].sort((a,b) => { return a.end - b.end})
    }

    this.groupDataSet.update(Object.values(groups));
  }

}
