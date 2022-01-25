import {h} from 'preact';
import {QuizLoader} from './providers/quiz-loader';
import {IvqConfig} from './types/IvqConfig';
import {DataSyncManager, QuizQuestion, QuizQuestionMap, KalturaQuizQuestion} from './data-sync-manager';
import {QuestionsManager} from './questions-manager';

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _resolveQuizDataPromise = () => {};
  private _resolveQuizQuestionsPromise = (qqm: QuizQuestionMap) => {};
  private _quizDataPromise: Promise<void>;
  private _quizQuestionsPromise: Promise<QuizQuestionMap>;
  private _dataManager?: DataSyncManager;
  private _questionsManager?: QuestionsManager;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
    this._dataManager = new DataSyncManager(
      this._resolveQuizQuestionsPromise,
      (qq: KalturaQuizQuestion[]) => this._questionsManager?.onQuestionsBecomeActive(qq),
      this.eventManager,
      this.player,
      this.logger
    );
  }

  get ready() {
    return this._quizDataPromise;
  }

  loadMedia(): void {
    const kalturaCuePointService: any = this._player.getService('kalturaCuepoints');
    if (kalturaCuePointService) {
      this._getQuestions(kalturaCuePointService);
      this._getQuiz();
      this._quizQuestionsPromise.then((qqm: QuizQuestionMap) => {
        this._questionsManager = new QuestionsManager(qqm);
      });
    } else {
      this.logger.warn('kalturaCuepoints service is not registered');
      this._resolveQuizDataPromise();
    }
  }

  static isValid(): boolean {
    return true;
  }

  reset(): void {
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
  }

  destroy(): void {}

  private _makeQuizDataPromise = () => {
    return new Promise<void>(res => {
      this._resolveQuizDataPromise = res;
    });
  };

  private _makeQuizQuestionsPromise = () => {
    return new Promise<QuizQuestionMap>(res => {
      this._resolveQuizQuestionsPromise = res;
    });
  };

  private _getQuestions(kalturaCuePointService: any) {
    kalturaCuePointService?.registerTypes([kalturaCuePointService.CuepointType.QUIZ]);
  }

  private _getQuiz() {
    this._player.provider
      .doRequest([{loader: QuizLoader, params: {entryId: this._player.sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(QuizLoader.id)) {
          const quizLoader = data.get(QuizLoader.id);
          const quizData = quizLoader?.response?.quiz;
          const quizAnswers = quizLoader?.response?.quizAnswers;
          if (!quizData) {
            this.logger.warn('quiz data absent');
          } else {
            this._dataManager?.addQuizData(quizData);
            this._dataManager?.addQuizAnswers(quizAnswers);
            // TODO: show welcome screen
          }
        }
      })
      .catch((e: any) => {
        this.logger.warn(e);
      })
      .finally(() => {
        this._resolveQuizDataPromise();
      });
  }
}
