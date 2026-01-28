import { SUITS, RANKS, RED_SUITS } from "./constants";

// ============ CARD UTILITIES ============

export const getCardColor = (suit) => {
  return RED_SUITS.includes(suit) ? "red" : "black";
};

export const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  }
  return deck;
};

export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============ GAME SETUP ============

export const dealNewGame = () => {
  const deck = shuffleDeck(createDeck());
  const tableau = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = {
        ...deck[deckIndex],
        faceUp: row === col,
      };
      tableau[col].push(card);
      deckIndex++;
    }
  }

  const stock = deck
    .slice(deckIndex)
    .map((card) => ({ ...card, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
};

// ============ STATE UTILITIES ============

export const cloneState = (state) => {
  return {
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    foundations: state.foundations.map((f) => f.map((c) => ({ ...c }))),
    tableau: state.tableau.map((t) => t.map((c) => ({ ...c }))),
  };
};

export const autoFlipTableau = (state) => {
  const newTableau = state.tableau.map((pile) => {
    if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
      const newPile = [...pile];
      newPile[newPile.length - 1] = {
        ...newPile[newPile.length - 1],
        faceUp: true,
      };
      return newPile;
    }
    return pile;
  });
  return { ...state, tableau: newTableau };
};

// ============ MOVE VALIDATION ============

export const canMoveToTableau = (cards, targetPile) => {
  if (!cards || cards.length === 0) return false;

  const movingCard = cards[0];

  // Empty pile - only Kings allowed
  if (targetPile.length === 0) {
    return movingCard.rank === 13;
  }

  const topCard = targetPile[targetPile.length - 1];
  if (!topCard.faceUp) return false;

  const movingColor = getCardColor(movingCard.suit);
  const targetColor = getCardColor(topCard.suit);

  // Must be descending rank and alternating color
  return movingCard.rank === topCard.rank - 1 && movingColor !== targetColor;
};

export const canMoveToFoundation = (card, foundationPile) => {
  if (!card) return false;

  // Empty foundation - only Aces allowed
  if (foundationPile.length === 0) {
    return card.rank === 1;
  }

  const topCard = foundationPile[foundationPile.length - 1];
  // Must be same suit and ascending rank
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
};

// ============ CARD RETRIEVAL ============

export const getCardsFromSource = (source, cardIndex, state) => {
  if (source === "waste" && state.waste.length > 0) {
    return [state.waste[state.waste.length - 1]];
  }

  if (source.startsWith("foundation-")) {
    const idx = parseInt(source.split("-")[1], 10);
    if (state.foundations[idx].length > 0) {
      return [state.foundations[idx][state.foundations[idx].length - 1]];
    }
  }

  if (source.startsWith("tableau-")) {
    const idx = parseInt(source.split("-")[1], 10);
    return state.tableau[idx].slice(cardIndex);
  }

  return [];
};

export const removeFromSource = (source, cardIndex, state) => {
  const newState = cloneState(state);

  if (source === "waste") {
    newState.waste.pop();
  } else if (source.startsWith("foundation-")) {
    const idx = parseInt(source.split("-")[1], 10);
    newState.foundations[idx].pop();
  } else if (source.startsWith("tableau-")) {
    const idx = parseInt(source.split("-")[1], 10);
    newState.tableau[idx] = newState.tableau[idx].slice(0, cardIndex);
  }

  return newState;
};

// ============ WIN DETECTION ============

export const checkWin = (state) => {
  if (!state) return false;
  return state.foundations.every((f) => f.length === 13);
};

// ============ SOURCE PARSING ============

export const parseSource = (source) => {
  if (source === "waste") {
    return { type: "waste", index: null };
  }

  if (source.startsWith("foundation-")) {
    return {
      type: "foundation",
      index: parseInt(source.split("-")[1], 10),
    };
  }

  if (source.startsWith("tableau-")) {
    return {
      type: "tableau",
      index: parseInt(source.split("-")[1], 10),
    };
  }

  return { type: null, index: null };
};
