// @ts-ignore
import {core} from 'kaltura-player-js';
import {KalturaQuiz, KalturaQuizAnswer} from './providers/response-types';

const ACTIVE_QUESTION_TIME_DELTA = 0.001; // TODO: discuss it

const {TimedMetadata} = core;

interface TimedMetadataEvent {
  payload: {
    cues: Array<typeof TimedMetadata>;
  };
}

interface KalturaQuizOptionalAnswer {
  isCorrect: boolean;
  key: string;
  text: string;
  weight: number;
}

enum KalturaQuizQuestionTypes {
  MultiChoise = 1,
  TrueFalse = 2,
  Reflection = 3,
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

export interface QuizQuestion {
  id: string;
  index: number;
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  onContinue: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export type QuizQuestionMap = Record<string, QuizQuestion>;

export type OnQuestionBecomeActive = (questions: Array<KalturaQuizQuestion>) => void;

export class DataSyncManager {
  public quizData: KalturaQuiz | null = null;
  private _quizAnswers: Array<KalturaQuizAnswer> = [];

  constructor(
    private _onQuestionsLoad: (qqm: QuizQuestionMap) => void,
    private _onQuestionBecomeActive: OnQuestionBecomeActive,
    private _eventManager: KalturaPlayerTypes.EventManager,
    private _player: KalturaPlayerTypes.Player,
    private _logger: any
  ) {
    this._syncEvents();
  }

  private _syncEvents = () => {
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_CHANGE, this._onTimedMetadataChange);
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  public addQuizData(data: KalturaQuiz) {
    this._logger.debug('addQuizData', data);
    this.quizData = data;
  }
  public addQuizAnswers(data: Array<KalturaQuizAnswer>) {
    this._logger.debug('addQuizAnswers', data);
    this._quizAnswers = data;
  }

  private _getQuizQuePoints = (data: Array<typeof TimedMetadata>) => {
    return data.filter(cue => cue?.type === TimedMetadata.TYPE.CUE_POINT && cue.metadata?.cuePointType === 'quiz.QUIZ_QUESTION');
  };

  private _onTimedMetadataChange = ({payload}: TimedMetadataEvent) => {
    const quizCues = this._getQuizQuePoints(payload.cues);
    this._onQuestionBecomeActive(quizCues);
  };
  private _onTimedMetadataAdded = ({payload}: TimedMetadataEvent) => {
    const quizCues = this._getQuizQuePoints(payload.cues);
    const quizQuestionsMap: QuizQuestionMap = {};
    quizCues.forEach((cue, index) => {
      const answer = this._quizAnswers.find((answer: KalturaQuizAnswer) => {
        return cue.id === answer.parentId;
      });
      let onNext;
      let onPrev;
      if (index > 0) {
        onPrev = () => {
          this._player.currentTime = quizCues[index - 1].startTime + ACTIVE_QUESTION_TIME_DELTA;
        };
      }
      if (index + 1 < quizCues.length) {
        onNext = () => {
          this._player.currentTime = quizCues[index + 1].startTime + ACTIVE_QUESTION_TIME_DELTA;
        };
      }
      quizQuestionsMap[cue.id] = {
        id: cue.id,
        index,
        q: cue.metadata,
        a: answer,
        onNext,
        onPrev,
        onContinue: () => {
          // TODO: send API call to submit question
        }
      };
    });
    this._onQuestionsLoad(quizQuestionsMap);
  };
}
