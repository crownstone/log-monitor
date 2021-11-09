import React, {useState} from "react";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {SessionTimeline} from "../timelines/SessionTimeline";
import {CommanderTimeline} from "../timelines/CommanderTimeline";
import {Util} from "../../util/Util";
import {VisualizationBase} from "./VisualizationBase";


function getConstellationConfig() : ConstellationConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  }
}

export class Constellation extends VisualizationBase {

  config: ConstellationConfig = getConstellationConfig();

  constructor(props) {
    super(props, 'constellation')
  }


  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <SessionTimeline   data={this.data} eventBus={this.eventBus} />
          <CommanderTimeline data={this.data} eventBus={this.eventBus} config={this.config} />
          <Backdrop open={this.state.showConfig} style={{zIndex:99999}} onClick={() => { this.setState({showConfig: false})}}>
            <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '50vw'}} onClick={(event) => { event.stopPropagation() }}>
              <ConstellationSettings
                config={this.config}
                close={(config) => {
                  Util.deepExtend(this.config, config)
                  this.storeConfig();
                  this.setState({showConfig:false});
                }}/>
            </Paper>
          </Backdrop>

          <Backdrop open={this.state.showHelp} style={{zIndex:99999}} onClick={() => { this.setState({showHelp: false})}}>
            <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '50vw'}} onClick={(event) => { event.stopPropagation() }}>
              <ConstellationHelp />
            </Paper>
          </Backdrop>
        </Grid>
      );
    }
    else if (this.state.loadedData) {
      return (
        <Grid item style={{display:'flex', height:'100vh', flex:1, justifyContent:'center', alignItems:'center'}}>
          <CircularProgress size={100} color={'secondary'}  style={{padding:10}} />
          Drawing data....
        </Grid>
      )
    }
    return (
      <Grid item style={{display:'flex', height:'100vh', flex:1, justifyContent:'center', alignItems:'center'}}>
        <CircularProgress size={100} color={'primary'} style={{padding:10}}/>
        Getting data....
      </Grid>
    )
  }
}



function ConstellationSettings(props) {
  let [sphereLevelLocalization, setSphereLevelLocalization] = useState(props.config.dataflow.showSphereLocalization);
  let [roomLevelLocalization,   setRoomLevelLocalization]   = useState(props.config.dataflow.showRoomLocalization);

  return (
    <FormGroup>
      <h1>Constellation visualization settings</h1>
      <FormControlLabel control={
        <Checkbox
          onChange={() => { setSphereLevelLocalization(!sphereLevelLocalization)}}
          checked={sphereLevelLocalization}
        />}
        label="Show sphere level localization"
      />
      <FormControlLabel control={
        <Checkbox
          onChange={() => { setRoomLevelLocalization(!roomLevelLocalization)}}
          checked={roomLevelLocalization}
        />}
        label="Show room level localization"
      />
      <Button
        onClick={() => { props.close({
          dataflow: {
            showSphereLocalization: sphereLevelLocalization,
            showRoomLocalization: roomLevelLocalization,
          }
        })}}
      >Save</Button>
    </FormGroup>
  )
}

function ConstellationHelp(props) {
  return (
    <div>
      <h1>Constellation visualization help</h1>
      None yet.
    </div>
  )
}