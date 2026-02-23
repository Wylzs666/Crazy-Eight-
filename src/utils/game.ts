import { CardType, Suit, Rank } from '../types';

export const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = (): CardType[] => {
  const deck: CardType[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const isValidCard = (card: CardType, topCard: CardType, activeSuit: Suit): boolean => {
  if (card.rank === '8') return true;
  if (card.suit === activeSuit) return true;
  if (card.rank === topCard.rank) return true;
  return false;
};

export const suitToSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};
