import Utils from "../Utils.js";
import Settings from "../Settings.js";

export default class ListsEditor extends FormApplication {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: "Lists editor",
      template: `modules/${Utils.moduleName}/templates/comments-editor.html`,
      submitOnChange: false,
      submitOnClose: true,
      closeOnSubmit: true,
    };
  }

  getData(options = {}) {
    return {
      options: this.options,
      moduleName: Utils.moduleName,
      lists: this._prepareListsForDisplay(),
    };
  }

  async _updateObject(event, formData) {
    const { fail, success, fail_portraits, portraits } = formData;
    const oldLists = Settings.getLists();

    const listsData = {
      fail: this._convertStringToList(fail, oldLists.fail),
      success: this._convertStringToList(success, oldLists.success),
      fail_portraits: this._convertStringToList(fail_portraits, oldLists.fail_portraits),
      portraits: this._convertStringToList(portraits, oldLists.portraits),
    };

    return Settings.setLists(listsData);
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  _prepareListsForDisplay() {
    const { fail, success, fail_portraits, portraits } = Settings.getLists();
    return {
      fail: fail?.length ? fail.join("\n") : "",
      success: success?.length ? success.join("\n") : "",
      fail_portraits: fail_portraits?.length ? fail_portraits.join("\n") : "",
      portraits: portraits?.length ? portraits.join("\n") : "",
    };
  }

  _convertStringToList(stringList, oldValues) {
    if (!(typeof stringList === "string" && stringList !== "")) return oldValues;
    return stringList.split("\n");
  }
}
