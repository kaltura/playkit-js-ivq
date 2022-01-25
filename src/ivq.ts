import {h} from 'preact';
import {QuizLoader} from './providers/quiz-loader';
import {IvqConfig} from './types/IvqConfig';
import {DataManager, QuizQuestion} from './data-manager';

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _resolveQuizDataPromise = () => {};
  private _resolveQuizQuestionsPromise = () => {};
  private _quizDataPromise: Promise<void>;
  private _quizQuizQuestionsPromise: Promise<void>;
  private _dataManager?: DataManager;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuizQuestionsPromise = this._makeQuizQuestionsPromise();
    this._dataManager = new DataManager(
      this._resolveQuizQuestionsPromise,
      this._onQuestionsBecomeActive,
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
      this._quizQuizQuestionsPromise.then(() => {
        // TODO: quiz ready, init UI manager
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
    this._quizQuizQuestionsPromise = this._makeQuizQuestionsPromise();
  }

  destroy(): void {}

  private _makeQuizDataPromise = () => {
    return new Promise<void>(res => {
      this._resolveQuizDataPromise = res;
    });
  };

  private _makeQuizQuestionsPromise = () => {
    return new Promise<void>(res => {
      this._resolveQuizQuestionsPromise = res;
    });
  };

  private _getQuestions(kalturaCuePointService: any) {
    kalturaCuePointService?.registerTypes([kalturaCuePointService.CuepointType.QUIZ]);
  }

  private _onQuestionsBecomeActive = (questions: Array<QuizQuestion>) => {
    // TODO: handle question become active (note: questions is array type)
  };

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
