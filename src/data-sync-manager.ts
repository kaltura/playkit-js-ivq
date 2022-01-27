// @ts-ignore
import {core} from 'kaltura-player-js';
import {getKeyValue, stringToBoolean} from './utils';
import {KalturaQuiz, KalturaQuizAnswer} from './providers/response-types';

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

export enum KalturaQuizQuestionTypes {
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
  onContinue: () => void;
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
  banSeek: boolean;
}

export type QuizQuestionMap = Map<string, QuizQuestion>;

export class DataSyncManager {
  public quizData: QuizData | null = null;
  private _quizAnswers: Array<KalturaQuizAnswer> = [];

  constructor(
    private _onQuestionsLoad: (qqm: QuizQuestionMap) => void,
    private _onQuestionBecomeActive: (qq: KalturaQuizQuestion) => void,
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
    this.quizData = {
      ...data,
      welcomeMessage: getKeyValue(data.uiAttributes, 'welcomeMessage'),
      noSeekAlertText: getKeyValue(data.uiAttributes, 'noSeekAlertText'),
      inVideoTip: stringToBoolean(getKeyValue(data.uiAttributes, 'inVideoTip')),
      showWelcomePage: stringToBoolean(getKeyValue(data.uiAttributes, 'showWelcomePage')),
      canSkip: stringToBoolean(getKeyValue(data.uiAttributes, 'canSkip')),
      banSeek: stringToBoolean(getKeyValue(data.uiAttributes, 'banSeek'))
    };
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
    const filteredQuizCues = quizCues.filter(cue => {
      return cue.endTime !== this._player.currentTime;
    });
    if (filteredQuizCues.length) {
      this._onQuestionBecomeActive(filteredQuizCues[0]);
    }
  };
  private _onTimedMetadataAdded = ({payload}: TimedMetadataEvent) => {
    const quizCues = this._getQuizQuePoints(payload.cues);
    const quizQuestionsMap: QuizQuestionMap = new Map();
    quizCues.forEach((cue, index) => {
      const answer = this._quizAnswers.find((answer: KalturaQuizAnswer) => {
        return cue.id === answer.parentId;
      });
      let prev = quizCues[index - 1];
      let next = quizCues[index + 1];
      if (prev) {
        prev = {
          id: prev.id,
          startTime: prev.startTime
        };
      }
      if (next) {
        next = {
          id: next.id,
          startTime: next.startTime
        };
      }
      quizQuestionsMap.set(cue.id, {
        id: cue.id,
        index,
        startTime: cue.startTime,
        q: cue.metadata,
        a: answer,
        next,
        prev,
        skipAvailable: this.quizData!.canSkip,
        seekAvailable: !this.quizData!.banSeek,
        onContinue: () => {
          // TODO: send API call to submit question
        }
      });
    });
    this._onQuestionsLoad(quizQuestionsMap);
  };
}
