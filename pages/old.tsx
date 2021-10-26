import * as echarts from 'echarts';
import React from "react";
import { GetStaticProps } from 'next'
import {gatherStatistics, startParsers} from "../parsers/base";

export const getStaticProps: GetStaticProps = async (context) => {
  let data = await gatherStatistics()
  return {
    props: {title:"Constellation", series: data.series, statistics: data.statistics},
  }
}

export default class Experiment extends React.Component<{ series: any[], statistics: any }, any> {

  chart;
  containerReference;

  constructor(params) {
    super(params);
    this.state = {content:""};
  }

  componentDidMount() {
    this.chart = echarts.init(this.containerReference);
    let legend = []
    for (let serie of this.props.series) {
      let name = serie.dimensions[0];
      if (name.indexOf('name') !== -1 && name.length < 40) {
        legend.push(serie.dimensions[0])
      }
    };
    this.chart.setOption({
      title: {
        text: "ConstellationTest"
      },
      tooltip: {trigger:'axis'},
      legend: {data: legend},
      dataZoom: [
        {
          show: true,
          realtime: true,
          start: 0,
          end: 10,
          xAxisIndex: [0, 10]
        },
        {
        type: 'inside',
        start: 0,
        end: 10
      }],
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: [{name:"Sessions"}, {name:"Open"}, {name:"y2"}],
      series: this.props.series
    });

    const zr = this.chart.getZr();
    zr.on('click', (params) => {
      let pointInPixel = [params.offsetX, params.offsetY];
      let pointInGrid = this.chart.convertFromPixel('grid', pointInPixel);
      this.getDataBefore(pointInGrid[0])
    });
  }


  getDataBefore(time) {
    let content = []
    for (let serie of this.props.series) {
      let point = binSearch(time, serie.data);
      if (point === null) {
        continue;
      }
      let val = Number(serie.data[point][1]);
      let t = Number(serie.data[point][0]);
      if (val > 0 && t < time) {
        content.push({name: serie.dimensions[0], value: val, since: t - time})
      }
    }
    this.setState({content: JSON.stringify(content, null, 2)})
  }



  render() {
    return <div className="container">
      <code>{JSON.stringify(this.props.statistics, null, 2)}</code>
      <div id="main" ref={(r) => { this.containerReference = r}} tabIndex={42} />
      <code>
        {this.state.content}
      </code>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
          sans-serif;
        }
        
        code {
          white-space: pre-wrap;
        }
        
        div.container {
          width: 100vw;
          height: 100vh;
        }
        
        #main {
          width: 95vw;
          height: 800px;
        }
      `}</style>
    </div>
  }

}

function binSearch(time, data, start = 0, end = null) {
  if (end === null) {
    end = data.length - 1;
  }
  let range = end - start;
  if (range == 0) {
    return null;
  }
  if (range == 1) {
    return Number(data[start][0]) < time ? end : start;
  }

  let half = Math.floor(range/2) + start;
  let t = Number(data[half][0]);
  let tNext = Number(data[half+1][0]);

  if (t <= time && tNext > time) {
    return half;
  }
  if (t < time) {
    return binSearch(time, data, half, end)
  }
  if (t > time) {
    return binSearch(time, data, start, half)
  }
}