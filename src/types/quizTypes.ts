import {KalturaQuiz, KalturaQuizAnswer} from '../providers/response-types';
import {Selected} from './quizTypesUI';

export interface KalturaQuizOptionalAnswer {
  isCorrect: boolean;
  key: string;
  text: string;
  weight: number;
}

export enum KalturaQuizQuestionTypes {
  MultiChoice = 1,
  TrueFalse = 2,
  Reflection = 3,
  MultiAnswer = 4,
  OpenQuestion = 8
}

export interface KalturaQuizQuestion {
  id: string;
  startTime: number;
  excludeFromScore: boolean;
  optionalAnswers: Array<KalturaQuizOptionalAnswer>;
  question: string;
  questionType: KalturaQuizQuestionTypes;
  hint?: string;
  explanation?: string;
  status: number;
}

export interface PrevNextCue {
  id: string;
  startTime: number;
}

export interface QuizQuestion {
  id: string;
  index: number;
  startTime: number;
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  onContinue: (data: Selected) => Promise<void>;
  skipAvailable: boolean;
  seekAvailable: boolean;
  next?: PrevNextCue;
  prev?: PrevNextCue;
}

export interface QuizData extends KalturaQuiz {
  welcomeMessage: string;
  noSeekAlertText: string;
  inVideoTip: boolean;
  showWelcomePage: boolean;
  canSkip: boolean;
  preventSeek: boolean;
}

export type QuizQuestionMap = Map<string, QuizQuestion>;
