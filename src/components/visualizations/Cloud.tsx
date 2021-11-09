import React, {useState} from "react";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {Util} from "../../util/Util";
import {VisualizationBase} from "./VisualizationBase";
import {CloudTimeline} from "../timelines/CloudTimeline";


function getCloudConfig() : CloudConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  }
}

export class Cloud extends VisualizationBase {

  config: CloudConfig = getCloudConfig();

  requestData = null

  constructor(props) {
    super(props, 'cloud');
  }

  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <CloudTimeline
            data={this.data}
            eventBus={this.eventBus}
            cloudDataCallback={(data) => { this.requestData = data; this.forceUpdate() }}
          />

          <Backdrop open={this.state.showConfig} style={{zIndex:99999}} onClick={() => { this.setState({showConfig: false})}}>
            <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '50vw'}} onClick={(event) => { event.stopPropagation() }}>
              <CloudSettings
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
              <CloudHelp />
            </Paper>
          </Backdrop>

          { this.requestData && <RequestDetails request={this.requestData} /> }

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


function CloudSettings(props) {
  return (
    <FormGroup>
      <h1>Cloud visualization settings</h1>
      None yet.
      <Button
        onClick={() => { props.close({ })}}
      >Save</Button>
    </FormGroup>
  )
}

function CloudHelp(props) {
  return (
    <div>
      <h1>Cloud visualization help</h1>
      None yet.
    </div>
  )
}