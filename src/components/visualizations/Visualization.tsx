import React from "react";
import {Constellation} from "./Constellation";

export function Visualization({user, date, showSettings, showHelp}) {
  return (
    <Constellation user={user} date={date} showSettings={showSettings} showHelp={showHelp}/>
  )
}