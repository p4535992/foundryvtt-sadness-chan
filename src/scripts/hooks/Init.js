import Settings from "../Settings.js";
import Utils from "../Utils.js";

class Init {
  static _instance;

  constructor() {}

  static getInstance() {
    if (!Init._instance) Init._instance = new Init();
    return Init._instance;
  }

  async initHook() {
    Settings.registerSettings();
    Utils.debug("Prepared to collect your tears.");
  }
}

export default Init.getInstance();
