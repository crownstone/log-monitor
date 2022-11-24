import React from "react";
import {Constellation}   from "./Constellation";
import {Cloud}           from "./Cloud";
import {Store}           from "./Store";
import {Notifications}   from "./Notifications";
import {BluenetPromises} from "./BluenetPromises";
import {UptimeVisualization} from "./Uptime";
import {Events} from "./Events";

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
    case "Store":
      return <Store {...props} />
    case "Notifications":
      return <Notifications {...props} />
    case "BluenetPromises":
      return <BluenetPromises {...props} />
    case "ScanningAndUptime":
      return <UptimeVisualization {...props} />
    case "Events":
      return <Events {...props} />
    default:
      return <div>Not implemented yet..</div>
  }
}