export type ThemeMode = 'clean-light' | 'focused-dark' | 'warm-editorial';

export type CardType = 'narrative' | 'example' | 'comparison' | 'checkpoint';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizCheckpoint {
  question: string;
  options: QuizOption[];
  explanation: string;
  sourceExcerpt?: string;
}

export interface LessonCard {
  id: string;
  type: CardType;
  title: string;
  content: string;
  isLocked?: boolean;
  visualSvg?: string; // Optional concept diagram
  checkpoint?: QuizCheckpoint; // Present if type === 'checkpoint'
}

export interface Lesson {
  id: string;
  title: string;
  author: string;
  sourceUrl: string;
  sourceSnippet: string;
  estimatedMinutes: number;
  createdAt: string;
  cards: LessonCard[];
}

export type GenerationStageId = 
  | 'understanding' 
  | 'planning' 
  | 'cards' 
  | 'checks' 
  | 'quality' 
  | 'ready';

export interface GenerationStage {
  id: GenerationStageId;
  label: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
}
