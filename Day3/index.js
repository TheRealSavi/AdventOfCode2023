const fs = require("fs");
const readline = require("readline");

const inputFile = "Day3/input.txt";
const fileStream = fs.createReadStream(inputFile);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

const schematic2D = [];
let schematic1D;

rl.on("line", (line) => {
  const lineAsArray = [...line];
  schematic2D.push(lineAsArray);
});

rl.on("close", () => {
  schematic1D = schematic2D.flat();

  const partIDindexs = [];

  schematic2D.forEach((row) => {
    row.forEach((char) => {
      if (new RegExp(/\d/).test(char)) {
      }
    });
  });
});
