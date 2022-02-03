import {VNode} from 'preact';
import {KalturaQuizOptionalAnswer, KalturaQuizQuestion} from './quizTypes';
import {KalturaQuizAnswer} from '../providers/response-types';

export type Selected = string; // TODO: check multi-answer

export interface QuizQuestionUI {
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  questionIndex: [number, number];
  onNext?: () => void;
  onPrev?: () => void;
  onContinue: (data: Selected | null) => void;
  onSkip?: () => void;
}

export interface QuestionProps {
  question: string;
  optionalAnswers: Array<KalturaQuizOptionalAnswer>;
  hint?: string;
  onSelect: (data: Selected) => void;
  selected: Selected;
}

export type QuizTranslates = Record<string, VNode | string>;
