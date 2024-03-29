import React, {useState} from "react";
import { GetStaticProps } from 'next'
import { ThemeProvider } from '@mui/material/styles';
import {Grid,} from "@mui/material";
import {FileUtil} from "../src/util/FileUtil";
import { colors } from '../src/styles/colors'
import {GlobalStateKeeper} from "../src/globalState/GlobalStateKeeper";
import {GuardianTheme} from "../src/styles/theme";
import {SideBar} from "../src/components/pageElements/SideBar";
import {TypeContainer} from "../src/components/selection/TypeOverview";
import {Visualization} from "../src/components/visualizations/Visualization";
import {SharedEventBus} from "../src/util/EventBus";
import {FileSelection} from "../src/components/selection/FileSelection";

export const getStaticProps: GetStaticProps = async (context) => {
  let paths = FileUtil.getUsers()
  return {
    props: {title:"Available files", logs: paths},
  }
}

export default class FromPath extends React.Component<any, { selectedPath: any, selectedType: any, streamData: boolean }> {

  db : GlobalStateKeeper;
  unsubscribe = [];

  constructor(params) {
    super(params);
    this.state = {
      selectedPath: null,
      streamData: false,
      selectedType: null,
    }
  }

  componentDidMount() {
    this.db = new GlobalStateKeeper();
    this.setState({
      selectedPath: this.db.get('selectedPath'),
      streamData:   this.db.get('streamData') ?? false,
      selectedType: this.db.get('selectedPathType'),
    })
  }

  componentWillUnmount() {
    for (let unsub of this.unsubscribe) { unsub(); }
  }


  render() {
    let phase = 0;
    if (this.state.selectedPath !== null) {
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
              this.setState({selectedPath: null, selectedType:null});
              this.db.set('selectedPath', null);
              this.db.set('selectedStreamType', null);
              this.db.remove('selectedStreamType');
            }}
            clearTypeData={() => {this.setState({selectedType:null}); this.db.set('selectedStreamType', null)}}
            viz={{
              settings: () => { SharedEventBus.emit("SHOW_SETTINGS"); },
              help:     () => { SharedEventBus.emit("SHOW_HELP"); },
            }}
            phase={phase}
          />

          <FileSelection phase={phase} streamValue={this.state.streamData} selectFile={(path, stream) => {
            this.setState({selectedPath: path, streamData: stream})
            this.db.set('selectedPath', path);
            this.db.set('streamData', stream);
          }}/>

          <TypeContainer
            select={(type) => { this.setState({selectedType: type}); this.db.set('selectedStreamType', type)}}
            phase={phase}
          />

          {phase >= 2 &&
            <Visualization
              stream={this.state.streamData}
              path={this.state.selectedPath}
              type={this.state.selectedType}
            />
          }
        </Grid>
      </ThemeProvider>
    );
  }
}





