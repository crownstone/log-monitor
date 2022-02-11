import {EventBusClass} from "../util/EventBus";
import {DataFlowManagerEvents} from "./DataFlowManager_events";
import {Util} from "../util/Util";

export class SphereDataFlowManager extends DataFlowManagerEvents {

  options : any;

  constructor(eventBus : EventBusClass, options : any = {}) {
    super(eventBus);
    this.options = {showSphereLocalization:true};
  }

  itemThreshold = 100000;
  priority = [
    "sphere",
  ]

  loadSpecificData(data: ParseDataResult) {
    if (!this.rangeDataGroups['sphere']) { this.rangeDataGroups['sphere'] = []; }

    function getSphereName(localizationData) {
      sphereName = data.nameMap?.sphereIdMap?.[localizationData.data.sphereId]?.name || localizationData.data.sphereId;
      return sphereName;
    }

    let sphereName = null;

    let inSpheres = {};
    let firstSphereFound = false

    for (let localizationData of data.localization.spheres) {
      let sphereId = localizationData.data.sphereId;

      if (firstSphereFound === false && localizationData.label === "enter_sphere") {
        this.rangeDataGroups['sphere'].push({
          start:     Util.setToMidnight(localizationData.time),
          end:       localizationData.time,
          content:   "UNKNOWN",
          className: 'gray',
          group:     "sphere",
        });
        firstSphereFound = true;
        inSpheres[sphereId] = localizationData;
        continue;
      }

      if (localizationData.label === "enter_sphere") {
        inSpheres[sphereId] = localizationData;
      }
      else if (localizationData.label === 'exit_sphere') {
        if (inSpheres[sphereId] !== undefined) {
          this.rangeDataGroups['sphere'].push({
            start:     inSpheres[sphereId].time,
            end:       localizationData.time,
            content:   getSphereName(localizationData),
            className: 'green',
            group:     "sphere",
          });
        }
        delete inSpheres[localizationData.data.sphereId];
      }

      this.startTime = Math.min(this.startTime, localizationData.time);
      this.endTime = Math.max(this.endTime,     localizationData.time);
    }

    console.log(inSpheres)
    for (let inSphereId in inSpheres) {
      let localizationData = inSpheres[inSphereId];
      this.rangeDataGroups['sphere'].push({
        start: localizationData.time,
        end: Util.setToMidnight(localizationData.time) + 24 * 3600e3,
        content: getSphereName(localizationData),
        className: 'green',
        group: "sphere",
      });
    }

    this.groupDataSet.update({id: 'sphere', content: 'Sphere presence', style:'width: 300px'});
  }

}
