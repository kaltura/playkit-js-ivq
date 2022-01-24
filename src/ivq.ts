import {h} from 'preact';
import {QuizLoader} from './providers/quiz-loader';
import {IvqConfig} from './types/IvqConfig';
import {DataManager} from './data-manager';

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _resolveReadyPromise = () => {};
  private _readyPromise: Promise<void>;
  private _dataManager: DataManager;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._dataManager = new DataManager(this.eventManager, this.player, this.logger);
    this._readyPromise = this._makeReadyPromise();
  }

  get ready() {
    return this._readyPromise;
  }

  loadMedia(): void {
    const kalturaCuePointService: any = this._player.getService('kalturaCuepoints');
    if (kalturaCuePointService) {
      this._getQuestions(kalturaCuePointService);
      this._getQuiz();
    } else {
      this.logger.warn('kalturaCuepoints service is not registered');
      this._resolveReadyPromise();
    }
  }

  static isValid(): boolean {
    return true;
  }

  reset(): void {
    this._readyPromise = this._makeReadyPromise();
  }

  destroy(): void {}

  private _makeReadyPromise = () => {
    return new Promise<void>(res => {
      this._resolveReadyPromise = res;
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
            // TODO: use quiz data
          }
          this._dataManager.addQuizData(quizData);
          this._dataManager.addQuizAnswers(quizAnswers);
          this._resolveReadyPromise();
        }
      })
      .catch((e: any) => {
        this.logger.warn(e);
        this._resolveReadyPromise();
      });
  }
}
