// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {getKeyValue, stringToBoolean, isNumber} from './utils';
import {KalturaQuiz, KalturaQuizAnswer, KalturaUserEntry} from './providers/response-types';
import {IvqEventTypes, KalturaQuizQuestion, KalturaQuizQuestionTypes, QuizData, QuizQuestion, QuizQuestionMap, Selected} from './types';
import {QuizAnswerLoader, QuizAnswerSubmitLoader, QuizSubmitLoader, QuizUserEntryIdLoader} from './providers';
import {QuestionStateTypes} from './types/questionStateTypes';

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
    private _logger: KalturaPlayerTypes.Logger,
    private _dispatchIvqEvent: (event: string, payload: unknown) => void,
    private _manageIvqPopup: () => void,
    private _filterQuestionChanged: (qqm: QuizQuestionMap) => Array<QuizQuestion>,
    private _makeOnClickHandler: (id: string) => void
  ) {}

  private _syncEvents = () => {
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_CHANGE, this._onTimedMetadataChange);
    this._eventManager.listen(this._player, this._player.Event.TIMED_METADATA_ADDED, this._onTimedMetadataAdded);
  };

  public setQuizData = (rawQuizData: KalturaQuiz) => {
    this._logger.debug('setQuizData', rawQuizData);
    this.quizData = {
      ...rawQuizData,
      welcomeMessage: getKeyValue(rawQuizData.uiAttributes, 'welcomeMessage'),
      noSeekAlertText: getKeyValue(rawQuizData.uiAttributes, 'noSeekAlertText'),
      inVideoTip: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'inVideoTip')),
      showWelcomePage: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'showWelcomePage')),
      canSkip: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'canSkip')),
      preventSeek: stringToBoolean(getKeyValue(rawQuizData.uiAttributes, 'banSeek'))
    };
  };

  public setQuizUserEntry = (quizUserEntry: KalturaUserEntry) => {
    this._logger.debug('setQuizUserEntry', quizUserEntry);
    this.quizUserEntry = quizUserEntry;
  };

  public setQuizAnswers = (quizAnswers: KalturaQuizAnswer[] = []) => {
    this._logger.debug('setQuizAnswers', quizAnswers);
    this._quizAnswers = quizAnswers;
  };

  public initDataManager = (allowSeek: boolean) => {
    if (!this.quizData || !this.quizUserEntry) {
      this._logger.warn('initDataManager: quizData or quizUserEntry absent');
      return;
    }
    if (this.quizData.preventSeek && !allowSeek) {
      this._enableSeekControl();
    }
    this._syncEvents();
    this._dispatchIvqEvent(IvqEventTypes.QUIZ_STARTED, {
      allowedAttempts: this.quizData.attemptsAllowed,
      allowSeekForward: !this.quizData.preventSeek,
      scoreType: this.quizData.scoreType,
      allowAnswerUpdate: this.quizData?.allowAnswerUpdate
    });
  };

  public dispatchQuestionChanged = () => {
    const isQuizSubmitted = this.isQuizSubmitted();
    const qqa: Array<any> = [];
    const quizQuestions = this._filterQuestionChanged(this.quizQuestionsMap);
    quizQuestions.forEach(qq => {
      let questionState = QuestionStateTypes.UNANSWERED;
      if (isQuizSubmitted && this.quizData!.showCorrectAfterSubmission) {
        if (qq.a?.isCorrect) {
          questionState = QuestionStateTypes.CORRECT;
        } else {
          questionState = QuestionStateTypes.INCORRECT;
        }
      } else if (qq.a) {
        questionState = QuestionStateTypes.ANSWERED;
      }
      const dataToPush = {
        id: qq.id,
        index: qq.index,
        type: qq.q.questionType,
        question: qq.q.question,
        startTime: qq.startTime,
        state: questionState,
        onClick: this._makeOnClickHandler(qq.id)
      };
      qqa.push(dataToPush);
    });
    this._dispatchIvqEvent(IvqEventTypes.QUIZ_QUESTION_CHANGED, {
      qqa: qqa
    });
  };

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
          this._dispatchIvqEvent(IvqEventTypes.QUIZ_SUBMITTED, userEntry.id);
          return this.getQuizAnswers().then(quizAnswers => {
            this._quizAnswers = quizAnswers;
            this.prepareQuizData();
            // disable questions after quiz submitted
            this.quizQuestionsMap.forEach(qq => {
              this.quizQuestionsMap.set(qq.id, {...qq, disabled: true, skipAvailable: false});
            });
          });
        }
      }
    });
  };

  public getUnansweredQuestions = (): Array<QuizQuestion> => {
    const unansweredQuestions: Array<QuizQuestion> = [];
    this.quizQuestionsMap.forEach(qq => {
      if (!qq.a) {
        unansweredQuestions.push(qq);
      }
    });
    return unansweredQuestions;
  };

  public getQuizAnswers = (): Promise<KalturaQuizAnswer[]> => {
    return this._player.provider
      .doRequest([{loader: QuizAnswerLoader, params: {entryId: this._player.sources.id, quizUserEntryId: this.quizUserEntry?.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(QuizAnswerLoader.id)) {
          const quizAnswersLoader = data.get(QuizAnswerLoader.id);
          const quizAnswers = quizAnswersLoader?.response?.quizAnswers;
          return quizAnswers;
        }
      })
      .catch((e: any) => {
        this._logger.warn(e);
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

  public isQuizSubmitted = () => {
    return isNumber(this.quizUserEntry?.score);
  };

  public isSubmitAllowed = () => {
    return !this.getUnansweredQuestions().length;
  };

  private _getSubmittedAttempts = () => {
    if (isNumber(this.quizUserEntry?.version)) {
      return this.isQuizSubmitted() ? this.quizUserEntry!.version + 1 : this.quizUserEntry!.version;
    }
    return 0;
  };

  public getQuizScore = () => {
    return this.isQuizSubmitted() ? (this.quizUserEntry!.score * 100).toFixed(0) : '0';
  };

  public getAvailableAttempts = () => {
    return (this.quizData?.attemptsAllowed || 0) - this._getSubmittedAttempts();
  };

  public isRetakeAllowed = () => {
    return this.getAvailableAttempts() > 0;
  };

  public prepareQuizData = () => {
    this._quizCuePoints.forEach((cue, index) => {
      const a = this._quizAnswers.find((answer: KalturaQuizAnswer) => {
        return cue.id === answer.parentId;
      });
      let prev = this._quizCuePoints[index - 1];
      let next = this._quizCuePoints[index + 1];
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
            this._dispatchIvqEvent(IvqEventTypes.QUESTION_ANSWERED, {
              questionIndex: index,
              questionType: cue.metadata.questionType,
              questionText: cue.metadata.question,
              answer: data,
              attemptNumber: this.quizData?.version
            });
            // update answer
            this.quizQuestionsMap.set(cue.id, {...this.quizQuestionsMap.get(cue.id)!, a: newAnswer});
            this.dispatchQuestionChanged();
            if (!next || this.isSubmitAllowed()) {
              this._manageIvqPopup();
            }
          })
          .catch((error: Error) => {
            this._logger.warn(error);
            throw error;
          });
      };
      const quizDone = this.isQuizSubmitted();
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
    this.dispatchQuestionChanged();
  };

  public retakeQuiz = (quizNewUserEntry: KalturaUserEntry) => {
    this.setQuizUserEntry(quizNewUserEntry);
    this.setQuizAnswers([]);
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
    const quizCues = this._getQuizQuePoints(payload.cues);
    if (quizCues.length) {
      this._quizCuePoints = quizCues;
      this.prepareQuizData();
      this._onQuestionsLoad(this.quizQuestionsMap);
    }
  };

  public reset = () => {
    this.quizData = null;
    this.quizUserEntry = null;
    this.quizQuestionsMap = new Map();
    this._quizCuePoints = [];
    this._quizAnswers = [];
  };
}
