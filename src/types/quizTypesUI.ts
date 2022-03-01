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
  disabled: boolean;
}

export interface QuestionProps {
  question: string;
  optionalAnswers: Array<KalturaQuizOptionalAnswer>;
  hint?: string;
  onSelect?: (data: Selected) => void;
  selected: Selected;
}

export type QuizTranslates = Record<string, VNode | string>;

export interface DefaultPreviewProps {
  virtualTime: number;
}

export interface PreviewProps {
  defaultPreviewProps: DefaultPreviewProps;
}

export interface ThumbnailInfo {
  height: number;
  url: string;
  width: number;
  x: number;
  y: number;
}

export interface MarkerProps {
  class: string;
  className: string;
  style: Record<string, any>;
}

export interface SubmissionDetails {
  onSubmit?: () => Promise<void>;
  onReview: () => void;
}
