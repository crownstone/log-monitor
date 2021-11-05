import React from "react";
import {EventBusClass} from "../../util/EventBus";
import {Util} from "../../util/Util";
import {CircularProgress, Grid} from "@mui/material";
import {SessionTimeline} from "../../timelines/SessionTimeline";
import {CommanderTimeline} from "../../timelines/CommanderTimeline";


export class Constellation extends React.Component<{
  user: string,
  date: string,
  showSettings: boolean,
  showHelp: boolean
},any>{

  eventBus
  data : ParseDataResult

  constructor(props) {
    super(props)
    this.eventBus = new EventBusClass("Constellation");

    this.state = {
      loadedData:false,
      drawData: false
    };

    this.init()
  }

  async init() {
    this.data = await Util.postData(`http://localhost:3000/api/getParsedProps`, {user: this.props.user, date: this.props.date});
    this.setState({loadedData:true});
    setTimeout(() => { this.setState({drawData: true})}, 100);
  }

  render() {
    if (this.state.drawData) {
      return (
        <Grid item style={{minHeight:'100vh', flex:1}}>
          <SessionTimeline data={this.data} eventBus={this.eventBus} />
          <CommanderTimeline data={this.data} eventBus={this.eventBus} />
        </Grid>
      );
    }
    else if (this.state.loadedData) {
      return (
        <Grid item style={{display:'flex', minHeight:'100vh', flex:1, justifyContent:'center', alignItems:'center'}}>
          <CircularProgress size={100} color={'secondary'}  style={{padding:10}} />
          Drawing data....
        </Grid>
      )
    }
    return (
      <Grid item style={{display:'flex', minHeight:'100vh', flex:1, justifyContent:'center', alignItems:'center'}}>
        <CircularProgress size={100} color={'primary'} style={{padding:10}}/>
        Getting data....
      </Grid>
    )
  }
}
