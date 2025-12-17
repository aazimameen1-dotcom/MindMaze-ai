import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateInitialScenario, generateNextTurn, generateEnding } from './services/geminiService';
import { GameState, Scenario, AIResponse, MAX_STATS, MAX_TURNS } from './types';
import StatBar from './components/StatBar';
import TypingText from './components/TypingText';
import { Brain, Sun, Ghost, Menu, RotateCcw, Save, Play } from 'lucide-react';

const STORAGE_KEY = 'mindmaze_ai_save';

const App: React.FC = () => {
  // Application State
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [endingData, setEndingData] = useState<{title: string, description: string} | null>(null);

  // Game Logic State
  const [gameState, setGameState] = useState<GameState>({
    sanity: 50,
    hope: 50,
    fear: 10,
    turn: 1,
    history: [],
    isGameOver: false,
  });

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);

  // Helper to clamp values
  const clamp = (val: number) => Math.max(0, Math.min(MAX_STATS, val));

  // Initialize Game
  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setEndingData(null);
    try {
      const initialData = await generateInitialScenario();
      setGameState({
        sanity: 50,
        hope: 50,
        fear: 10,
        turn: 1,
        history: [],
        isGameOver: false
      });
      setCurrentScenario({
        narrative: initialData.narrative,
        choices: initialData.choices,
        environment_description: initialData.environment
      });
      setHasStarted(true);
      setShowMenu(false);
    } catch (e) {
      console.error(e);
      alert("Failed to contact the MindMaze core (API Error). Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Player Choice
  const handleChoice = async (choiceText: string) => {
    if (gameState.isGameOver || isLoading) return;

    setIsLoading(true);
    try {
      // 1. Get AI response for NEXT state based on THIS choice
      const nextData: AIResponse = await generateNextTurn(gameState, choiceText);

      // 2. Update Stats (based on what AI returned as impact of previous choice)
      const updates = nextData.stat_updates || { sanity: 0, hope: 0, fear: 0 };
      
      const newSanity = clamp(gameState.sanity + updates.sanity);
      const newHope = clamp(gameState.hope + updates.hope);
      const newFear = clamp(gameState.fear + updates.fear);
      const newTurn = gameState.turn + 1;

      // 3. Check Game Over Conditions
      let isOver = false;
      if (newTurn > MAX_TURNS || newSanity <= 0 || newFear >= 100) {
        isOver = true;
      }

      // 4. Update State
      const newState: GameState = {
        sanity: newSanity,
        hope: newHope,
        fear: newFear,
        turn: newTurn,
        isGameOver: isOver,
        history: [
          ...gameState.history,
          { userChoice: choiceText, narrativeSummary: currentScenario?.narrative.slice(0, 100) || "" }
        ]
      };

      setGameState(newState);
      
      if (isOver) {
        const end = await generateEnding(newState);
        setEndingData(end);
      } else {
        setCurrentScenario({
          narrative: nextData.narrative,
          choices: nextData.choices,
          environment_description: nextData.environment
        });
      }

      // Auto-save
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ gameState: newState, currentScenario: {
          narrative: nextData.narrative,
          choices: nextData.choices,
          environment_description: nextData.environment
      } }));

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGame = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGameState(parsed.gameState);
      setCurrentScenario(parsed.currentScenario);
      setHasStarted(true);
      setShowMenu(false);
      setEndingData(null);
    }
  };

  // UI Components
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-maze-dark text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-maze-dark to-black -z-10"></div>
        <div className="absolute w-[500px] h-[500px] bg-maze-blue/5 rounded-full blur-[100px] animate-pulse-slow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

        <h1 className="text-6xl md:text-8xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-maze-blue to-purple-600 animate-fade-in">
          MINDMAZE
        </h1>
        <p className="text-gray-400 font-mono text-sm tracking-[0.3em] mb-12 animate-fade-in opacity-80">
          ARTIFICIAL INTELLIGENCE NARRATIVE
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={startNewGame}
            disabled={isLoading}
            className="group relative px-6 py-4 bg-gray-900 border border-maze-blue/30 hover:border-maze-blue hover:bg-maze-blue/10 transition-all duration-300 rounded text-maze-blue font-bold tracking-wider uppercase flex items-center justify-center gap-2"
          >
            {isLoading ? "Initializing..." : <><Play size={18} /> Initiate Sequence</>}
            <div className="absolute inset-0 bg-maze-blue/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {localStorage.getItem(STORAGE_KEY) && (
            <button 
              onClick={loadGame}
              disabled={isLoading}
              className="px-6 py-4 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white transition-all duration-300 rounded font-mono text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Resume Session
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-maze-dark text-gray-200 font-sans selection:bg-maze-blue/30 flex flex-col items-center relative">
      
      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
          <div className="p-8 border border-gray-800 bg-gray-900/80 rounded-xl max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-6 text-white">System Menu</h2>
            <div className="space-y-3">
              <button onClick={() => setShowMenu(false)} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded text-sm uppercase tracking-wider">Resume</button>
              <button onClick={startNewGame} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded text-sm uppercase tracking-wider text-maze-red">Restart Simulation</button>
              <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setShowMenu(false); setHasStarted(false); }} className="w-full py-3 bg-transparent border border-gray-800 hover:border-red-900 text-gray-500 rounded text-sm">Clear Data</button>
            </div>
          </div>
        </div>
      )}

      {/* Main HUD Header */}
      <header className="w-full max-w-4xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-800/50 bg-maze-dark/50 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <h1 className="font-bold text-xl tracking-tighter text-gray-100">MINDMAZE <span className="text-maze-blue text-xs align-top">AI</span></h1>
          <button onClick={() => setShowMenu(true)} className="p-2 hover:bg-gray-800 rounded md:hidden">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-center">
          <StatBar 
            label="Sanity" 
            value={gameState.sanity} 
            colorClass="bg-maze-blue shadow-[0_0_10px_rgba(0,212,255,0.5)]" 
            icon={<Brain size={12} className="text-maze-blue" />}
          />
          <StatBar 
            label="Hope" 
            value={gameState.hope} 
            colorClass="bg-maze-yellow shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
            icon={<Sun size={12} className="text-maze-yellow" />}
          />
          <StatBar 
            label="Fear" 
            value={gameState.fear} 
            colorClass="bg-maze-red shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
            icon={<Ghost size={12} className="text-maze-red" />}
          />
        </div>

        <button onClick={() => setShowMenu(true)} className="hidden md:block p-2 text-gray-500 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </header>

      {/* Game Content */}
      <main className="flex-1 w-full max-w-3xl p-6 flex flex-col justify-center gap-8 relative z-10">
        
        {/* Progress Indicator */}
        <div className="absolute top-4 right-6 text-xs font-mono text-gray-600">
          Turn: {gameState.turn.toString().padStart(2, '0')}/{MAX_TURNS}
        </div>

        {/* Ending Screen */}
        {gameState.isGameOver && endingData ? (
           <div className="animate-fade-in text-center p-8 border border-gray-800 bg-gray-900/50 rounded-lg shadow-2xl">
             <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">{endingData.title}</h2>
             <div className="text-lg leading-relaxed text-gray-300 mb-8 whitespace-pre-wrap">{endingData.description}</div>
             
             <div className="grid grid-cols-3 gap-4 mb-8 bg-black/40 p-4 rounded text-sm font-mono">
               <div>
                 <span className="block text-gray-500 text-xs uppercase">Sanity</span>
                 <span className="text-maze-blue text-xl">{gameState.sanity}</span>
               </div>
               <div>
                 <span className="block text-gray-500 text-xs uppercase">Hope</span>
                 <span className="text-maze-yellow text-xl">{gameState.hope}</span>
               </div>
               <div>
                 <span className="block text-gray-500 text-xs uppercase">Fear</span>
                 <span className="text-maze-red text-xl">{gameState.fear}</span>
               </div>
             </div>

             <button onClick={startNewGame} className="px-8 py-3 bg-maze-blue hover:bg-blue-400 text-black font-bold rounded transition-all">
               Initialize New Subject
             </button>
           </div>
        ) : (
          /* Active Gameplay */
          <>
            {/* Environment Tag */}
            <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
                  {isLoading ? "Processing..." : currentScenario?.environment_description || "Unknown"}
                </span>
            </div>

            {/* Narrative Box */}
            <div className="min-h-[150px] md:min-h-[200px] text-lg md:text-xl leading-relaxed text-gray-100 font-light border-l-2 border-maze-blue/50 pl-6 py-2">
               {isLoading ? (
                 <div className="flex items-center gap-2 text-maze-blue font-mono animate-pulse">
                   <div className="w-2 h-2 bg-maze-blue rounded-full"></div>
                   Generated Reality Loading...
                 </div>
               ) : (
                 <TypingText text={currentScenario?.narrative || ""} speed={15} />
               )}
            </div>

            {/* Choices Grid */}
            <div className={`grid gap-4 mt-8 transition-opacity duration-500 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {currentScenario?.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice.text)}
                  className="group relative text-left p-5 rounded-lg bg-gray-900 border border-gray-800 hover:border-maze-blue/50 transition-all duration-300 hover:transform hover:translate-x-1 active:scale-[0.99] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-maze-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="font-mono text-xs text-gray-500 mb-1 block group-hover:text-maze-blue transition-colors">OPTION 0{idx + 1}</span>
                  <span className="text-gray-200 group-hover:text-white text-lg font-medium">{choice.text}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="w-full p-4 text-center text-xs text-gray-700 font-mono">
        Powered by Google Gemini 2.5 Flash
      </footer>
    </div>
  );
};

export default App;