import React from "react";
import { GetStaticProps } from 'next'
import {parseConsumerAppFileByLine} from "../src/parsers/base";
import {SessionTimeline} from "../src/timelines/SessionTimeline";
import {CommanderTimeline} from "../src/timelines/CommanderTimeline";

export const getStaticProps: GetStaticProps = async (context) => {
  console.time("Parsing")
  let result = {};
  await parseConsumerAppFileByLine('Alex','2021-10-28', result)
  console.timeEnd("Parsing")
  return {
    props: {title:"Constellation", data: result},
  }
}

export default class Constellation extends React.Component<{ data: ParseDataResult }, { }> {

  render() {
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <SessionTimeline data={this.props.data} />
        <CommanderTimeline data={this.props.data} />
      </div>
    );
  }
}
