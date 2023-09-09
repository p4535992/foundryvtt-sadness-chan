import Utils from "../Utils.js";
import settings from "../Settings.js";
import settingDefaults from "../lists/settingsDefaults.js";

export default class ImportExport extends FormApplication {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: "Import/Export rolls",
      template: `modules/${Utils.moduleName}/templates/import-export.html`,
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
    // @ts-ignore
    const value = this.element.find(`textarea[name="counter"]`).val();
    try {
      const parsed = JSON.parse(value);
      await settings.setCounter(parsed);
      ui.notifications.info("Successfully imported roll history");
    } catch (e) {
      ui.notifications.error("Invalid JSON");
      console.error(e);
    }
    this.close();
  }

  async _onCopy(ev) {
    // @ts-ignore
    const value = this.element.find(`textarea[name="counter"]`).val();
    await navigator.clipboard.writeText(value);
    ui.notifications.info("History copied to clipboard");
  }
}
