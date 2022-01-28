import {VNode} from 'preact';
import {KalturaQuizOptionalAnswer, KalturaQuizQuestion} from './quizTypes';
import {KalturaQuizAnswer} from '../providers/response-types';

export type Selected = Array<string | number>;

export interface QuizQuestionUI {
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  questionIndex: [number, number];
  onNext?: () => void;
  onPrev?: () => void;
  onContinue: (data: Selected) => void;
  onSkip?: () => void;
}

export interface QuestionProps {
  question: string;
  optionalAnswers: Array<KalturaQuizOptionalAnswer>;
  hint?: string;
  onSelect: (data: Selected) => void;
  selected: Selected;
}

export type QuizTranslates = Record<string, VNode>;
