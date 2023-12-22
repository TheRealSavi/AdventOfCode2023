const fs = require("fs");
const readline = require("readline");

const inputFile = "Day3/input.txt";
const fileStream = fs.createReadStream(inputFile);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

const schematic2D = [];
const partIDobjects = [];
let partIDTotal = 0;
let gearRatioSum = 0;

rl.on("line", (line) => {
  const lineAsArray = [...line]; //reads the line in as an array of chars
  schematic2D.push(lineAsArray); //pushes that array into an array creating a 2d array of the schematic
});

rl.on("close", () => {
  findPartIds(); //creates the partIDobjects array to get information about all the part ids from the schematic

  partIDobjects.forEach((partIDObj) => {
    //checks to see which partids are touching a symbol to be counted as an actual part
    isTouchingSymbol(partIDObj);
  });

  calculateGearRatios(); //then checks to see if they had gears touching and calculates their gear rations

  console.log(partIDobjects);
  console.log("Part ID Total: " + partIDTotal);
  console.log("Gear Ratio Sum: " + gearRatioSum);
});

const findPartIds = () => {
  let isBuildingNumber = false; //becomes true when a number is found and then becomes false when the number ends
  let currentObj; //the current partidobject being created

  schematic2D.forEach((row, i) => {
    //looping through the whole schematic
    row.forEach((char, j) => {
      if (new RegExp(/\d/).test(char)) {
        //if the current char is a number
        if (!isBuildingNumber) {
          //and its not currently building a number
          isBuildingNumber = true; //starts building
          let newObj = {
            //creates an object to track its info
            row: i,
            start: j,
            end: undefined,
            touchingSymbol: false,
            gearCandidate: { row: undefined, index: undefined },
          };
          currentObj = newObj;
        }
      } else {
        //if the current char a non number
        if (isBuildingNumber && currentObj) {
          //but it was just building a number
          isBuildingNumber = false; //its done building now
          currentObj["end"] = j; //and we know where it ends
          partIDobjects.push({ ...currentObj }); //and it gets added to the partIDobjects
        }
      }
    });
    if (isBuildingNumber && currentObj) {
      //at the end of reading the row if its still building a number its done now
      isBuildingNumber = false;
      currentObj["end"] = row.length;
      partIDobjects.push({ ...currentObj });
    }
  });
};

const isTouchingSymbol = (partIDObj) => {
  //checks to see if the partID has any symbols touching it
  let row = schematic2D[partIDObj.row];
  let rowUp = schematic2D[partIDObj.row + 1];
  let rowDown = schematic2D[partIDObj.row - 1];
  //left
  if (partIDObj.start >= 1) {
    if (symbolCheck(row, partIDObj.start - 1, partIDObj, partIDObj.row)) {
      partIDObj["touchingSymbol"] = true;
    }
  }
  //right
  if (partIDObj.end < row.length - 1) {
    if (symbolCheck(row, partIDObj.end, partIDObj, partIDObj.row)) {
      partIDObj["touchingSymbol"] = true;
    }
  }
  //top and bottom for each char
  for (let i = partIDObj.start; i < partIDObj.end; i++) {
    if (symbolCheck(rowUp, i, partIDObj, partIDObj.row + 1)) {
      partIDObj["touchingSymbol"] = true;
    }
    if (symbolCheck(rowDown, i, partIDObj, partIDObj.row - 1)) {
      partIDObj["touchingSymbol"] = true;
    }
  }
  //left -1 row
  if (partIDObj.start >= 1) {
    if (
      symbolCheck(rowDown, partIDObj.start - 1, partIDObj, partIDObj.row - 1)
    ) {
      partIDObj["touchingSymbol"] = true;
    }
  }
  //left +1 row
  if (partIDObj.start >= 1) {
    if (symbolCheck(rowUp, partIDObj.start - 1, partIDObj, partIDObj.row + 1)) {
      partIDObj["touchingSymbol"] = true;
    }
  }
  //right -1 row
  if (partIDObj.end < rowDown?.length - 1) {
    if (symbolCheck(rowDown, partIDObj.end, partIDObj, partIDObj.row - 1)) {
      partIDObj["touchingSymbol"] = true;
    }
  }

  //right +1 row
  if (partIDObj.end < rowUp?.length - 1) {
    if (symbolCheck(rowUp, partIDObj.end, partIDObj, partIDObj.row + 1)) {
      partIDObj["touchingSymbol"] = true;
    }
  }

  if (partIDObj.touchingSymbol) {
    let num = "";
    for (let i = partIDObj.start; i < partIDObj.end; i++) {
      num += String(row[i]);
    }
    const numint = parseInt(num);
    partIDObj["partID"] = numint;
    partIDTotal += numint;
  }
};

const symbolCheck = (row, index, partIDObj, rowIndex) => {
  let char = row?.[index];
  if (char == "." || new RegExp(/\d/).test(char) || !char) {
    return false;
  } else {
    if (char == "*") {
      //if the adjacent symbol was just a * then it records the stars position for checking to see if any other parts share the same star adjacent later
      partIDObj["gearCandidate"]["row"] = rowIndex;
      partIDObj["gearCandidate"]["index"] = index;
    }
    return true;
  }
};

const calculateGearRatios = () => {
  let checking; //stores the current gearcandidate to see if there are any other parts with the same gear candidate
  let sharingWith = []; //an array which contains array of parts that have the same gear candidate

  partIDobjects.forEach((partIDObj) => {
    //big O notation probably hates how i did this
    //for each part
    if (partIDObj.gearCandidate.index) {
      //if it has a gear candidate
      checking = partIDObj.gearCandidate; //start checking for matches
      partIDobjects.forEach((partIDObj2) => {
        //by looking at all the parts
        if (partIDObj != partIDObj2) {
          //except itself
          if (
            JSON.stringify(partIDObj2.gearCandidate) == JSON.stringify(checking) //and seeing if they have the same gear candidate
          ) {
            sharingWith.push([partIDObj, partIDObj2]); //if they do then they are paired together and stored in the sharingwith
          }
        }
      });
    }
  });

  sharingWith.forEach((set) => {
    //then for each pair
    if (set.length == 2) {
      let gearRatio = set[0].partID * set[1].partID; //takes the product of their partIDs

      gearRatioSum += gearRatio; //and adds that to the sum
    }
  });
  gearRatioSum /= 2; //but because for each pair it will have its gear ratio added twice and its easy to just divide by 2 instead of removing the duplicates
};
