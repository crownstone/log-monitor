import React, {useState} from "react";
import { GetStaticProps } from 'next'
import { ThemeProvider } from '@mui/material/styles';
import {Grid,} from "@mui/material";
import {FileUtil} from "../src/util/FileUtil";
import { colors } from '../src/styles/colors'
import {GlobalStateKeeper} from "../src/globalState/GlobalStateKeeper";
import {GuardianTheme} from "../src/styles/theme";
import {SideBar} from "../src/components/pageElements/SideBar";
import {LogOverview} from "../src/components/selection/LogOverview";
import {TypeContainer} from "../src/components/selection/TypeOverview";
import {Visualization} from "../src/components/visualizations/Visualization";
import {SharedEventBus} from "../src/util/EventBus";
import {Util} from "../src/util/Util";

export const getStaticProps: GetStaticProps = async (context) => {
  let paths = FileUtil.getUsers()
  return {
    props: {title:"Available files", logs: paths},
  }
}

export default class FileOverview extends React.Component<any, {
  selectedUser: any,
  selectedDate: any,
  selectedType: any,
  selectedPart: any,
  totalParts: any,
  logs: any
}> {

  db : GlobalStateKeeper;
  unsubscribe = [];

  constructor(params) {
    super(params);
    this.state = {
      selectedUser: null,
      selectedDate: null,
      selectedType: null,
      selectedPart: null,
      totalParts: null,
      logs: params.logs
    }
  }

  componentDidMount() {
    this.db = new GlobalStateKeeper();
    this.setState({
      selectedUser: this.db.get('selectedUser'),
      selectedDate: this.db.get('selectedDate'),
      selectedPart: this.db.get('selectedPart'),
      totalParts: this.db.get('totalParts'),
      selectedType: this.db.get('selectedType'),
    })
    this.unsubscribe.push(SharedEventBus.on("PARSED_DATA", () => { this.updateLogData(); }));
  }

  componentWillUnmount() {
    for (let unsub of this.unsubscribe) { unsub(); }
  }


  async removeProcessedLogData(user, date, part = null) {
    await Util.postData(`http://localhost:3200/api/removeCachedData`, {user: this.state.selectedUser, date: date, part: part});
  }

  async updateLogData() {
    let updatedData = await Util.postData(`http://localhost:3200/api/getAvailableLogs`,{});
    this.setState({logs:updatedData});
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
            clearFileData={() => {
              this.setState({selectedDate: null, selectedPart: null, totalParts: null});
              this.db.remove('selectedDate');
              this.db.remove('selectedPart');
              this.db.remove('totalParts');
              this.db.remove('selectedType');
            }}
            clearTypeData={() => {this.setState({selectedType:null}); this.db.set('selectedType', null)}}
            viz={{
              settings: () => { SharedEventBus.emit("SHOW_SETTINGS"); },
              help:     () => { SharedEventBus.emit("SHOW_HELP"); },
            }}
            phase={phase}
          />

          <LogOverview
            phase={phase}
            logs={this.state.logs}
            user={this.state.selectedUser}
            date={this.state.selectedDate}
            selectUser={(data) => {this.setState({selectedUser:data}); this.db.set('selectedUser', data)}}
            selectItem={(data, part, totalParts) => {
              this.setState({selectedDate:data, selectedPart: part, totalParts: totalParts});
              this.db.set('selectedDate', data);
              this.db.set('selectedPart', part);
              this.db.set('totalParts', totalParts);
            }}
            removeProcessedData={async (date, part) => {
              await this.removeProcessedLogData(this.state.selectedUser, date, part);
              await this.updateLogData();
            }}
          />

          <TypeContainer
            select={(type) => { this.setState({selectedType: type}); this.db.set('selectedType', type)}}
            phase={phase}
          />

          {phase >= 2 &&
            <Visualization
              user={this.state.selectedUser}
              date={this.state.selectedDate}
              type={this.state.selectedType}
              part={this.state.selectedPart}
              parts={this.state.totalParts}
            />
          }
        </Grid>
      </ThemeProvider>
    );
  }
}





