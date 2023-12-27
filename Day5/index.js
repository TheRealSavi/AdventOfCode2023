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
  //part 1
  seeds.forEach((seed) => {
    const location = sourceValueToDestinationValue("seed", "location", seed);
    if (location < lowestLocationValue) {
      lowestLocationValue = location;
    }
  });
  console.log("Lowest Seed Location: " + lowestLocationValue);

  //part 2
  seedRanges.forEach((seedRange) => {
    let locationRanges = mapRangesToDestination("seed", "location", [
      seedRange,
    ]) || [[]];

    locationRanges = locationRanges.sort((a, b) => {
      return a[0] - b[0];
    });

    //if there is a smaller location in one of the ranges then store it
    if (locationRanges[0][0] < lowestLocationValue2) {
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
        range: [
          parseInt(values[1], 10),
          parseInt(values[1], 10) + parseInt(values[2], 10) - 1,
        ],
        d: parseInt(values[0], 10) - parseInt(values[1], 10),
      };
      buildingMap.values.push(map);
    }
  }
};

//part 2
const mapRangesToDestination = (source, destination, ranges) => {
  const sourceMap = maps.find((map) => {
    //finds that can convert our source value
    return map.source == source;
  });
  if (!sourceMap) {
    console.log("Could not find map with source: " + source);
    return -1; //if its not found returns a -1 for error handling by parent
  }

  let mappedRanges = [];

  ranges.forEach((range) => {
    let subMaps = [];
    sourceMap.values.forEach((map) => {
      //if not overlaping
      if (map.range[1] < range[0] || map.range[0] > range[1]) {
        //whatever
      } else {
        const subRange = [
          Math.max(map.range[0], range[0]),
          Math.min(map.range[1], range[1]),
        ];
        subMaps.push({ range: subRange, d: map.d });
      }
    });
    //sort submaps
    subMaps = subMaps.sort((a, b) => {
      return a.range[0] - b.range[0];
    });
    //fill middle gaps
    let gapMaps = [];
    subMaps.map((map, i) => {
      if (subMaps[i + 1]) {
        if (map.range[1] + 1 != subMaps[i + 1].range[0]) {
          gapMaps.push({
            range: [map.range[1] + 1, subMaps[i + 1].range[0] - 1],
            d: 0,
          });
        }
      }
    });
    subMaps.push(...gapMaps);
    //sort submaps
    subMaps = subMaps.sort((a, b) => {
      return a.range[0] - b.range[0];
    });

    //if no ranges were found to map then its just a 1:1
    if (subMaps.length == 0) {
      subMaps.push({ range: [range[0], range[1]], d: 0 });
    } else {
      //if there is a gap at the start fill it
      if (subMaps[0].range[0] != range[0]) {
        subMaps.push({ range: [range[0], subMaps[0].range[0] - 1], d: 0 });
      }
      //sort submaps
      subMaps = subMaps.sort((a, b) => {
        return a.range[0] - b.range[0];
      });
      //if there is a gap at the end fill it
      if (subMaps[subMaps.length - 1].range[1] != range[1]) {
        subMaps.push({
          range: [subMaps[subMaps.length - 1].range[1] + 1, range[1]],
          d: 0,
        });
      }
    }

    // console.log(range);
    // console.log(subMaps);

    subMaps.map((map) => {
      mappedRanges.push([map.range[0] + map.d, map.range[1] + map.d]);
    });
  });

  if (sourceMap.destination != destination) {
    //if the map we just used doesnt convert our value to the destination we want
    //we need to convert the value again
    return mapRangesToDestination(
      sourceMap.destination, //starting at the source of our new value which is this sources destination
      destination, //we still want to go to the original destination
      mappedRanges //with the value of the new value we just found
    );
  } else {
    return mappedRanges; //when the destination is correct we can return the final value
  }
};

//part 1
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

  const rangeMap = sourceMap.values.find((map) => {
    //finds the conversiontable that would convert our value
    return value >= map.range[0] && value <= map.range[1];
  });

  let destValue;
  if (!rangeMap) {
    destValue = value; //if the value isnt in any conversiontables then the destination value is the same as the source value
  } else {
    destValue = rangeMap.d + value; //otherwise the destination value is the distance of the value from the sourcestart applied to the destination range start
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
