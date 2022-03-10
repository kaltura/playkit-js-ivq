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
    private _enableSeekControl: () => void,
    private _eventManager: KalturaPlayerTypes.EventManager,
    private _player: KalturaPlayerTypes.Player,
    private _logger: KalturaPlayerTypes.Logger
  ) {}

  private _syncEvents = () => {
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_CHANGE, this._onTimedMetadataChange);
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  public initDataManager(rawQuizData: KalturaQuiz, quizUserEntryId: number, quizAnswers: KalturaQuizAnswer[] = []) {
    this._logger.debug('initDataManager', rawQuizData, quizUserEntryId, quizAnswers);
    this.quizData = {
      ...rawQuizData,
      welcomeMessage: getKeyValue(rawQuizData.uiAttributes, 'welcomeMessage'),
      noSeekAlertText: getKeyValue(rawQuizData.uiAttributes, 'noSeekAlertText'),
      inVideoTip: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'inVideoTip')),
      showWelcomePage: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'showWelcomePage')),
      canSkip: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'canSkip')),
      preventSeek: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'banSeek'))
    };
    this._quizUserEntryId = quizUserEntryId;
    this._quizAnswers = quizAnswers;
    if (this.quizData.preventSeek) {
      this._enableSeekControl();
    }
    this._syncEvents();
  }

  private _sendQuizAnswer = (newAnswer: Selected, questionType: KalturaQuizQuestionTypes, updatedAnswerId?: string, questionId?: string) => {
    let answerKey = '1'; // default answerKey for Reflection and OpenAnswer
    if ([KalturaQuizQuestionTypes.TrueFalse, KalturaQuizQuestionTypes.MultiAnswer, KalturaQuizQuestionTypes.MultiChoice].includes(questionType)) {
      answerKey = newAnswer;
    }
    const params: Record<string, any> = {
      entryId: this._player.sources.id,
      quizUserEntryId: this._quizUserEntryId,
      parentId: questionId,
      answerKey,
      id: updatedAnswerId
    };
    if (questionType === KalturaQuizQuestionTypes.OpenQuestion) {
      params.openAnswer = newAnswer;
    }
    return this._player.provider.doRequest([{loader: QuizAnswerSubmitLoader, params}]).then((data: Map<string, any>) => {
      if (data && data.has(QuizAnswerSubmitLoader.id)) {
        const loader = data.get(QuizAnswerSubmitLoader.id);
        const answerData = loader?.response?.quizAnswer;
        if (!answerData) {
          this._logger.warn('submit answer failed');
        } else {
          return answerData;
        }
      }
    });
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
      const a = this._quizAnswers.find((answer: KalturaQuizAnswer) => {
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
      const onContinue = (data: Selected) => {
        const answer = quizQuestionsMap.get(cue.id)!.a;
        return this._sendQuizAnswer(data, cue.metadata.questionType, answer?.id, cue.id)
          .then((newAnswer: KalturaQuizAnswer) => {
            // update answer
            quizQuestionsMap.set(cue.id, {...quizQuestionsMap.get(cue.id)!, a: newAnswer});
          })
          .catch((error: Error) => {
            this._logger.warn(error);
            throw error;
          });
      };
      quizQuestionsMap.set(cue.id, {
        id: cue.id,
        index,
        startTime: cue.startTime,
        q: cue.metadata,
        a,
        next,
        prev,
        skipAvailable: this.quizData!.canSkip,
        seekAvailable: !this.quizData!.preventSeek,
        disabled: !this.quizData!.allowAnswerUpdate,
        onContinue
      });
    });
    this._onQuestionsLoad(quizQuestionsMap);
  };
}
