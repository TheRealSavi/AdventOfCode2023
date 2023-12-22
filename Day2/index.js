const fs = require("fs");
const readline = require("readline");

const inputFile = "Day2/input.txt";
const fileStream = fs.createReadStream(inputFile);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

const games = []; //stores all the games after them being read and parsed
let possibleGameIDSum = 0;
let minimumCubePowSum = 0;

const possibleCheck = { red: 12, green: 13, blue: 14 }; //checks if the game was possible given these cubes

rl.on("line", (line) => {
  games.push(parseGameObject(line)); //parses the line to a game object
});

rl.on("close", () => {
  games.forEach((game) => {
    console.log(game); //debug info

    if (game.possible) {
      possibleGameIDSum += game.gameID; //gets the sum of all the possible gameID's
    }

    minimumCubePowSum += game.minimumCubePower;
  });
  console.log("possibleGameIDSum: " + possibleGameIDSum);
  console.log("minimumCubePowSum: " + minimumCubePowSum);
});

const checkIfGameIsPossible = (game) => {
  game.setObjects.forEach((set) => {
    if (
      set.red > possibleCheck.red || //if any of these are true the game was not possible because it would require more cubes than availible
      set.green > possibleCheck.green ||
      set.blue > possibleCheck.blue
    ) {
      game["possible"] = false; //updates the games possibility to false
      return; //no need to check anymore sets
    }
  });
};

const getMinNeededCubes = (game) => {
  const minimumCubes = { red: 0, green: 0, blue: 0 };
  game.setObjects.forEach((set) => {
    //just updating the minimum if it ever finds one that is larger than the current
    if (set.red > minimumCubes.red) {
      minimumCubes.red = set.red;
    }
    if (set.green > minimumCubes.green) {
      minimumCubes.green = set.green;
    }
    if (set.blue > minimumCubes.blue) {
      minimumCubes.blue = set.blue;
    }
  });
  game["minimumCubePower"] =
    minimumCubes.red * minimumCubes.green * minimumCubes.blue; //stores the product in the game object
};

const parseGameObject = (string) => {
  //parses the line into a game object {gameID: int, setObjects: [[R, G,B]...], possible: bool}
  let [gameID, sets] = string.split(":"); // ['Game X', 'R,G,B ; R,B ; ...']
  sets = sets.split(";"); // [[R, G, B], [R, B], ...]
  const game = {
    gameID: parseInt(gameID.replace("Game ", "")), // 'Game X' -> X
    setObjects: [],
    possible: true,
  };

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    const results = set.split(","); // R/G/B
    const setObject = { red: 0, green: 0, blue: 0 };
    for (let j = 0; j < results.length; j++) {
      const value = results[j];
      if (value?.includes("red")) {
        //stores the value of the color in the set
        setObject["red"] = parseInt(value);
      }
      if (value?.includes("green")) {
        setObject["green"] = parseInt(value);
      }
      if (value?.includes("blue")) {
        setObject["blue"] = parseInt(value);
      }
    }
    game.setObjects.push(setObject); //adds the set to game
    checkIfGameIsPossible(game);
    getMinNeededCubes(game);
  }
  return game;
};
