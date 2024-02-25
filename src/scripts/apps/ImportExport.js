import settings from "../Settings.js";
import settingDefaults from "../lists/settingsDefaults.js";
import CONSTANTS from "../constants.js";
import Logger from "../lib/Logger.js";

export default class ImportExport extends FormApplication {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: "Import/Export rolls",
      template: `modules/${CONSTANTS.MODULE_ID}/templates/import-export.html`,
      submitOnChange: false,
      submitOnClose: false,
      closeOnSubmit: false,
    };
  }

  getData() {
    return {
      counter: JSON.stringify(settings.getCounter(), null, 2),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[data-action="import"]').click((ev) => this._onImport(ev));
    html.find('button[data-action="copy"]').click((ev) => this._onCopy(ev));
  }

  async _onImport(ev) {
    const value = this.element.find(`textarea[name="counter"]`).val();
    try {
      const parsed = JSON.parse(value);
      await settings.setCounter(parsed);
      Logger.info("Successfully imported roll history", true);
    } catch (e) {
      Logger.error("Invalid JSON", true);
      Logger.error(e);
    }
    this.close();
  }

  async _onCopy(ev) {
    const value = this.element.find(`textarea[name="counter"]`).val();
    await navigator.clipboard.writeText(value);
    Logger.info("History copied to clipboard", true);
  }
}
