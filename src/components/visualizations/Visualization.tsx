import React from "react";
import {Constellation}   from "./Constellation";
import {Cloud}           from "./Cloud";
import {Notifications}   from "./Notifications";
import {BluenetPromises} from "./BluenetPromises";
import {UptimeVisualization} from "./Uptime";

export function Visualization(props : {
  user?:   string,
  date?:   string,
  type?:   string,
  part?:   number,
  parts?:  number,
  path?:   string,
  stream?: boolean
}) {
  switch (props.type) {
    case "Constellation":
      return <Constellation {...props} />
    case "Cloud":
      return <Cloud {...props} />
    case "Notifications":
      return <Notifications {...props} />
    case "BluenetPromises":
      return <BluenetPromises {...props} />
    case "ScanningAndUptime":
      return <UptimeVisualization {...props} />
    default:
      return <div>Not implemented yet..</div>
  }
}