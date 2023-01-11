import {VNode} from 'preact';
import {KalturaQuizOptionalAnswer, KalturaQuizQuestion, QuizQuestion} from './quizTypes';
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

export interface SubmissionDetails {
  onReview: () => void;
  submitAllowed: boolean;
}

export type OnClick = (e: KeyboardEvent | MouseEvent, byKeyboard?: boolean) => void;

export interface TimelineMarkerProps {
  class: string;
  className: string;
  style: Record<string, any>;
  onClick: (e: Event) => void;
  isDisabled: () => boolean;
  getSeekBarNode: () => Element | null;
  questionIndex: number;
}

export interface TimeLineMarker {
  marker: {
    get: (props: TimelineMarkerProps) => VNode;
    width?: number;
    height?: number;
  };
  time: number;
  preview?: {
    get: ({defaultPreviewProps}: PreviewProps) => VNode;
    props: {
      style: Record<string, string>;
    };
    className: string;
    width: number;
    hideTime: boolean;
    sticky: boolean;
  };
}
