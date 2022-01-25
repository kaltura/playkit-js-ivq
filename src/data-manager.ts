// @ts-ignore
import {core} from 'kaltura-player-js';
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

enum KalturaQuizQuestionTypes {
  MultiChoise = 1,
  TrueFalse = 2,
  Reflection = 3,
  OpenQuestion = 8
}

interface KalturaQuizQuestion {
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
  q: KalturaQuizQuestion;
  a?: KalturaQuizAnswer;
  onNext: () => void;
  onPrev: () => void;
  onContinue: () => void;
}

export type OnQuestionBecomeActive = (questions: Array<QuizQuestion>) => void;

export class DataManager {
  public quizQuestions: Record<string, QuizQuestion> = {};
  public quizData: KalturaQuiz | null = null;
  _quizAnswers: Array<KalturaQuizAnswer> = [];

  constructor(
    private _onQuestionsLoad: (qq: QuizQuestion[]) => void,
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

  private _getQuizQuePoints = (data: any[]) => {
    return data.filter(cue => cue?.type === TimedMetadata.TYPE.CUE_POINT && cue.metadata?.cuePointType === 'quiz.QUIZ_QUESTION');
  };

  private _onTimedMetadataChange = ({payload}: TimedMetadataEvent) => {
    const quizCues = this._getQuizQuePoints(payload.cues);
    this._onQuestionBecomeActive(quizCues.map(cue => this.quizQuestions[cue.id]));
  };
  private _onTimedMetadataAdded = ({payload}: TimedMetadataEvent) => {
    const quizCues = this._getQuizQuePoints(payload.cues);

    quizCues.forEach(cue => {
      const answer = this._quizAnswers.find((answer: KalturaQuizAnswer) => {
        return cue.id === answer.parentId;
      });
      this.quizQuestions[cue.id] = {
        id: cue.id,
        q: cue.metadata,
        a: answer,
        onNext: () => {},
        onPrev: () => {}
      };
    });
    this._onQuestionsLoad();
  };
}
