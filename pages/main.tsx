import React, {useState} from "react";
import FileOverview from "./items";


export default class Main extends React.Component<{data: any}, any> {

  constructor(params) {
    super(params);
    this.state = {
      file: null,
      type: null,
    }
  }


  render() {
    return (
      <FileOverview />
    );
  }

}