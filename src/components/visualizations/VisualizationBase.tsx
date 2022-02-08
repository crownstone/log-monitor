import React from "react";
import {EventBusClass, SharedEventBus} from "../../util/EventBus";
import {GlobalStateKeeper} from "../../globalState/GlobalStateKeeper";
import {Util} from "../../util/Util";


export class VisualizationBase<T> extends React.Component<
  { user?: string, date?: string, part?: number, any?, parts?: number, path?: string, stream?: boolean},
  { loadedData: boolean, drawData: boolean, showConfig: boolean, showHelp: boolean, any? }
  >{

  eventBus : EventBusClass;
  config: T
  data : ParseDataResult = {};
  unsubscribe = []

  type: string;

  streamTimeout = null;


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
    clearTimeout(this.streamTimeout);
    this.unsubscribe.forEach((unsub) => { unsub(); });
  }


  populateConfig() {
    let db = new GlobalStateKeeper();
    let storedConfig = db.get(`${this.type}Config`);
    console.log('initial config', this.config)
    if (storedConfig) {
      console.log("Loading stored config", `${this.type}Config`, storedConfig)
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
    else {
      db.set(`${this.type}Config`, this.config);
      this.eventBus.emit("REFRESH_DATA");
    }
  }


  async init() {
    this.data = await Util.postData(`http://localhost:3000/api/getParsedProps`, {
      path:  this.props.path,
      user:  this.props.user,
      date:  this.props.date,
      type:  this.type,
      part:  this.props.part,
      parts: this.props.parts,
    });
    SharedEventBus.emit("PARSED_DATA");
    this.setState({loadedData:true});
    setTimeout(() => { this.setState({drawData: true})}, 100);
    if (this.props.stream) {
      clearTimeout(this.streamTimeout);
      this.streamTimeout = setTimeout(() => {
        this.update()
      }, 5000);
    }
  }

  async update() {
    this.data = await Util.postData(`http://localhost:3000/api/getParsedProps`, {
      path:   this.props.path,
      stream: this.props.stream,
      user:   this.props.user,
      date:   this.props.date,
      type:   this.type,
      part:   this.props.part,
      parts:  this.props.parts,
    });
    this.eventBus.emit("NEW_DATA", this.data);
    if (this.props.stream) {
      clearTimeout(this.streamTimeout);
      this.streamTimeout = setTimeout(() => {
        this.update()
      }, 5000);
    }
  }


  render() {
    return <div>OVERRIDE BY CHILD</div>
  }
}
