class Utils {
  static _instance;
  _debugging;
  _trace;
  moduleName = "sadness-chan";
  moduleTitle = "Sadness Chan";

  constructor(debugging, trace) {
    this._debugging = debugging;
    this._trace = trace;

    if (debugging) CONFIG.debug.hooks = debugging;
  }

  static getInstance(debugging, trace) {
    if (!Utils._instance) Utils._instance = new Utils(debugging, trace);
    return Utils._instance;
  }

  _consoleLog(output) {
    console.log(`%c${this.moduleTitle} %c|`, "background: #222; color: #bada55", "color: #fff", output);
  }

  _consoleTrace(output) {
    console.groupCollapsed(`%c${this.moduleTitle} %c|`, "background: #222; color: #bada55", "color: #fff", output);
    console.trace();
    console.groupEnd();
  }

  debug(output, doTrace = false) {
    if (!this._debugging) return;

    if (this._trace && doTrace !== false) {
      this._consoleTrace(output);
    } else {
      this._consoleLog(output);
    }
  }

  getRandomItemFromList(list) {
    return typeof list !== "undefined" && list?.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
  }

  roundUp(nr) {
    return Math.ceil(nr * 10) / 10;
  }

  getAllPlayerNamesAndIDs() {
    const playerData = {};
    game.users.forEach((user) => {
      playerData[user.name] = user.id;
    });
    return playerData;
  }
}

export default Utils.getInstance(false, false);
