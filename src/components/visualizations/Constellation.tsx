import React, {useState} from "react";
import {EventBusClass, SharedEventBus} from "../../util/EventBus";
import {Backdrop, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Grid, Paper} from "@mui/material";
import {SessionTimeline} from "../../timelines/SessionTimeline";
import {CommanderTimeline} from "../../timelines/CommanderTimeline";
import {GlobalStateKeeper} from "../../globalState/GlobalStateKeeper";
import {Util} from "../../util/Util";


function getConstellationConfig() : ConstellationConfig {
  return {
    dataflow: {
      showRoomLocalization: false,
      showSphereLocalization: false,
    }
  }
}

export class Constellation extends React.Component<{
  user: string,
  date: string,
},any>{

  eventBus;
  config: ConstellationConfig = getConstellationConfig();
  data : ParseDataResult = {};
  unsubscribe = []

  constructor(props) {
    super(props)
    this.eventBus = new EventBusClass("Constellation");

    this.populateConfig();

    this.state = {
      loadedData: false,
      drawData:   false,

      showConfig: false,
      showHelp:   false,
    };

    this.init()
  }


  componentDidMount() {
    this.unsubscribe.push(SharedEventBus.on("SHOW_SETTINGS", () => { this.setState({showConfig: true,  showHelp: false}); }));
    this.unsubscribe.push(SharedEventBus.on("SHOW_HELP",     () => { this.setState({showConfig: false, showHelp: true});  }));
  }


  componentWillUnmount() {
    this.unsubscribe.forEach((unsub) => { unsub(); });
  }


  populateConfig() {
    let db = new GlobalStateKeeper();
    let storedConfig = db.get("ConstellationConfig");
    if (storedConfig) {
      this.config = storedConfig;
    }
  }

  storeConfig() {
    let db = new GlobalStateKeeper();
    let storedConfig = db.get("ConstellationConfig");
    if (storedConfig) {
      if (Util.deepCompare(storedConfig, this.config) === false) {
        db.set("ConstellationConfig", this.config);
        this.eventBus.emit("REFRESH_DATA");
      }
    }
  }


  async init() {
    this.data = await Util.postData(`http://localhost:3000/api/getParsedProps`, {user: this.props.user, date: this.props.date});
    this.setState({loadedData:true});
    setTimeout(() => { this.setState({drawData: true})}, 100);
  }


  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{height:'100vh', flex:1, overflow:'auto'}}>
          <SessionTimeline   data={this.data} eventBus={this.eventBus} />
          <CommanderTimeline data={this.data} eventBus={this.eventBus} config={this.config} />
          <Backdrop open={this.state.showConfig} style={{zIndex:99999}} onClick={() => { this.setState({overlayContent: null})}}>
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