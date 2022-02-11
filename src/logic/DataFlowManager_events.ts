import {DataFlowManagerBase} from "./DataFlowManagerBase";
import {EventBusClass} from "../util/EventBus";

export class DataFlowManagerEvents extends DataFlowManagerBase {

  options: DataFlowOptions

  constructor(eventBus : EventBusClass, options : DataFlowConfig = {}) {
    super(eventBus);
    this.options = options?.dataflow ?? {};
  }


  loadReboots(data: ParseDataResult) {
    let reboots = data.reboots;

    this.eventDataGroups['reboots'] = [];
    if (!reboots) { return }
    for (let reboot of reboots) {
      let markerId = 'reboot' + reboot[1];
      this.eventDataGroups['reboots'].push({id: markerId, time: reboot[0], content: 'Reboot'})
    }
  }

  loadLocalization(data: ParseDataResult) {
    let localization = data.localization;
    this.eventDataGroups['localization'] = [];
    if (!localization) { return }
    let localizationCount = 0;


    if (this.options.showRoomLocalization === true) {
      for (let localizationData of localization.locations) {
        let markerId = 'localization' + localizationCount++;
        let locationName = data.nameMap?.locationIdMap?.[localizationData.data.locationId]?.name || localizationData.data.locationId;
        this.eventDataGroups['localization'].push({id: markerId, time: localizationData.time, content: locationName})
      }
    }

    if (this.options.showSphereLocalization === true) {
      for (let localizationData of localization.spheres) {
        let markerId = 'sphere' + localizationCount++;
        let sphereName = data.nameMap?.sphereIdMap?.[localizationData.data.sphereId]?.name || localizationData.data.sphereId;
        this.eventDataGroups['localization'].push({id: markerId, time: localizationData.time, content: localizationData.label + "<br/>" + sphereName})
      }
    }
  }

  loadStartEndTimes(data: ParseDataResult) {
    this.eventDataGroups['startTime'] = data.startTime;
    this.eventDataGroups['endTime']   = data.endTime;
  }

}