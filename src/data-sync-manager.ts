// @ts-ignore
import {core} from 'kaltura-player-js';
import {getKeyValue, stringToBoolean} from './utils';
import {KalturaQuiz, KalturaQuizAnswer, KalturaUserEntry} from './providers/response-types';
import {KalturaQuizQuestion, QuizData, QuizQuestionMap, Selected, KalturaQuizQuestionTypes, QuizQuestion} from './types';
import {QuizAnswerSubmitLoader, QuizSubmitLoader, QuizUserEntryIdLoader} from './providers';

const {TimedMetadata} = core;

interface TimedMetadataEvent {
  payload: {
    cues: Array<typeof TimedMetadata>;
  };
}

export class DataSyncManager {
  public quizData: QuizData | null = null;
  public quizUserEntry: KalturaUserEntry | null = null;
  public quizQuestionsMap: QuizQuestionMap = new Map();
  private _quizCuePoints: Array<any> = [];
  private _quizAnswers: Array<KalturaQuizAnswer> = [];

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

  public initDataManager(rawQuizData: KalturaQuiz, quizUserEntry: KalturaUserEntry, quizAnswers: KalturaQuizAnswer[] = []) {
    this._logger.debug('initDataManager', rawQuizData, quizUserEntry, quizAnswers);
    this.quizData = {
      ...rawQuizData,
      welcomeMessage: getKeyValue(rawQuizData.uiAttributes, 'welcomeMessage'),
      noSeekAlertText: getKeyValue(rawQuizData.uiAttributes, 'noSeekAlertText'),
      inVideoTip: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'inVideoTip')),
      showWelcomePage: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'showWelcomePage')),
      canSkip: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'canSkip')),
      preventSeek: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'banSeek'))
    };
    this._quizAnswers = quizAnswers;
    this.quizUserEntry = quizUserEntry;
    if (this.quizData.preventSeek) {
      this._enableSeekControl();
    }
    this._syncEvents();
  }

  public submitQuiz = () => {
    const params = {
      entryId: this._player.sources.id,
      quizUserEntryId: this.quizUserEntry?.id
    };
    return this._player.provider.doRequest([{loader: QuizSubmitLoader, params}]).then((data: Map<string, any>) => {
      if (data && data.has(QuizSubmitLoader.id)) {
        const loader = data.get(QuizSubmitLoader.id);
        const userEntry = loader?.response?.userEntry;
        if (!userEntry) {
          this._logger.warn('submit quiz failed');
        } else {
          this.quizUserEntry = userEntry;
          // disable questions after quiz submitted
          this.quizQuestionsMap.forEach(qq => {
            this.quizQuestionsMap.set(qq.id, {...qq, disabled: true, skipAvailable: false});
          });
        }
      }
    });
  };

  public createNewQuizUserEntry = (): Promise<KalturaUserEntry> => {
    return this._player.provider
      .doRequest([{loader: QuizUserEntryIdLoader, params: {entryId: this._player.sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(QuizUserEntryIdLoader.id)) {
          const quizUserEntryIdLoader = data.get(QuizUserEntryIdLoader.id);
          const quizNewUserEntry = quizUserEntryIdLoader?.response?.userEntry;
          return quizNewUserEntry;
        }
      })
      .catch((e: any) => {
        this._logger.warn(e);
      });
  };

  public isSubmitAllowed = () => {
    return !(typeof this.quizUserEntry?.score === 'number');
  };

  public isRetakeAllowed = () => {
    const submittedAttempts = this._getSubmittedAttempts();
    return submittedAttempts < (this.quizData?.attemptsAllowed || 1);
  };

  public _getSubmittedAttempts = () => {
    return this.isSubmitAllowed() ? 0 : this.quizUserEntry!.version + 1;
  };

  public prepareQuizData = () => {
    const quizCues = this._getQuizQuePoints(this._quizCuePoints);
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
        const answer = this.quizQuestionsMap.get(cue.id)!.a;
        return this._sendQuizAnswer(data, cue.metadata.questionType, answer?.id, cue.id)
          .then((newAnswer: KalturaQuizAnswer) => {
            // update answer
            this.quizQuestionsMap.set(cue.id, {...this.quizQuestionsMap.get(cue.id)!, a: newAnswer});
          })
          .catch((error: Error) => {
            this._logger.warn(error);
            throw error;
          });
      };
      const quizDone = !this.isSubmitAllowed();
      const quizQuestion: QuizQuestion = {
        id: cue.id,
        index,
        startTime: cue.startTime,
        q: cue.metadata,
        a,
        next,
        prev,
        skipAvailable: this.quizData!.canSkip && !quizDone,
        seekAvailable: !this.quizData!.preventSeek,
        allowAnswerUpdate: this.quizData!.allowAnswerUpdate,
        disabled: quizDone,
        onContinue
      };
      this.quizQuestionsMap.set(cue.id, quizQuestion);
    });
  };

  public retakeQuiz = (quizNewUserEntry: KalturaUserEntry) => {
    this.quizUserEntry = quizNewUserEntry;
    this._quizAnswers = [];
    this.prepareQuizData();
  };

  private _sendQuizAnswer = (newAnswer: Selected, questionType: KalturaQuizQuestionTypes, updatedAnswerId?: string, questionId?: string) => {
    let answerKey = '1'; // default answerKey for Reflection and OpenAnswer
    if ([KalturaQuizQuestionTypes.TrueFalse, KalturaQuizQuestionTypes.MultiAnswer, KalturaQuizQuestionTypes.MultiChoice].includes(questionType)) {
      answerKey = newAnswer;
    }
    const params: Record<string, any> = {
      entryId: this._player.sources.id,
      quizUserEntryId: this.quizUserEntry?.id,
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
    this._quizCuePoints = payload.cues;
    this.prepareQuizData();
    this._onQuestionsLoad(this.quizQuestionsMap);
  };
}
