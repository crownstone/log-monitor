import React from "react";
import {Constellation} from "./Constellation";

export function Visualization({user, date}) {
  return (
    <Constellation user={user} date={date} />
  )
}