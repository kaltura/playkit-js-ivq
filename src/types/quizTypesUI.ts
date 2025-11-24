import {VNode} from 'preact';
import {KalturaQuizOptionalAnswer, KalturaQuizQuestion} from './quizTypes';
import {KalturaQuizAnswer} from '../providers/response-types';

export type Selected = string;

export interface QuizQuestionUI {
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  questionIndex: [number, number];
  onNext?: () => void;
  onPrev?: () => void;
  onContinue: (data: Selected | null) => Promise<void>;
  onSkip?: () => void;
  disabled: boolean;
}

export interface QuestionProps {
  question: string;
  optionalAnswers: Array<KalturaQuizOptionalAnswer>;
  questionIndex: number;
  hint?: string;
  onSelect?: (data: Selected, byKeyboard?: boolean) => void;
  selected: Selected;
}

export type QuizTranslates = Record<string, VNode | string>;

export interface SubmissionDetails {
  onReview: () => void;
  submitAllowed: boolean;
}
