import {EventBusClass} from "../util/EventBus";
import {Util} from "../util/Util";
import {DataFlowManagerEvents} from "./DataFlowManager_events";

export class AppStateDataFlowManager extends DataFlowManagerEvents {

  options : any;
  groupWidth : number;

  constructor(eventBus : EventBusClass, options : UptimeConfig = {}, groupWidth: number = 300) {
    super(eventBus);
    this.options = options?.dataflow ?? {};
    this.groupWidth = groupWidth;
  }

  itemThreshold = 100000;
  priority = [
    "appState",
  ]

  loadSpecificData(data: ParseDataResult) {
    let states = data?.appState ?? []

    if (!this.rangeDataGroups['appState']) { this.rangeDataGroups['appState'] = []; }

    let prevState = null;

    function getClass(state) {
      switch (state) {
        case "active":
          return "green"
        case "inactive":
          return "orange"
        case "background":
          return "blue"
        default:
          return "gray"
      }
    }

    for (let appState of states) {
      if (prevState === null) {
        this.rangeDataGroups['appState'].push({
          start:     Util.setToMidnight(appState.t),
          end:       appState.t,
          content:   "UNKNOWN",
          className: 'gray',
          group:     "appState",
        });

        prevState = appState;
        continue;
      }

      this.rangeDataGroups['appState'].push({
        start:     prevState.t,
        end:       appState.t,
        content:   prevState.state,
        className: getClass(prevState.state),
        group:     "appState",
      });

      prevState = appState;
      this.startTime = Math.min(this.startTime, appState.t);
      this.endTime = Math.max(this.endTime, appState.t);
    }

    if (prevState) {
      this.rangeDataGroups['appState'].push({
        start: prevState.t,
        end: Util.setToMidnight(prevState.t) + 24 * 3600e3,
        content: prevState.state,
        className: getClass(prevState.state),
        group: "appState",
      });
    }


    this.loadReboots(data)


    this.groupDataSet.update({id: 'appState', content: 'App background state', style:`width: ${this.groupWidth}px`});
  }

}
