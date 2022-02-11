import {EventBusClass} from "../util/EventBus";
import {DataFlowManagerEvents} from "./DataFlowManager_events";
import {Util} from "../util/Util";

export class ScanningDataFlowManager extends DataFlowManagerEvents {

  options : any;

  constructor(eventBus : EventBusClass, options : any = {}) {
    super(eventBus);
    this.options = {showSphereLocalization:true};
  }

  itemThreshold = 100000;
  priority = [
    "scanning",
  ]

  loadSpecificData(data: ParseDataResult) {
    let states = data?.scanning ?? []

    if (!this.rangeDataGroups['scanning']) { this.rangeDataGroups['scanning'] = []; }

    let prevState = null;

    function getClass(state) {
      switch (state) {
        case "scanningStart":
          return "green"
        case "batterySavingStart":
          return "blue"
        default:
          return "gray"
      }
    }

    for (let scanningState of states) {
      if (prevState === null) {
        this.rangeDataGroups['scanning'].push({
          start:     Util.setToMidnight(scanningState.t),
          end:       scanningState.t,
          content:   "UNKNOWN",
          className: 'gray',
          group:     "scanning",
        });

        prevState = scanningState;
        continue;
      }

      this.rangeDataGroups['scanning'].push({
        start:     prevState.t,
        end:       scanningState.t,
        content:   prevState.state,
        className: getClass(prevState.state),
        group:     "scanning",
      });

      prevState = scanningState;
      this.startTime = Math.min(this.startTime, scanningState.t);
      this.endTime = Math.max(this.endTime,    scanningState.t);
    }

    if (prevState) {
      this.rangeDataGroups['scanning'].push({
        start: prevState.t,
        end: Util.setToMidnight(prevState.t) + 24 * 3600e3,
        content: prevState.state,
        className: getClass(prevState.state),
        group: "scanning",
      });
    }

    this.groupDataSet.update({id: 'scanning', content: 'Scanning state', style:'width: 300px'});
  }

}
