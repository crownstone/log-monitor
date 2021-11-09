import React, {useState} from "react";
import {EventBusClass, SharedEventBus} from "../../util/EventBus";
import {GlobalStateKeeper} from "../../globalState/GlobalStateKeeper";
import {Util} from "../../util/Util";


export class VisualizationBase extends React.Component<
  { user: string, date: string, any?},
  { loadedData: boolean, drawData: boolean, showConfig: boolean, showHelp: boolean, any? }
  >{

  eventBus : EventBusClass;
  config: any
  data : ParseDataResult = {};
  unsubscribe = []

  type: string

  constructor(props, type) {
    super(props)
    this.eventBus = new EventBusClass(type);

    this.type = type;
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
    let storedConfig = db.get(`${this.type}Config`);
    if (storedConfig) {
      this.config = storedConfig;
    }
  }

  storeConfig() {
    let db = new GlobalStateKeeper();
    let storedConfig = db.get(`${this.type}Config`);
    if (storedConfig) {
      if (Util.deepCompare(storedConfig, this.config) === false) {
        db.set(`${this.type}Config`, this.config);
        this.eventBus.emit("REFRESH_DATA");
      }
    }
  }


  async init() {
    this.data = await Util.postData(`http://localhost:3000/api/getParsedProps`, {user: this.props.user, date: this.props.date, type:this.type});
    this.setState({loadedData:true});
    setTimeout(() => { this.setState({drawData: true})}, 100);
  }


  render() {
    return <div>OVERRIDE BY CHILD</div>
  }
}
