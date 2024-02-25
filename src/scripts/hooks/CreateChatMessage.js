import Settings from "../Settings.js";
import SadnessChan from "../SadnessChan.js";
import Logger from "../lib/Logger.js";

class CreateChatMessage {
  static _instance;

  constructor() {}

  static getInstance() {
    if (!CreateChatMessage._instance) CreateChatMessage._instance = new CreateChatMessage();
    return CreateChatMessage._instance;
  }

  async createChatMessageHook(chatMessage) {
    if (!chatMessage) return;
    const user = chatMessage.user;
    if (!(user && game.user.hasRole(4))) return;

    const result = await this._extractAnalytics(chatMessage.rolls, chatMessage, user);
    if (!result) return;
    return await SadnessChan.whisper(result, user);
  }

  /**
   * Checks if Better 5e Rolls is installed
   */
  _checkIfBR5eIsInstalled() {
    return !!game.modules.get("betterrolls5e");
  }

  _extractUnparsedRollsFromEmbedded(message) {
    const regexRoll = /roll=\"(.*?)\"/g;
    return [...message.matchAll(regexRoll)];
  }

  _extractUnparsedRollsFromBR5e(message) {
    const dieType = SadnessChan.getDieType();
    const rollsRegExp = new RegExp(`<li.*roll die d${dieType}.*>([0-9]+)<\/li>`, "g");
    return [...message.matchAll(rollsRegExp)];
  }

  /**
   * Return an array filled with 0
   *
   * @param length - the length of the array
   */
  _getZeroArray(length) {
    /*
    const zeroArray = new Array();
    for (let i = 0; i < length; i++) {
      zeroArray[i] = 0;
    }
    return zeroArray;
    */
    return Array(length).fill(0);
  }

  /**
   * Extracts userId and userName from user
   *
   * @param user
   * @return {userId, userName} || null
   */
  _prepareUserDataForStorage(user) {
    const id = user?._id;
    const name = user?.name;
    return id && name ? { id: id, name: name } : null;
  }

  /**
   * Extracts rolls from the current message and returns an array with them
   *
   * @param rolls - a list of rolls for this message (not available in better5erolls
   * @param chatMessage - chat message data
   * @param user - current user
   * @return array of rolls
   */
  async _extractAnalytics(rolls, chatMessage, user) {
    let analytics = [];
    if (rolls instanceof Array) {
      let rollAnalytics = [];
      for (const roll of rolls) {
        rollAnalytics.push(await this._extractSimpleAnalytics(roll, user));
      }

      rollAnalytics = rollAnalytics.filter((a) => a != null && a instanceof Array);
      analytics = rollAnalytics.splice(0, 1)[0];
      for (const a of rollAnalytics) {
        a.forEach((v, i) => (analytics[i] += v));
      }
    }

    if (this._checkIfBR5eIsInstalled() && chatMessage?.data?.content) {
      const extractedStringsFromBR5e = this._extractUnparsedRollsFromBR5e(chatMessage?.data?.content);
      if (extractedStringsFromBR5e && extractedStringsFromBR5e.length > 0) {
        return await this._extractBR5eAnalytics(extractedStringsFromBR5e, user);
      }
    }

    return analytics;
  }

  /**
   * Extracts data from a normal roll
   *
   * @param roll - all the rolls in this message
   * @param user - current user
   * @return an array with all the recent rolls
   */
  async _extractSimpleAnalytics(roll, user) {
    const dice = roll.dice;
    if (!(dice?.length > 0)) return;

    const dieType = SadnessChan.getDieType();
    const recentRolls = this._getZeroArray(dieType + 1);

    dice.forEach((die) => {
      if (die.faces !== dieType) return;
      const results = die.results; //|| die.rolls;
      results.forEach((roll) => {
        const r = roll.result || roll.roll;
        recentRolls[r] += 1;
      });
    });
    await this._updateDiceRolls(recentRolls, this._prepareUserDataForStorage(user));

    Logger.debug("Analytics extracted from simple roll.");
    return recentRolls;
  }

  /**
   * Extracts data from Better 5e Rolls
   *
   * @param rolls - array of unparsed rolls
   * @param user - current user
   * @return an array with all the recent rolls
   */
  async _extractBR5eAnalytics(rolls, user) {
    const dieType = SadnessChan.getDieType();
    if (!(rolls?.length > 0)) return;

    const recentRolls = this._getZeroArray(dieType + 1);
    rolls.forEach((roll) => {
      const value = roll[1];
      if (!value) return;

      recentRolls[value] += 1;
    });
    await this._updateDiceRolls(recentRolls, this._prepareUserDataForStorage(user));

    Logger.debug("Analytics extracted from betterrolls5e.");
    return recentRolls;
  }

  /**
   * Updates the values saved for user rolls.
   *
   * @param recentRolls - an array of how many of each roll
   * @param userData - extracted {userId, userName} from user
   */
  _updateDiceRolls(recentRolls, userData) {
    if (!userData) return;
    const counter = Settings.getCounter();
    const storedUser = counter[userData.id];

    if (storedUser && storedUser.rolls) {
      storedUser.name = userData.name;

      const storedUserRolls = storedUser.rolls;
      recentRolls.forEach((roll, index) => {
        if (index === 0) return;
        storedUserRolls[index] = storedUserRolls[index] ? storedUserRolls[index] + roll : roll;
      });
    } else {
      // First time setup, when user has no data
      counter[userData.id] = {
        rolls: [...recentRolls],
        ...userData,
      };
    }
    return Settings.setCounter(counter);
  }

  /**
   * Parses embedded rolls to make them JSONs
   *
   * @param matches - URI component
   * @param user - author of the message
   */
  async _parseEmbeddedRolls(matches, user) {
    const dieType = SadnessChan.getDieType();
    if (!(matches && matches.length > 0)) return [];

    let allRecentRolls = this._getZeroArray(dieType + 1);
    matches.forEach((element) => {
      try {
        const parsedEmbedded = JSON.parse(decodeURIComponent(element[1]));
        const recentRolls = this._extractEmbeddedRolls(parsedEmbedded, user);
        recentRolls.forEach((element, index) => {
          allRecentRolls[index] = element;
        });
      } catch (error) {
        return [];
      }
    });

    await this._updateDiceRolls(allRecentRolls, this._prepareUserDataForStorage(user));
    return allRecentRolls;
  }

  /**
   * Extracts rolls from the embedded JSON structure
   *
   * @param messageJSON - parsed message
   * @param user - owner of the message
   */
  _extractEmbeddedRolls(messageJSON, user) {
    const terms = messageJSON.terms;
    const dieType = SadnessChan.getDieType();
    const recentRolls = this._getZeroArray(dieType + 1);
    if (!terms) return;

    terms.forEach((term) => {
      if (term === "+" || term.faces !== dieType) return;

      term.results.forEach((element) => (recentRolls[element.result] += 1));
    });

    Logger.debug("Analytics extracted from embedded rolls.");
    return recentRolls;
  }
}

export default CreateChatMessage.getInstance();
