export interface StatImpact {
  sanity: number;
  hope: number;
  fear: number;
}

export interface Choice {
  id: number;
  text: string;
  impact_description: string; // Hidden hint for the AI logic, not necessarily shown
}

export interface Scenario {
  narrative: string;
  choices: Choice[];
  environment_description: string; // Short text for UI atmosphere
}

export interface GameState {
  sanity: number;
  hope: number;
  fear: number;
  turn: number;
  history: Array<{
    userChoice: string;
    narrativeSummary: string;
  }>;
  isGameOver: boolean;
}

export interface AIResponse {
  narrative: string;
  choices: Choice[];
  environment: string;
  stat_updates?: {
    sanity: number;
    hope: number;
    fear: number;
  }
}

export const MAX_STATS = 100;
export const MAX_TURNS = 12;
