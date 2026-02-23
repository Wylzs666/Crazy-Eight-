import React from 'react';
import { CardType } from '../types';
import { suitToSymbol } from '../utils/game';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ card, faceDown, isPlayable, onClick }) => {
  if (faceDown) {
    return (
      <div 
        onClick={onClick}
        className="w-16 h-24 sm:w-24 sm:h-36 rounded-lg bg-blue-800 border-2 border-white shadow-md flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-700 to-blue-900 cursor-pointer"
      >
         <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)] rounded-lg"></div>
      </div>
    );
  }

  if (!card) return null;

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbol = suitToSymbol(card.suit);

  return (
    <div 
      onClick={onClick}
      className={`relative w-16 h-24 sm:w-24 sm:h-36 rounded-lg bg-white border border-gray-300 shadow-md flex flex-col justify-between p-1 sm:p-2 select-none transition-all duration-200 ${isPlayable ? 'cursor-pointer ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''} ${isRed ? 'text-red-600' : 'text-slate-900'}`}
    >
      <div className="text-sm sm:text-lg font-bold leading-none">{card.rank}</div>
      <div className="text-3xl sm:text-5xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{suitSymbol}</div>
      <div className="text-sm sm:text-lg font-bold leading-none self-end rotate-180">{card.rank}</div>
    </div>
  );
};
