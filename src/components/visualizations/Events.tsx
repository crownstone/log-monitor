import React, {CSSProperties, useState} from "react";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {Util} from "../../util/Util";
import {VisualizationBase} from "./VisualizationBase";
import {EventTotalCountGraph} from "../timelines/EventTotalCountGraph";
import {ScanningTimeline} from "../timelines/ScanningTimeline";
import {SphereTimeline} from "../timelines/SphereTimeline";
import {AppStateTimeline} from "../timelines/AppStateTimeline";
import {EventTopicCountGraph} from "../timelines/EventTopicCountGraph";


function getEventsConfig() : EventsConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  }
}

export class Events extends VisualizationBase<EventsConfig> {

  expandedBusses = {};

  constructor(props) {
    super(props, 'events')
    if (this.config === undefined) {
      this.config = getEventsConfig();
    }
  }

  getBusData() {
    let result = [];

    let skipBusses = {
      NativeBus:                true,
      EventBus_mainSingleton:   true,
      EventBus_NativeBusMirror: true,
    };


    if (this.data.eventBus['EventBus_mainSingleton']) {
      result.push(
        <EventTotalCountGraph
          key={'EventBus_mainSingleton'}
          data={this.data}
          eventBus={this.eventBus}
          config={this.config}
          bus={'EventBus_mainSingleton'}
        />
      );
      result.push(
        <EventTopicCountGraph
          key={'EventBus_mainSingleton_topics'}
          data={this.data}
          eventBus={this.eventBus}
          config={this.config}
          bus={'EventBus_mainSingleton'}
        />
      );
    }


    if (this.data.eventBus['NativeBus']) {
      result.push(
        <EventTotalCountGraph
          key={'NativeBus'}
          data={this.data}
          eventBus={this.eventBus}
          config={this.config}
          bus={'NativeBus'}
        />
      );
      result.push(
        <EventTopicCountGraph
          key={'NativeBus_topics'}
          data={this.data}
          eventBus={this.eventBus}
          config={this.config}
          bus={'NativeBus'}
        />
      );
    }


    for (let bus in this.data.eventBus) {
      console.log("Drawing bus", bus)
      if (skipBusses[bus]) { continue; }

      result.push(
        <EventTotalCountGraph
          key={bus}
          data={this.data}
          eventBus={this.eventBus}
          config={this.config}
          bus={bus}
        />
      );
    }

    return result;
  }


  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <SphereTimeline
            data={this.data}
            eventBus={this.eventBus}
            config={this.config}
          />
          <AppStateTimeline
            data={this.data}
            eventBus={this.eventBus}
            config={this.config}
          />
          {this.getBusData()}
          <Backdrop open={this.state.showConfig} style={{zIndex:99999}} onClick={() => { this.setState({showConfig: false})}}>
            <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '50vw'}} onClick={(event) => { event.stopPropagation() }}>
              <EventsSettings
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
              <EventsHelp />
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



function EventsSettings(props) {
  let [sphereLevelLocalization, setSphereLevelLocalization] = useState(props.config.dataflow.showSphereLocalization);
  let [roomLevelLocalization,   setRoomLevelLocalization]   = useState(props.config.dataflow.showRoomLocalization);

  return (
    <FormGroup>
      <h1>Events visualization settings</h1>
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

function EventsHelp(props) {
  let blockStyle : CSSProperties = {position:'inherit', width:40, height:20, display:'block', float:'left'};
  let blockContainerStyle : CSSProperties = {height:20, paddingTop:5}
  return (
    <div>
      <h1>Event visualization help</h1>
      <p>TBD.</p>
    </div>
  )
}