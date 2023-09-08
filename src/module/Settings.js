import utils from "./Utils.js";
import ListsEditor from "./apps/ListsEditor.js";
import listDefaults from "./lists/listDefaults.js";
import settingDefaults from "./lists/settingsDefaults.js";
import ImportExport from "./apps/ImportExport.js";

class Settings {
  static _instance;

  constructor() {}

  static getInstance() {
    if (!Settings._instance) Settings._instance = new Settings();
    return Settings._instance;
  }

  _registerSetting(key, data) {
    game.settings.register(utils.moduleName, key, data);
  }

  _registerMenus() {
    // @ts-ignore
    game.settings.registerMenu(utils.moduleName, settingDefaults.SETTING_KEYS.LISTS_EDITOR, {
      name: "Lists editor:",
      label: "Open list editor",
      icon: "fas fa-edit",
      type: ListsEditor,
      restricted: true,
    });

    game.settings.registerMenu(utils.moduleName, settingDefaults.SETTING_KEYS.IMPORT_EXPORT, {
      name: "Import/Export rolls history:",
      label: "Open history editor",
      icon: "fa-solid fa-database",
      type: ImportExport,
      restricted: true,
    });
  }

  _registerLists() {
    const defaultList = JSON.stringify({
      fail: [...listDefaults.DEFAULT_CRIT_FAIL_COMMENTS],
      success: [...listDefaults.DEFAULT_CRIT_SUCCESS_COMMENTS],
      fail_portraits: [...listDefaults.DEFAULT_CRIT_FAIL_PORTRAITS],
      portraits: [...listDefaults.DEFAULT_CRIT_SUCCESS_PORTRAITS],
    });
    this._registerSetting(settingDefaults.SETTING_KEYS.LISTS, {
      type: String,
      default: defaultList,
      scope: "world",
      config: false,
      restricted: true,
    });
  }

  _getSetting(key) {
    return game.settings.get(utils.moduleName, key);
  }

  _setSetting(key, data) {
    return game.settings.set(utils.moduleName, key, JSON.stringify(data));
  }

  resetLists() {
    const defaultList = JSON.stringify({
      fail: [...listDefaults.DEFAULT_CRIT_FAIL_COMMENTS],
      success: [...listDefaults.DEFAULT_CRIT_SUCCESS_COMMENTS],
      fail_portraits: [...listDefaults.DEFAULT_CRIT_FAIL_PORTRAITS],
      portraits: [...listDefaults.DEFAULT_CRIT_SUCCESS_PORTRAITS],
    });

    return this.setSetting(settingDefaults.SETTING_KEYS.LISTS, defaultList);
  }

  resetAllSettings() {
    for (const item in settingDefaults.SETTING_DEFAULTS) {
      const settings = this.setSetting(settingDefaults.SETTING_KEYS[item], settingDefaults.SETTING_DEFAULTS[item]);
    }
  }

  resetCounter() {
    return this.setCounter({});
  }

  registerSettings() {
    this._registerLists();
    this._registerMenus();
    settingDefaults.SETTINGS.forEach((setting) => {
      this._registerSetting(setting.key, setting.data);
    });

    utils.debug("Settings registered", false);
  }

  getSetting(key) {
    return this._getSetting(key);
  }

  setSetting(key, data) {
    return game.settings.set(utils.moduleName, key, data);
  }

  setCounter(counterData) {
    return this._setSetting(settingDefaults.SETTING_KEYS.COUNTER, counterData);
  }

  getCounter() {
    const setting = this.getSetting(settingDefaults.SETTING_KEYS.COUNTER);
    try {
      return JSON.parse(setting);
    } catch (error) {
      return {};
    }
  }

  setLists(listsData) {
    return this._setSetting(settingDefaults.SETTING_KEYS.LISTS, listsData);
  }

  getLists() {
    const setting = this.getSetting(settingDefaults.SETTING_KEYS.LISTS);
    try {
      return JSON.parse(setting);
    } catch (error) {
      return {};
    }
  }

  getPermissionLevel() {
    return this.getSetting(settingDefaults.SETTING_KEYS.RESET_LEVEL);
  }

  resetUserCounter(userID) {
    const counter = this.getCounter();
    counter[userID]?.rolls?.fill(0);
    this.setCounter(counter);
  }
}

export default Settings.getInstance();
