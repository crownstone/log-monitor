import React from "react";
import { GetStaticProps } from 'next'
import {parseConsumerAppFileByLine} from "../src/parsers/base";
import {SessionTimeline} from "../src/timelines/SessionTimeline";
import {CommanderTimeline} from "../src/timelines/CommanderTimeline";

export const getStaticProps: GetStaticProps = async (context) => {
  console.time("Parsing")
  let result = {};
  await parseConsumerAppFileByLine('Alex','2021-10-27', result, 10000)
  console.timeEnd("Parsing")
  return {
    props: {title:"Constellation", data: result},
  }
}

export default class Constellation extends React.Component<{ data: any }, { }> {

  render() {
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <CommanderTimeline data={this.props.data} />
      </div>
    );
  }
}
