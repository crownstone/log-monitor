import {colors} from "../../styles/colors";
import {Button, Grid} from "@mui/material";
import React from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { AnimatedGrid } from "../animating/AnimatedGrid";
import {CloudOff} from "@mui/icons-material";

export function LogOverview(props) {
  let items = [];
  let phase = props.phase
  for (let user in props.logs) {
    items.push(<UserLogContainer
      key={user}
      userName={user}
      logData={props.logs[user]}

      selectedUser={props.user}
      selectedDate={props.date}

      selectUser={props.selectUser}
      selectItem={props.selectItem}
      removeProcessedData={props.removeProcessedData}
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
      { open && props.logData.map((itemData: {date: string, processed: boolean, size: number, part? : number, parts?: number}) => {
        let label = `${itemData.date} (${itemData.size} MB)`;
        if (itemData.part !== undefined) {
          label += ` part ${itemData.part + 1}`
        }
        return (
        <Grid container key={itemData.date + itemData.part} item ml={2}>
          <Grid container flexDirection={"row"}>
            <Grid item xl={5} onClick={() => { props.selectItem( itemData.date, itemData.part, itemData.parts ) }} >
              <Button variant="text" startIcon={<ArrowRightIcon />}>
                {label}
              </Button>
            </Grid>

          { itemData.processed &&
              <Grid item xl={7} onClick={() => { props.removeProcessedData( itemData.date, itemData.part, ) }} >
                <Button variant="text" aria-label={"Remove cached data"}>
                  <CloudOff />
                </Button>
              </Grid>
          }
          </Grid>
        </Grid>
      ) 
      })}
    </Grid>
  )
}
