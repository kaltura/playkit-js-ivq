import {h} from 'preact';
import { QuizLoader } from './providers/quiz-loader';
import { IvqConfig } from "./types/IvqConfig";

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _resolveReadyPromise = () => {};
  private _readyPromise: Promise<void>;

  static defaultConfig: IvqConfig = {

  };

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._readyPromise = this._makeReadyPromise();
  }

  get ready() {
    return this._readyPromise;
  }

  loadMedia(): void {
    this._getQuiz();
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

  private _getQuiz() {
    this._player.provider
    .doRequest([{loader: QuizLoader, params: {entryId: this._player.sources.id}}])
    .then((data: Map<string, any>) => {
      if (data && data.has(QuizLoader.id)) {
        const quizLoader = data.get(QuizLoader.id);
        const userEntry = quizLoader?.response?.userEntries[0];
        const quizData = quizLoader?.response?.quiz;
        if (!userEntry || !quizData) {
          this.logger.warn('user entry or quiz data absent');
        } else {
          // TODO: use quiz data
        }
        this._resolveReadyPromise();
      }
    })
    .catch((e: any) => {
      this.logger.error(e);
      this._resolveReadyPromise();
    });
  }
}
