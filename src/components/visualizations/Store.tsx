import React, {useState} from "react";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {Util} from "../../util/Util";
import {VisualizationBase} from "./VisualizationBase";
import {CloudTimeline} from "../timelines/CloudTimeline";
import {AppStateTimeline} from "../timelines/AppStateTimeline";
import { StoreTimeline } from "../timelines/StoreTimeline";


function getStoreConfig() : CloudConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  }
}

export class Store extends VisualizationBase<CloudConfig> {
  requestData = null
  storeData = null

  constructor(props) {
    super(props, 'store');
    if (this.config === undefined) {
      this.config = getStoreConfig();
    }
  }

  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <AppStateTimeline
            data={this.data}
            eventBus={this.eventBus}
            dataCallback={() => {}}
            config={this.config}
            groupWidth={430}
          />
          <CloudTimeline
            data={this.data}
            eventBus={this.eventBus}
            config={this.config}
            cloudDataCallback={(data) => { this.storeData = null; this.requestData = data; this.forceUpdate() }}
          />

          <StoreTimeline
            data={this.data}
            eventBus={this.eventBus}
            config={this.config}
            storeDataCallback={(data) => { this.requestData = null; this.storeData = data; this.forceUpdate() }}
          />
          <Backdrop open={this.state.showConfig} style={{zIndex:99999}} onClick={() => { this.setState({showConfig: false})}}>
            <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '50vw'}} onClick={(event) => { event.stopPropagation() }}>
              <StoreSettings
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
              <StoreHelp />
            </Paper>
          </Backdrop>

          { this.requestData && <RequestDetails request={this.requestData} /> }
          { this.storeData   && <StoreDetails    action={this.storeData} /> }

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

function RequestDetails(props) {
  let requestData : CloudRequest = props.request;
  return (
    <Grid container flexDirection={"row"}>
      <Grid item style={{padding:10}} xs={6}>
        <h3>Request</h3>
        <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(requestData?.request, undefined, 2)}</p>
      </Grid>
      <Grid item style={{padding:10}} xs={6}>
        <h3>{`Reply in ${requestData.tEnd - requestData.tStart}ms`}</h3>
        <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(requestData?.reply, undefined, 2)}</p>
      </Grid>
    </Grid>
  )
}

function StoreDetails(props) {
  let action = props.action;
  return (
    <Grid container flexDirection={"row"}>
      <h3>Action</h3>
      <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(action.action, undefined, 2)}</p>
      { action.batch !== undefined  &&  <h3>As part of:</h3>}
      { action.batch !== undefined  &&  <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(action.batch, undefined, 2)}</p> }
    </Grid>
  )
}



function StoreSettings(props) {
  let [sphereLevelLocalization, setSphereLevelLocalization] = useState(props.config.dataflow.showSphereLocalization);
  let [roomLevelLocalization,   setRoomLevelLocalization]   = useState(props.config.dataflow.showRoomLocalization);

  return (
    <FormGroup>
      <h1>Cloud visualization settings</h1>
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

function StoreHelp(props) {
  return (
    <div>
      <h1>Cloud visualization help</h1>
      None yet.
    </div>
  )
}