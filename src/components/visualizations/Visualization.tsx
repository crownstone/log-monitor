import React from "react";
import {Constellation}   from "./Constellation";
import {Cloud}           from "./Cloud";
import {Notifications}   from "./Notifications";
import {BluenetPromises} from "./BluenetPromises";

export function Visualization(props : {user?: string, date?: string, type?: string, part?: number, parts?: number, path?: string}) {
  switch (props.type) {
    case "Constellation":
      return <Constellation user={props.user} date={props.date} part={props.part} parts={props.parts} path={props.path} />
    case "Cloud":
      return <Cloud user={props.user} date={props.date} part={props.part} parts={props.parts} path={props.path} />
    case "Notifications":
      return <Notifications user={props.user} date={props.date} part={props.part} parts={props.parts} path={props.path} />
    case "BluenetPromises":
      return <BluenetPromises user={props.user} date={props.date} part={props.part} parts={props.parts} path={props.path} />
    default:
      return <div>Not implemented yet..</div>
  }
}