import {colors} from "../../styles/colors";
import {Button, Grid} from "@mui/material";
import React from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { AnimatedGrid } from "../animating/AnimatedGrid";

export function LogOverview(props) {
  let items = [];
  let phase = props.phase
  for (let user in props.logs) {
    items.push(<UserLogContainer
      key={user}
      userName={user}
      dates={props.logs[user]}

      selectedUser={props.user}
      selectedDate={props.date}

      selectUser={props.selectUser}
      selectDate={props.selectDate}
    />)
  }

  return (
    <AnimatedGrid item style={{minHeight: '100vh', maxWidth: '40vw', flex: phase === 0 ? 1 : 0, backgroundColor: phase === 0 ? colors.white.hex : colors.green.hex}}>
      {
        phase === 0 ? <Grid style={{padding:10}}>
          <h1>Select the user and date visualize the logs</h1>
          {items}
        </Grid> : <div />
      }
    </AnimatedGrid>
  )
}



function UserLogContainer(props) {
  let open = false;
  if (props.selectedUser === props.userName) {
    open = true;
  }
  return (
    <Grid container flexDirection={"column"} style={{padding:10}}>
      <Grid item onClick={() => { if (open) { props.selectUser(null); } else { props.selectUser(props.userName); } }}>
        <Button variant="outlined" startIcon={open ? <ArrowDropDownIcon /> : <ArrowRightIcon />}>
          {props.userName}
        </Button>
      </Grid>
      { open && props.dates.map((date) => { return (
        <Grid key={date} item onClick={() => { props.selectDate( date) }} ml={2}>
          <Button variant="text" startIcon={<ArrowRightIcon />}>
            {date}
          </Button>
        </Grid>
      )
      })}
    </Grid>
  )
}
