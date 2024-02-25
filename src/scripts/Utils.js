export default class Utils {
  static getRandomItemFromList(list) {
    return typeof list !== "undefined" && list?.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
  }

  static roundUp(nr) {
    return Math.ceil(nr * 10) / 10;
  }

  static getAllPlayerNamesAndIDs() {
    const playerData = {};
    game.users.forEach((user) => {
      playerData[user.name] = user.id;
    });
    return playerData;
  }
}
