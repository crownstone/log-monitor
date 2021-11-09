import React from "react";
import {Constellation} from "./Constellation";
import {Cloud} from "./Cloud";

export function Visualization({user, date, type}) {
  switch (type) {
    case "Constellation":
      return <Constellation user={user} date={date} />
    case "Cloud":
      return <Cloud user={user} date={date} />
    default:
      return <div>Not implemented yet..</div>
  }
}