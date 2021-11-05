import React, {useState} from "react";
import { GetStaticProps } from 'next'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {Button, CircularProgress, Grid,} from "@mui/material";
import {FileUtil} from "../src/util/FileUtil";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { colors } from '../src/styles/colors'
import {AppRegistration} from "@mui/icons-material";
import {EventBusClass} from "../src/util/EventBus";
import {SessionTimeline} from "../src/timelines/SessionTimeline";
import {CommanderTimeline} from "../src/timelines/CommanderTimeline";
import {GlobalStateKeeper} from "../src/globalState/GlobalStateKeeper";
import { Util } from "../src/util/Util"
import {GuardianTheme} from "../src/styles/theme";
import { AnimatedGrid } from "../src/components/animating/AnimatedGrid";
import {SideBar} from "../src/components/pageElements/SideBar";
import {LogOverview} from "../src/components/selection/LogOverview";
import {TypeContainer} from "../src/components/selection/TypeOverview";
import {Visualization} from "../src/components/visualizations/Visualization";

export const getStaticProps: GetStaticProps = async (context) => {
  let paths = FileUtil.getUsers()
  return {
    props: {title:"Available files", logs: paths},
  }
}

export default class FileOverview extends React.Component<any, any> {

  db : GlobalStateKeeper;

  constructor(params) {
    super(params);
    this.state = {
      selectedUser: null,
      selectedDate: null,
      selectedType: null,
      showSettings: false,
      showHelp: false,
    }
  }

  componentDidMount() {
    this.db = new GlobalStateKeeper();
    this.setState({
      selectedUser: this.db.get('selectedUser'),
      selectedDate: this.db.get('selectedDate'),
      selectedType: this.db.get('selectedType'),
    })
  }

  render() {
    let phase = 0;
    if (this.state.selectedUser !== null && this.state.selectedDate !== null) {
      phase = 1;
      if (this.state.selectedType !== null) {
        phase = 2;
      }
    }

    return (
      <ThemeProvider theme={GuardianTheme}>
        <Grid container flexDirection={'row'} style={{backgroundColor: colors.white.hex}}>
          <SideBar
            selectDate={(data) => {
              this.setState({selectedDate:data, selectedType: null, showSettings: false, showHelp: false});
              this.db.set('selectedDate', data);
              this.db.remove('selectedType');
            }}
            selectType={(data) => {this.setState({selectedType:data, showSettings: false, showHelp: false}); this.db.set('selectedType', data)}}
            viz={{
              settings: () => { this.setState({showSettings: !this.state.showSettings})},
              help:     () => { this.setState({showHelp: !this.state.showHelp})},
            }}
            phase={phase}
          />

          <LogOverview
            phase={phase}
            logs={this.props.logs}
            user={this.state.selectedUser}
            date={this.state.selectedDate}
            selectUser={(data) => {this.setState({selectedUser:data, showSettings: false, showHelp: false}); this.db.set('selectedUser', data)}}
            selectDate={(data) => {this.setState({selectedDate:data, showSettings: false, showHelp: false}); this.db.set('selectedDate', data)}}
          />

          <TypeContainer
            select={(type) => { this.setState({selectedType: type, showSettings: false, showHelp: false}); this.db.set('selectedType', type)}}
            phase={phase}
          />

          {phase >= 2 &&
            <Visualization
              user={this.state.selectedUser}
              date={this.state.selectedDate}
              showSettings={this.state.showSettings}
              showHelp={this.state.showHelp}
            />
          }
        </Grid>
      </ThemeProvider>
    );
  }
}





