const fs = require("fs");
const readline = require("readline");

const inputFile = "Day5/input.txt";
const fileStream = fs.createReadStream(inputFile);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

const seeds = []; //part1
const seedRanges = []; //part2

const maps = [];
let buildingMap;
let lowestLocationValue = Infinity;
let lowestLocationValue2 = Infinity;

rl.on("line", (line) => {
  parseLine(line);
});

rl.on("close", () => {
  seeds.forEach((seed) => {
    const location = sourceValueToDestinationValue("seed", "location", seed);
    if (location < lowestLocationValue) {
      lowestLocationValue = location;
    }
  });
  console.log("Lowest Seed Location: " + lowestLocationValue);

  seedRanges.forEach((seedRange) => {
    const locationRanges = sourceRangeToDestinationRange(
      "seed",
      "location",
      seedRange
    );

    if (
      locationRanges.sort((a, b) => {
        a[0] - b[0];
      }) < lowestLocationValue[0]
    ) {
      lowestLocationValue2 = locationRanges[0][0];
    }
  });
  console.log("Lowest Seed Location2: " + lowestLocationValue2);
});

const parseLine = (line) => {
  if (line.includes("seeds:")) {
    const [_, seedString] = line.split(":");
    let seedList = seedString.split(" ");
    //part 1 parses seedlist as a list of seeds
    seedList = seedList
      .map((seed) => parseInt(seed, 10))
      .filter((value) => !isNaN(value));
    seeds.push(...seedList);
    //part 2 parses seedlist as a set seedStart, rangeLength...
    for (let i = 0; i < seedList.length - 1; i += 2) {
      const e = seedList[i];
      seedRanges.push([e, e + seedList[i + 1] - 1]);
    }
  } else if (line.includes("map:")) {
    const buildingMapKey = line.split(" ")[0];
    const [set1, _, set2] = buildingMapKey.split("-");
    buildingMap = {
      key: buildingMapKey,
      source: set1,
      destination: set2,
      values: [],
    };
  } else if (line == "") {
    if (buildingMap) {
      console.log("Done building: " + buildingMap.key + " map");
      maps.push({ ...buildingMap });
    }
  } else {
    const values = line.split(" ");
    if (values.length == 3 && buildingMap) {
      const map = {
        destRangeStart: parseInt(values[0], 10),
        srcRangeStart: parseInt(values[1], 10),
        rangeLength: parseInt(values[2], 10),
        srcRangeEnd: parseInt(values[1], 10) + parseInt(values[2], 10) - 1,
      };
      buildingMap.values.push(map);
    }
  }
};

//doesnt work at all and i dont want to talk about it
const sourceRangeToDestinationRange = (source, destination, rangeToMap) => {
  const sourceMap = maps.find((map) => {
    //finds that can convert our source value
    return map.source == source;
  });
  if (!sourceMap) {
    console.log("Could not find map with source: " + source);
    return -1; //if its not found returns a -1 for error handling by parent
  }

  let destRanges = [];

  let ranges = sourceMap.values.sort((a, b) => {
    return a.srcRangeStart - b.srcRangeStart;
  });

  //creates a range if there were no ranges to cover the edges
  const rangeGaps = [];
  if (ranges[0].srcRangeStart > rangeToMap[0]) {
    rangeGaps.push({
      srcRangeStart: rangeToMap[0],
      srcRangeEnd: ranges[0].srcRangeStart - 1,
      destRangeStart: rangeToMap[0],
    });
  }
  if (ranges[ranges.length - 1].srcRangeEnd < rangeToMap[1]) {
    rangeGaps.push({
      srcRangeStart: ranges[ranges.length - 1].srcRangeEnd + 1,
      srcRangeEnd: rangeToMap[1],
      destRangeStart: ranges[ranges.length - 1].srcRangeEnd + 1,
    });
  }
  //fills middle range gaps
  ranges.forEach((range, i) => {
    if (ranges[i + 1]) {
      if (range.srcRangeEnd + 1 < ranges[i + 1].srcRangeStart) {
        rangeGaps.push({
          srcRangeStart: range.srcRangeEnd + 1,
          srcRangeEnd: ranges[i + 1].srcRangeStart - 1,
          destRangeStart: range.srcRangeEnd + 1,
        });
      }
    }
  });
  ranges.push(...rangeGaps);
  ranges = sourceMap.values.sort((a, b) => {
    return a.srcRangeStart - b.srcRangeStart;
  });

  //map rangeToMap to subsections of ranges
  ranges.forEach((range) => {
    if (
      (range.srcRangeEnd >= rangeToMap[0] &&
        range.srcRangeEnd <= rangeToMap[1]) ||
      (range.srcRangeStart <= rangeToMap[1] &&
        range.srcRangeStart >= rangeToMap[0])
    ) {
      //the range overlaps
      destRanges.push([
        Math.max(range.srcRangeStart, rangeToMap[0]) +
          range.destRangeStart -
          range.srcRangeStart,

        Math.min(range.srcRangeEnd, rangeToMap[1]) +
          range.destRangeStart -
          range.srcRangeStart,
      ]);
    }
  });

  if (sourceMap.destination != destination) {
    //if the map we just used doesnt convert our value to the destination we want
    //we need to convert the value again
    let finalRanges = [];
    destRanges.forEach((range) => {
      finalRanges.push(
        sourceRangeToDestinationRange(sourceMap.destination, destination, range)
      );
    });
    return finalRanges.flat();
  } else {
    return destRanges;
  }
};

//this approach only really works for part 1 because it does it for one value not considering ranges. this is just too ridiculus to run billions of times. works for part 1 though
const sourceValueToDestinationValue = (source, destination, value) => {
  const sourceMap = maps.find((map) => {
    //finds that can convert our source value
    return map.source == source;
  });
  if (!sourceMap) {
    console.log("Could not find map with source: " + source);
    return -1; //if its not found returns a -1 for error handling by parent
  }

  const conversionTable = sourceMap.values.find((table) => {
    //finds the conversiontable that would convert our value
    return value >= table.srcRangeStart && value <= table.srcRangeEnd;
  });

  let destValue;
  if (!conversionTable) {
    destValue = value; //if the value isnt in any conversiontables then the destination value is the same as the source value
  } else {
    destValue =
      conversionTable.destRangeStart + (value - conversionTable.srcRangeStart); //otherwise the destination value is the distance of the value from the sourcestart applied to the destination range start
  }

  if (sourceMap.destination != destination) {
    //if the map we just used doesnt convert our value to the destination we want
    //we need to convert the value again
    return sourceValueToDestinationValue(
      sourceMap.destination, //starting at the source of our new value which is this sources destination
      destination, //we still want to go to the original destination
      destValue //with the value of the new value we just found
    );
  } else {
    return destValue; //when the destination is correct we can return the final value
  }
};
