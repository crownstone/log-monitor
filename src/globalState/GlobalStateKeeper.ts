
let lastTimeKey = '____lastTimeUsed'

export class GlobalStateKeeper {

  db: Storage

  constructor() {
    this.db = window.localStorage;

    let lastTime = this.get(lastTimeKey);

    if (!lastTime) {
      this.clear()
      return
    }

    if (Date.now() - Number(lastTime) > 12*3600*1000) {
      this.clear();
      return;
    }
  }

  clear() {
    this.db.clear();
  }

  set(key, value, storeLastSet = true) {
    let type = typeof value;
    if (type === "object") {
      value = JSON.stringify(value);
    }
    else {
      value = String(value);
    }

    if (storeLastSet) {
      this.set(lastTimeKey, Date.now(), false);
    }

    return this.db.setItem(key, JSON.stringify({type, value}));
  }

  remove(key) {
    this.db.removeItem(key);
  }

  get(key): any {
    let data : string | null = this.db.getItem(key);
    if (!data) { return null }

    let parsed : {type: string, value: string}= JSON.parse(data);
    switch (parsed.type) {
      case "number":
        return Number(parsed.value);
      case "boolean":
      case "boolean":
        return parsed.value === "true"
      case "object":
        return JSON.parse(parsed.value);
      default:
        return parsed.value;
    }
  }
}