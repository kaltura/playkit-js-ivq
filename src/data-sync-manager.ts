// @ts-ignore
import {core} from 'kaltura-player-js';
import {getKeyValue, stringToBoolean} from './utils';
import {KalturaQuiz, KalturaQuizAnswer} from './providers/response-types';
import {KalturaQuizQuestion, QuizData, QuizQuestionMap, Selected, KalturaQuizQuestionTypes} from './types';
import {QuizAnswerSubmitLoader} from './providers/quiz-question-submit-loader';

const {TimedMetadata} = core;

interface TimedMetadataEvent {
  payload: {
    cues: Array<typeof TimedMetadata>;
  };
}

export class DataSyncManager {
  public quizData: QuizData | null = null;
  private _quizAnswers: Array<KalturaQuizAnswer> = [];
  private _quizUserEntryId: number = 0;

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
  public addQuizAnswers(data?: Array<KalturaQuizAnswer>) {
    this._logger.debug('addQuizAnswers', data);
    if (data) {
      this._quizAnswers = data;
    }
  }
  public setQuizUserEntryId(quizUserEntryId: number) {
    this._quizUserEntryId = quizUserEntryId;
  }

  private _sendQuizAnswer = (newAnswer: Selected, questionType: KalturaQuizQuestionTypes, answerId?: string, questionId?: string) => {
    let answerKey;
    if (questionType === KalturaQuizQuestionTypes.TrueFalse) {
      answerKey = Number(newAnswer[0]);
    }
    const params = {
      entryId: this._player.sources.id,
      quizUserEntryId: this._quizUserEntryId,
      parentId: questionId,
      answerKey,
      id: answerId
    };
    return this._player.provider
      .doRequest([{loader: QuizAnswerSubmitLoader, params}])
      .then((data: Map<string, any>) => {
        if (data && data.has(QuizAnswerSubmitLoader.id)) {
          const loader = data.get(QuizAnswerSubmitLoader.id);
          const answerData = loader?.response?.quizAnswer;
          if (!answerData) {
            this._logger.warn('submit answer failed');
          } else {
            return answerData;
          }
        }
      })
  };

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
        onContinue: newAnswer => {
          return this._sendQuizAnswer(newAnswer, cue.metadata.questionType, answer?.id, cue.id)
            .then((a: KalturaQuizAnswer) => {
              // update answer
              quizQuestionsMap.set(cue.id, {...quizQuestionsMap.get(cue.id)!, a});
            })
            .catch((error: Error) => {
              this._logger.warn(error);
              throw error;
            });
        }
      });
    });
    this._onQuestionsLoad(quizQuestionsMap);
  };
}
