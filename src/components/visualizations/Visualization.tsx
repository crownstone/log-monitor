import React from "react";
import {Constellation} from "./Constellation";
import {Cloud} from "./Cloud";
import {Notifications} from "./Notifications";

export function Visualization({user, date, type, part, parts}) {
  switch (type) {
    case "Constellation":
      return <Constellation user={user} date={date} part={part} parts={parts} />
    case "Cloud":
      return <Cloud user={user} date={date} part={part} parts={parts} />
    case "Notifications":
      return <Notifications user={user} date={date} part={part} parts={parts} />
    default:
      return <div>Not implemented yet..</div>
  }
}