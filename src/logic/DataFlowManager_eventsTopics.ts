import {DataFlowManagerBase} from "./DataFlowManagerBase";
import {EventBusClass} from "../util/EventBus";

export class EventsTopicsDataFlowManager extends DataFlowManagerBase {

  options : any;
  busType: string;

  constructor(eventBus : EventBusClass, options : EventsConfig = {}, busType: string) {
    super(eventBus);
    this.options = options?.dataflow ?? {};
    this.busType = busType;
  }

  itemThreshold = 100000;
  priority = [
    "count",
  ]

  loadSpecificData(data: ParseDataResult) {
    let eventData = data?.eventBus?.[this.busType]

    if (this.graphDataGroups['count'] === undefined) { this.graphDataGroups['count'] = []; }

    let groups = {};
    let maxValues = {};
    let maxValueArr = [];
    let threshold = 5;

    if (Object.keys(eventData.topics).length > 10) {
      for (let topic in eventData.topics) {
        for (let count of eventData.topics[topic]) {
          maxValues[topic] = Math.max(maxValues[topic] ?? 0, Number(count.y));
        }
      }

      for (let topic in maxValues) {
        maxValueArr.push({topic: topic, max: maxValues[topic]})
      }

      maxValueArr.sort((a,b) => { return b.max - a.max});

      threshold = maxValueArr[10].max;
    }


    for (let topic in eventData.topics) {
      if (maxValues[topic] && maxValues[topic] < threshold) { continue; }

      groups[topic] = {
        id: topic,
        content: `${this.busType}:${topic}`,
        options: { drawPoints: { style: "circle", size: 4 } }
      };
      for (let count of eventData.topics[topic]) {
        this.graphDataGroups['count'].push({x: count.t, y: Number(count.y), group: topic});
      }
    }

    console.log(this.busType, "Tried to show ", Object.keys(groups).length, 'topics', groups)

    this.groupDataSet.update(Object.values(groups));
  }

}
