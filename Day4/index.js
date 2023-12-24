const { match } = require("assert");
const fs = require("fs");
const readline = require("readline");

const inputFile = "Day4/test.txt";
const fileStream = fs.createReadStream(inputFile);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

const cards = [];
let cardsPointsSum = 0; //for part 1
const lookupTable = {}; //for part 2
let totalCardCount = 0; //for part 2

rl.on("line", (line) => {
  parseStringToCardObj(line); //goes through each line and creates a card object for it
});

rl.on("close", () => {
  //attributePointsToCards(); //part 1, determines how many points each card is worth

  resolveCards(); //part 2, resolves all the cards for how many cards they will end up creating
  getTotalCardCount(); //part 2, totals up all the cards that would be in the deck after all the resolving

  //for debugging
  //console.log(cards);
  //console.log(lookupTable);

  cards.forEach((card) => {
    console.log(
      "card " +
        card.cardNo +
        ": Matches: " +
        card.matchCount +
        " Creates: " +
        card.createsCardCount
    );
  });

  //results
  //console.log("cardsPointsSum: " + cardsPointsSum); //part 1s answer
  console.log("total card count: " + totalCardCount); //part 2s answer
});

//the parser for creating the card object
const parseStringToCardObj = (line) => {
  const [card, values] = line.split(":");
  const [winning, have] = values.split("|");
  const winningList = winning
    .split(" ")
    .filter((value) => /^\d+$/.test(value))
    .map(Number);
  const haveList = have
    .split(" ")
    .filter((value) => /^\d+$/.test(value))
    .map(Number);
  const cardNo = parseInt(card.match(/\d+/)?.[0], 10);
  const cardObj = {
    cardNo: cardNo,
    winningNos: winningList,
    haveNos: haveList,
  };
  cards.push(cardObj);
};

//Part two solution
const resolveCards = () => {
  cards.forEach((card) => {
    if (card.cardNo in lookupTable) {
      card["createsCardCount"] = lookupTable[card.cardNo]; //if the card was already resolved in the proccess of resolving another card we already know its creation count from the lookup table so we can asign it to the card now
    } else {
      lookupTable[card.cardNo] = cardResolver(card); //if the card hasnt been resolved by any other card we can resolve it now and store its value in the lookup table in case its needed by another card
      card["createsCardCount"] = lookupTable[card.cardNo]; //and assign it to the card
    }
  });
};

const cardResolver = (card) => {
  let cardCreatesCount = 0;
  console.log("resolving card: " + card.cardNo);

  const matchCount = card.haveNos.filter((number) =>
    card.winningNos.includes(number)
  ).length;
  card["matchCount"] = matchCount; //determines the match count for this card

  const cardNosToCopyTo = card.cardNo + matchCount; //what cards we need to check based on this cards match count
  let copiedCards = [];

  for (let i = card.cardNo + 1; i <= cardNosToCopyTo; i++) {
    console.log("card creates a copy of card " + i);
    copiedCards = cards.filter((checkCard) => {
      return (
        checkCard.cardNo > card.cardNo && checkCard.cardNo <= cardNosToCopyTo
      );
    }); //grabs the card objects we need to check
  }

  copiedCards.forEach((copyCard) => {
    //loop those card objects
    if (copyCard.cardNo in lookupTable) {
      //if those card objects are already resolved
      console.log(
        "card " +
          card.cardNo +
          " is requesting lookup of card " +
          copyCard.cardNo
      );
      cardCreatesCount += 1 + lookupTable[copyCard.cardNo]; //this card will create that card(1 card) + the ammount of cards that card creates as well so increment the value by how many cards that card creates
    } else {
      console.log(
        "card " +
          card.cardNo +
          " is requesting resolve of card " +
          copyCard.cardNo
      );
      lookupTable[copyCard.cardNo] = cardResolver(copyCard); //if it hasnt been resolved yet resolve it now and store it in the lookuptable so it doesnt get resolved again.
      cardCreatesCount += 1 + lookupTable[copyCard.cardNo]; //this card will create that card(1 card) + the ammount of cards that card creates as well so increment the value by how many cards that card creates
    }
  });
  console.log(
    "Done resolving card " +
      card.cardNo +
      " It creates " +
      cardCreatesCount +
      " cards"
  );
  return cardCreatesCount; //now that the card is fully resolved we can return its final creation count to be assigned to the card from the original call from the resolveCards function
};

const getTotalCardCount = () => {
  cards.forEach((card) => {
    const cardCreates = card.createsCardCount || 0; //gets how many cards this card creates. if it doesnt create any it wont have a value so make it 0
    totalCardCount += 1 + cardCreates; //the total count from this card is itself plus the cards it makes
  });
};

//part 1 solution
const attributePointsToCards = () => {
  cards.forEach((card) => {
    getCardPoints(card);
  });
};

const getCardPoints = (card) => {
  const matchCount = card.haveNos.filter((number) =>
    card.winningNos.includes(number)
  ).length;
  card["matchCount"] = matchCount;
  const points = Math.floor(2 ** (matchCount - 1));
  card["points"] = points;
  cardsPointsSum += points;
};
