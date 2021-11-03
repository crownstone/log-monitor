import { Util } from "./Util";


export class EventBusClass {
  _id: string;
  _topics : object;
  _topicIds : object;

  _count = 0
  _type : string;

  constructor(type: string) {
    this._type = "EventBus_" + type;
    this._id = Util.getUUID();
    this._topics = {};
    this._topicIds = {};
  }
  
  on(topic, callback) {
    if (!(topic)) {
      return;
    }
    if (!(callback)) {
      return;
    }

    if (this._topics[topic] === undefined) {
      this._topics[topic] = [];
    }

    // generate unique id
    let id = Util.getUUID();

    this._topics[topic].push({id,callback});
    this._topicIds[id] = true;
    this._count += 1;

    // return unsubscribe function.
    return () => {
      if (this._topics[topic] !== undefined) {
        // find id and delete
        for (let i = 0; i < this._topics[topic].length; i++) {
          if (this._topics[topic][i].id === id) {
            this._topics[topic].splice(i,1);
            this._count -= 1;
            break;
          }
        }

        // clear the ID
        this._topicIds[id] = undefined;
        delete this._topicIds[id];

        if (this._topics[topic].length === 0) {
          delete this._topics[topic];
        }
      }
    };
  }

  emit(topic, data?) {
    if (this._topics[topic] !== undefined) {
      // Firing these elements can lead to a removal of a point in this._topics.
      // To ensure we do not cause a shift by deletion (thus skipping a callback) we first put them in a separate Array
      let fireElements = [];

      for (let i = 0; i < this._topics[topic].length; i++) {
        fireElements.push(this._topics[topic][i]);
      }

      for (let i = 0; i < fireElements.length; i++) {
        // this check makes sure that if a callback has been deleted, we do not fire it.
        if (this._topicIds[fireElements[i].id] === true) {
          fireElements[i].callback(data);
        }
      }
    }
  }

  once(topic, callback) {
    let unsubscriber = this.on(topic, (data: any) => {
      unsubscriber();
      callback(data);
    });
    return unsubscriber;
  }


  clearAllEvents() {
    this._count = 0;
    this._topics = {};
    this._topicIds = {};
  }

}

export let eventBus : any = new EventBusClass("mainSingleton");
