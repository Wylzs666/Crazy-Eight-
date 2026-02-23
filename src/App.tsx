import React, { useState, useEffect } from 'react';
import { Card } from './components/Card';
import { CardType, Suit } from './types';
import { createDeck, shuffle, isValidCard, suitToSymbol } from './utils/game';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [aiHand, setAiHand] = useState<CardType[]>([]);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [activeSuit, setActiveSuit] = useState<Suit>('hearts');
  const [winner, setWinner] = useState<'player' | 'ai' | 'draw' | null>(null);
  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [message, setMessage] = useState('Welcome to Crazy Eights!');
  const [consecutivePasses, setConsecutivePasses] = useState(0);

  const startNewGame = () => {
    const newDeck = shuffle(createDeck());
    const newPlayerHand = newDeck.splice(0, 8);
    const newAiHand = newDeck.splice(0, 8);
    let initialTopCard = newDeck.pop()!;
    
    while (initialTopCard.rank === '8') {
      newDeck.unshift(initialTopCard);
      initialTopCard = newDeck.pop()!;
    }
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setAiHand(newAiHand);
    setDiscardPile([initialTopCard]);
    setActiveSuit(initialTopCard.suit);
    setTurn('player');
    setWinner(null);
    setShowSuitPicker(false);
    setMessage('Game started. Your turn!');
    setConsecutivePasses(0);
  };

  // Initialize game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  const topCard = discardPile[discardPile.length - 1];
  const hasValidCard = playerHand.some(c => isValidCard(c, topCard, activeSuit));
  const canPlayerPass = turn === 'player' && deck.length === 0 && !hasValidCard;

  // Check for draw by consecutive passes
  useEffect(() => {
    if (consecutivePasses >= 2 && !winner) {
      if (playerHand.length < aiHand.length) {
        setWinner('player');
        setMessage('Game over! No more moves. You win by having fewer cards!');
      } else if (aiHand.length < playerHand.length) {
        setWinner('ai');
        setMessage('Game over! No more moves. AI wins by having fewer cards!');
      } else {
        setWinner('draw');
        setMessage('Game over! No more moves. It\'s a draw!');
      }
    }
  }, [consecutivePasses, winner, playerHand.length, aiHand.length]);

  // AI Turn Logic
  useEffect(() => {
    if (turn === 'ai' && !winner && !showSuitPicker && discardPile.length > 0) {
      const timer = setTimeout(() => {
        const currentTopCard = discardPile[discardPile.length - 1];
        const validCards = aiHand.filter(c => isValidCard(c, currentTopCard, activeSuit));
        
        if (validCards.length > 0) {
          // Play card
          let cardToPlay = validCards.find(c => c.rank !== '8');
          if (!cardToPlay) cardToPlay = validCards[0]; // must be an 8

          const newHand = aiHand.filter(c => c.id !== cardToPlay!.id);
          setAiHand(newHand);
          setDiscardPile(prev => [...prev, cardToPlay!]);
          setConsecutivePasses(0);

          if (cardToPlay!.rank === '8') {
            // Pick suit
            const suitsCount = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            newHand.forEach(c => {
              if (c.rank !== '8') suitsCount[c.suit]++;
            });
            const bestSuit = (Object.keys(suitsCount) as Suit[]).reduce((a, b) => suitsCount[a] > suitsCount[b] ? a : b);
            setActiveSuit(bestSuit);
            setMessage(`AI played 8 and chose ${suitToSymbol(bestSuit)}`);
          } else {
            setActiveSuit(cardToPlay!.suit);
            setMessage(`AI played ${cardToPlay!.rank} of ${suitToSymbol(cardToPlay!.suit)}`);
          }

          if (newHand.length === 0) {
            setWinner('ai');
          } else {
            setTurn('player');
          }
        } else {
          // No valid cards
          if (deck.length > 0) {
            // Draw
            const drawnCard = deck[deck.length - 1];
            setDeck(prev => prev.slice(0, -1));
            setAiHand(prev => [...prev, drawnCard]);
            setMessage(`AI drew a card`);
            setConsecutivePasses(0);
            // Turn remains 'ai', will trigger again
          } else {
            // Pass
            setMessage(`AI passed`);
            setConsecutivePasses(prev => prev + 1);
            setTurn('player');
          }
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, deck, discardPile, activeSuit, winner, showSuitPicker]);

  const handlePlayCard = (card: CardType) => {
    if (turn !== 'player' || showSuitPicker || winner) return;
    if (!isValidCard(card, topCard, activeSuit)) return;

    const newHand = playerHand.filter(c => c.id !== card.id);
    setPlayerHand(newHand);
    setDiscardPile([...discardPile, card]);
    setConsecutivePasses(0);

    if (card.rank === '8') {
      setShowSuitPicker(true);
      setMessage('Choose a suit for your 8');
    } else {
      setActiveSuit(card.suit);
      if (newHand.length === 0) {
        setWinner('player');
      } else {
        setTurn('ai');
        setMessage(`You played ${card.rank} of ${suitToSymbol(card.suit)}`);
      }
    }
  };

  const handlePickSuit = (suit: Suit) => {
    setActiveSuit(suit);
    setShowSuitPicker(false);
    if (playerHand.length === 0) {
      setWinner('player');
    } else {
      setTurn('ai');
      setMessage(`You played 8 and chose ${suitToSymbol(suit)}`);
    }
  };

  const handleDraw = () => {
    if (turn !== 'player' || showSuitPicker || winner) return;
    if (deck.length === 0) return;
    
    const drawnCard = deck[deck.length - 1];
    setDeck(deck.slice(0, -1));
    setPlayerHand([...playerHand, drawnCard]);
    setMessage(`You drew a card`);
    setConsecutivePasses(0);
  };

  const handlePass = () => {
    if (turn !== 'player' || showSuitPicker || winner) return;
    setConsecutivePasses(prev => prev + 1);
    setTurn('ai');
    setMessage(`You passed`);
  };

  if (discardPile.length === 0) return null;

  return (
    <div className="min-h-screen bg-emerald-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 text-center bg-emerald-950 shadow-md z-10">
        <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-widest uppercase">Crazy Eights</h1>
        <p className="text-sm sm:text-base text-emerald-200 mt-1 h-6">{message}</p>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 relative">
        
        {/* AI Hand */}
        <div className="flex flex-col items-center w-full">
          <div className="mb-2 text-sm font-semibold text-emerald-300 flex items-center gap-2">
            <span>AI Opponent</span>
            <span className="bg-emerald-800 px-2 py-0.5 rounded-full text-xs">{aiHand.length} cards</span>
          </div>
          <div className="flex justify-center max-w-full overflow-hidden px-4">
            <div className="flex">
              {aiHand.map((card, i) => (
                <motion.div 
                  key={card.id}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ 
                    marginLeft: i === 0 ? 0 : '-1.5rem',
                    zIndex: i,
                  }}
                >
                  <Card faceDown />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Table */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 my-8 w-full">
          {/* Draw Pile */}
          <div className="flex flex-col items-center">
            <div 
              className={`relative transition-transform hover:scale-105 ${turn === 'player' && !showSuitPicker && deck.length > 0 ? 'ring-4 ring-yellow-400 rounded-lg shadow-lg shadow-yellow-400/20 cursor-pointer' : ''}`}
              onClick={handleDraw}
            >
              {deck.length > 0 ? (
                <>
                  {deck.length > 1 && <div className="absolute top-1 left-1"><Card faceDown /></div>}
                  {deck.length > 2 && <div className="absolute top-2 left-2"><Card faceDown /></div>}
                  <div className="relative z-10"><Card faceDown /></div>
                </>
              ) : (
                <div className="w-16 h-24 sm:w-24 sm:h-36 rounded-lg border-2 border-dashed border-emerald-500/50 flex items-center justify-center text-emerald-500/50 text-sm font-medium">
                  Empty
                </div>
              )}
            </div>
            <div className="mt-3 text-xs font-medium text-emerald-300 bg-emerald-950/50 px-3 py-1 rounded-full">
              {deck.length} remaining
            </div>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {discardPile.length > 0 && (
                <motion.div
                  key={discardPile[discardPile.length - 1].id}
                  initial={{ scale: 1.2, opacity: 0, rotate: Math.random() * 20 - 10 }}
                  animate={{ scale: 1, opacity: 1, rotate: Math.random() * 10 - 5 }}
                >
                  <Card card={discardPile[discardPile.length - 1]} />
                </motion.div>
              )}
            </div>
            <div className="mt-3 text-xs font-medium text-emerald-300 bg-emerald-950/50 px-3 py-1 rounded-full flex items-center gap-1">
              Suit: <span className={`text-lg leading-none ${activeSuit === 'hearts' || activeSuit === 'diamonds' ? 'text-red-400' : 'text-white'}`}>{suitToSymbol(activeSuit)}</span>
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex flex-col items-center w-full">
          <div className="mb-4 text-sm font-semibold text-emerald-300 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Your Hand</span>
              <span className="bg-emerald-800 px-2 py-0.5 rounded-full text-xs">{playerHand.length} cards</span>
            </div>
            {canPlayerPass && (
              <button 
                onClick={handlePass}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-full text-xs font-bold transition-colors shadow-lg animate-pulse"
              >
                Pass Turn
              </button>
            )}
          </div>
          
          {/* Scrollable container for player hand */}
          <div className="w-full overflow-x-auto pb-8 hide-scrollbar flex justify-center">
            <div className="flex px-4" style={{ minWidth: 'min-content' }}>
              <AnimatePresence>
                {playerHand.map((card, i) => {
                  const playable = turn === 'player' && !showSuitPicker && isValidCard(card, topCard, activeSuit);
                  return (
                    <motion.div 
                      key={card.id} 
                      layout
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0, scale: 0.8 }}
                      className="relative transition-transform duration-200 hover:-translate-y-6 hover:z-50 group"
                      style={{ 
                        marginLeft: i === 0 ? 0 : '-2rem',
                        zIndex: i,
                      }}
                    >
                      <Card 
                        card={card} 
                        isPlayable={playable}
                        onClick={() => handlePlayCard(card)}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Suit Picker Modal */}
      <AnimatePresence>
        {showSuitPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-black p-6 rounded-3xl shadow-2xl max-w-sm w-full mx-4"
            >
              <h2 className="text-2xl font-black text-center mb-6">Choose a Suit</h2>
              <div className="grid grid-cols-2 gap-4">
                {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map(suit => (
                  <button
                    key={suit}
                    onClick={() => handlePickSuit(suit)}
                    className={`py-6 rounded-2xl text-5xl flex items-center justify-center transition-all border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 hover:scale-105 active:scale-95 ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-slate-900'}`}
                  >
                    {suitToSymbol(suit)}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-black p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center"
            >
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tight text-emerald-900">
                {winner === 'player' ? 'You Win! 🎉' : winner === 'ai' ? 'AI Wins! 🤖' : 'Draw! 🤝'}
              </h2>
              <p className="text-slate-600 mb-8 text-lg">{message}</p>
              <button
                onClick={startNewGame}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
