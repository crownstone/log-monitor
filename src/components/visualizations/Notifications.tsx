import React, {useState} from "react";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {Util} from "../../util/Util";
import {VisualizationBase} from "./VisualizationBase";
import {NotificationsTimeline} from "../timelines/NotificationsTimeline";


function getNotificationConfig() : NotificationConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  };
}

export class Notifications extends VisualizationBase<NotificationConfig> {
  contentData = null;
  countData = null;

  constructor(props) {
    super(props, 'notifications');
    if (this.config === undefined) {
      this.config = getNotificationConfig();
    }
  }

  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <NotificationsTimeline
            data={this.data}
            eventBus={this.eventBus}
            config={this.config}
            countCallback={(data) => { this.countData = data; this.forceUpdate() }}
            dataCallback={(data) => { this.contentData = data; this.forceUpdate() }}
          />
          <Backdrop open={this.state.showConfig} style={{zIndex:99999}} onClick={() => { this.setState({showConfig: false})}}>
            <Paper style={{maxHeight: '100vh', overflow:'auto', padding:20, width: '50vw'}} onClick={(event) => { event.stopPropagation() }}>
              <NotificationSettings
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

          { this.contentData && <Details notification={this.contentData} /> }
          { this.countData && <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(this.countData, undefined, 2)}</p> }
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

function Details(props) {
  let notification = props.notification;
  return (
    <Grid container flexDirection={"row"}>
      <p style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(notification, undefined, 2)}</p>
    </Grid>
  )
}



function NotificationSettings(props) {
  let [sphereLevelLocalization, setSphereLevelLocalization] = useState(props.config.dataflow.showSphereLocalization);
  let [roomLevelLocalization,   setRoomLevelLocalization]   = useState(props.config.dataflow.showRoomLocalization);

  return (
    <FormGroup>
      <h1>Notification visualization settings</h1>
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

function CloudHelp(props) {
  return (
    <div>
      <h1>Cloud visualization help</h1>
      None yet.
    </div>
  )
}