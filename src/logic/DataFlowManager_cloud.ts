import {DataFlowManagerEvents} from "./DataFlowManager_events";

export class CloudDataFlowManager extends DataFlowManagerEvents {

  itemThreshold = 1000;
  priority = [
    "cloud",
  ]

  loadSpecificData(data: ParseDataResult) {
    let cloudItem;
    let cloud = data?.cloud?.requests ?? {};
    let syncs = data?.cloud?.syncs ?? [];
    let groups = {}


    if (!this.rangeDataGroups['cloud']) { this.rangeDataGroups['cloud'] = []; }
    if (!this.rangeDataGroups['syncs']) { this.rangeDataGroups['syncs'] = []; }

    for (let cloudId in cloud) {
      cloudItem = cloud[cloudId];

      let url = cloudItem.request.url.replace(/([\w]{24})/g,"{id}")
      if (cloudItem.url2) {
        url = cloudItem.reply.url.replace(/([\w]{24})/g,"{id}")
      }
      url = url.replace("https://cloud.crownstone.rocks/api/",'')
      url = url.replace("https://next.crownstone.rocks/api/",'NEXT/')
      url = url.replace(/\\"/g,'"')
      url = url.replace(/%3A/g,':')
      url = decodeURI(url)

      groups[url] = {id: url, content: url, style:'width: 430px'};

      let className = 'performedCommandSuccess';
      let endTime = cloudItem.tEnd;
      if (!endTime) {
        endTime = cloudItem.tStart + 1000;
        className = 'performedCommandFailed';
      }

      this.rangeDataGroups['cloud'].push({id: cloudId, start: cloudItem.tStart, end: endTime, group: url, className});

      this.startTime = Math.min(this.startTime, cloudItem.tStart);
      this.endTime = Math.max(this.endTime, cloudItem.tEnd);
    }

    groups['cloud'] = {id: 'syncs', content: 'Sync sessions', style:'width: 430px'};
    for (let sync of syncs) {
      let className = 'performedCommandSuccess';
      if (sync.error) {
        className = 'performedCommandFailed';
      }
      this.rangeDataGroups['cloud'].push({start: sync.tStart, end: sync.tEnd, group: 'syncs', className});
    }
    this.loadReboots(data);
    this.loadStartEndTimes(data);


    for (let key in this.rangeDataGroups) {
      this.rangeDataGroups[key].sort((a,b) => { return a.end - b.end})
    }
    this.groupDataSet.add(Object.values(groups));
  }

}
