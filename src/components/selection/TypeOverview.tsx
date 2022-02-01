import {colors} from "../../styles/colors";
import {Button, Grid} from "@mui/material";
import React from "react";
import { AnimatedGrid } from "../animating/AnimatedGrid";

export function TypeContainer(props) {
  let phase = props.phase;

  return (
    phase >= 1 && <AnimatedGrid item style={{minHeight: '100vh', maxWidth: '40vw', flex: phase === 1 ? 1 : 0, backgroundColor: phase === 1 ? colors.white.hex : colors.green.hex}}>
    {
      phase === 1 ? <Grid style={{padding:10}}>
        <TypeOverview select={props.select}/>
      </Grid> : <div />
    }
  </AnimatedGrid>
)
}

export function TypeOverview(props) {
  return (
    <Grid container flexDirection={'column'}>
      <h1>Select type of visualization</h1>
      <Grid item ml={2}>
        <Button onClick={() => { props.select('Constellation')}}>Constellation</Button>
      </Grid>
      <Grid item ml={2}>
        <Button onClick={() => { props.select('Cloud')}}>Cloud</Button>
      </Grid>
      <Grid item ml={2}>
        <Button onClick={() => { props.select('Notifications')}}>Notifications</Button>
      </Grid>
      <Grid item ml={2}>
        <Button onClick={() => { props.select('BluenetPromises')}}>BluenetPromises</Button>
      </Grid>
      <Grid item ml={2}>
        <Button onClick={() => { props.select('Connections')}}>Connections</Button>
      </Grid>
    </Grid>
  )
}
