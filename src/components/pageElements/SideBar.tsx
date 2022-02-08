import {AnimatedGrid} from "../animating/AnimatedGrid";
import {colors} from "../../styles/colors";
import {Button, Grid} from "@mui/material";
import {AppRegistration, HelpOutline, Settings, TextSnippet} from "@mui/icons-material";
import React from "react";

export function SideBar(props) {
  let minWidth = 90;
  let phase = props.phase;

  return (
    <AnimatedGrid item style={{height:'100vh', width: minWidth, backgroundColor: colors.darkGray.hex}}>
      <AnimatedGrid
        fast={true}
        flexDirection={'column'}
        container
        style={{display: phase === 0 ? 'none' : 'block', padding:10, opacity: phase > 0 ? 1 : 0, width: minWidth, height: '100vh'}}>
        <Grid item>
          <Button variant={"contained"} color={"secondary"} onClick={() => { props.clearFileData();  }}>
            <TextSnippet fontSize={'large'}/>
          </Button>
        </Grid>
        <AnimatedGrid item style={{opacity: phase > 1 ? 1 : 0}}>
          <Button variant={"contained"} color={"secondary"} onClick={() => { props.clearTypeData(); }} style={{marginTop:15}}>
            <AppRegistration fontSize={'large'}/>
          </Button>
          <Button variant={"contained"} color={"secondary"} onClick={() => { props.viz.settings(); }} style={{marginTop:15}}>
            <Settings fontSize={'large'}/>
          </Button>
          <Button variant={"contained"} color={"secondary"} onClick={() => { props.viz.help(); }} style={{marginTop:15}}>
            <HelpOutline fontSize={'large'}/>
          </Button>
        </AnimatedGrid>
      </AnimatedGrid>
    </AnimatedGrid>
  );
}
