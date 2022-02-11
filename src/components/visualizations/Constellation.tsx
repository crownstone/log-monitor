import React, {CSSProperties, useState} from "react";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {SessionTimeline} from "../timelines/SessionTimeline";
import {CommanderTimeline} from "../timelines/CommanderTimeline";
import {Util} from "../../util/Util";
import {VisualizationBase} from "./VisualizationBase";
import {AppStateTimeline} from "../timelines/AppStateTimeline";
import {SphereTimeline} from "../timelines/SphereTimeline";
import {ScanningTimeline} from "../timelines/ScanningTimeline";


function getConstellationConfig() : ConstellationConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  }
}

export class Constellation extends VisualizationBase<ConstellationConfig> {


  constructor(props) {
    super(props, 'constellation')
    if (this.config === undefined) {
      this.config = getConstellationConfig();
    }
  }


  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <ScanningTimeline
            data={this.data}
            eventBus={this.eventBus}
            dataCallback={() => {}}
            config={this.config}
          />
          <SphereTimeline
            data={this.data}
            eventBus={this.eventBus}
            dataCallback={() => {}}
            config={this.config}
          />
          <AppStateTimeline
            data={this.data}
            eventBus={this.eventBus}
            dataCallback={() => {}}
            config={this.config}
          />
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
  let blockStyle : CSSProperties = {position:'inherit', width:40, height:20, display:'block', float:'left'};
  let blockContainerStyle : CSSProperties = {height:20, paddingTop:5}
  return (
    <div>
      <h1>Constellation visualization help</h1>
      <p>This visualization is divided into 2 parts. A Session timeline on top, and a commander timeline on the bottom.</p>
      <h3>Sessions</h3>
      <p>The session timeline shows the session in multiple phases in order of priority:</p>
      <div style={blockContainerStyle}>
        <div className={"vis-item ERROR"} style={blockStyle} />
        <span style={{paddingLeft:5}}>Error occurred.</span>
      </div>
      <div style={blockContainerStyle}>
        <div className={"vis-item connectingFailed"} style={blockStyle} />
        <span style={{paddingLeft:5}}>Connecting failed.</span>
      </div>
      <div style={blockContainerStyle}>
        <div className={"vis-item commandExecuted"} style={blockStyle} />
        <span style={{paddingLeft:5}}>Command executed.</span>
      </div>
      <div style={blockContainerStyle}>
        <div className={"vis-item connected"} style={blockStyle} />
        <span style={{paddingLeft:5}}>Connected.</span>
      </div>
      <div style={blockContainerStyle}>
        <div className={"vis-item connecting"} style={blockStyle} />
        <span style={{paddingLeft:5}}>Connecting...</span>
      </div>
      <div style={blockContainerStyle}>
        <div className={"vis-item unconnected"} style={blockStyle} />
        <span style={{paddingLeft:5}}>Requested, unconnected.</span>
      </div>
      <p>Since there can be many items in the logs, the items are drawn according to priority. This means all the errors are shown first, and more will come in the more you zoom in.</p>
      <h3>Commanders</h3>
      <p>The commanders are things that generate commands, which request sessions. These are separated into shared, private and broadcast.</p>
      <p>The commander timeline can cluster commanders together, which will pop open when you zoom in.</p>
    </div>
  )
}