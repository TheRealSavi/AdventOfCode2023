const fs = require("fs");
const readline = require("readline");

const inputFile = "Day1/input.txt";
const fileStream = fs.createReadStream(inputFile);

const stringToDigit = {
  one: "o1e", //the first and last digits are retained so that if they would have started or finished another key match that match will still occur
  two: "t2o", //ex twone will become t2one then t2o1e, succesfully coverting the shared letters into their digits
  three: "t3e", //only the first and last chars are needed in english since no number starts with the same two char ending sequencing of any other number
  four: "f4r",
  five: "f5e",
  six: "s6x",
  seven: "s7n",
  eight: "e8t",
  nine: "n9e",
};

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  const result = getLineDigits(line); //for each line of the input file run the getLineDigits
});

rl.on("close", () => {
  console.log("Total: " + total); //after reading all lines displays the sum of the value returned by each line
});

let total = 0;

//recursive function to step through the given line and replace each instance of a stringdigit into a normal digit from (left to right *which is not needed for this process but i did because confused)
const stringReplacer = (string) => {
  let newString = string;
  let earliestKeyIndex = 99999; //high so that the first found keyIndex will update this value no matter what
  let earliestKey; //stores the actual key that was found at the index

  for (const key of Object.keys(stringToDigit)) {
    // for every key
    const keyIndex = newString.toLowerCase().indexOf(key.toLowerCase()); //get the index of its first occurance in the string
    if (keyIndex < earliestKeyIndex && keyIndex != -1) {
      //if it is the earliest found key in the string update that
      earliestKeyIndex = keyIndex;
      earliestKey = key;
    }
  }

  if (earliestKey) {
    //if a key was found in the string
    newString = string.toLowerCase().replace(
      new RegExp(earliestKey.toLowerCase()), //replace that found key with its digit
      stringToDigit[earliestKey]
    );
    return stringReplacer(newString); //then run the function again to continue replacing keys with digits
  } else {
    return newString; //until no more keys are found, where it returns the string
  }
};

const getLineDigits = (line) => {
  let replacedLine = line;
  replacedLine = stringReplacer(line); //replace the worddigits with normal digits

  let digits = replacedLine.match(/\d/g) ?? []; //create an array of all the digits in the string
  if (digits.length == 1) {
    //if there was only one digit in the string it will count as the first and last
    digits = [digits[0], digits[0]];
  } else if (digits.length >= 2) {
    digits = [digits[0], digits[digits.length - 1]]; //keep only the first and last digit found
  }

  let result = 0;
  if (digits.length != 0) {
    result = parseInt(digits[0]) * 10 + parseInt(digits[1]); //turn the two digits found into a number ie ["7","4"] = 74
  }

  console.log(line, replacedLine, digits, result); //debug log

  total += result; //add the current lines result to the total
  return result;
};
