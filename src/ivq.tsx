import {h} from 'preact';
// @ts-ignore
// import {core} from 'kaltura-player-js';
import {QuizLoader, QuizUserEntryIdLoader} from './providers';
import {IvqConfig, QuizQuestion, QuizQuestionMap, KalturaQuizQuestion, PreviewProps, MarkerProps} from './types';
import {DataSyncManager} from './data-sync-manager';
import {QuestionsManager} from './questions-manager';
import {KalturaQuiz, KalturaQuizAnswer} from './providers/response-types';
import {WelcomeScreen} from './components/welcome-screen';
import {TimelinePreview, TimelineMarker} from './components/timeline-preview/timeline-preview';

// const {EventType} = core;

export class Ivq extends KalturaPlayer.core.BasePlugin {
  private _player: KalturaPlayerTypes.Player;
  private _resolveQuizDataPromise = () => {};
  private _resolveQuizQuestionsPromise = (qqm: QuizQuestionMap) => {};
  private _quizDataPromise: Promise<void>;
  private _quizQuestionsPromise: Promise<QuizQuestionMap>;
  private _dataManager: DataSyncManager;
  private _questionsManager?: QuestionsManager;

  static defaultConfig: IvqConfig = {};

  constructor(name: string, player: any, config: IvqConfig) {
    super(name, player, config);
    this._player = player;
    this._quizDataPromise = this._makeQuizDataPromise();
    this._quizQuestionsPromise = this._makeQuizQuestionsPromise();
    this._dataManager = new DataSyncManager(
      this._resolveQuizQuestionsPromise,
      (qq: KalturaQuizQuestion) => this._questionsManager?.onQuestionCuepointActive(qq),
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
        this._questionsManager = new QuestionsManager(qqm, this._player, this.eventManager);
        this._handleTimeline(qqm);
      });
    } else {
      this.logger.warn('kalturaCuepoints service is not registered');
      this._resolveQuizDataPromise();
    }
  }

  private _handleTimeline(qqm: QuizQuestionMap) {
    const timelineService: any = this._player.getService('timeline');
    if (!timelineService) {
      this.logger.warn('No timeline service available');
    } else {
      const questionBunchMap = new Map<string, Array<number>>();
      let questionBunch: Array<number> = [];
      qqm.forEach((qq: QuizQuestion) => {
        questionBunch.push(qq.index);
        if (qq.startTime === qq.next?.startTime) {
          return;
        }
        questionBunchMap.set(qq.id, questionBunch);
        timelineService.addCuePoint({
          time: qq.startTime,
          preview: {
            get: ({defaultPreviewProps}: PreviewProps) => {
              return (
                <TimelinePreview
                  onQuestionLinkClick={() => {
                    this._player.currentTime = qq.startTime;
                  }}
                  thumbnailInfo={this.player.getThumbnail(defaultPreviewProps.virtualTime)}
                  questionBunch={questionBunchMap.get(qq.id)!}
                  questionType={qq.q.questionType}
                />
              );
            },
            props: {
              style: {paddingTop: '33%'}
            },
            className: 'preview',
            width: this._player.getThumbnail(0).width,
            hideTime: false,
            sticky: true
          },
          marker: {
            get: (props: MarkerProps) => {
              return <TimelineMarker {...props} />;
            }
          }
        });
        questionBunch = [];
      });
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

  private _showWelcomeScreen = (quizData: KalturaQuiz) => {
    const removeWelcomeScreen = this._player.ui.addComponent({
      label: 'kaltura-ivq-welcome-screen',
      presets: ['Playback'],
      container: 'GuiArea',
      get: () => (
        <WelcomeScreen
          onClose={() => {
            this._player.play();
            removeWelcomeScreen();
          }}
          welcomeMessage={this._dataManager.quizData?.welcomeMessage}
          allowDownload={this._dataManager.quizData?.allowDownload}
        />
      )
    });
  };

  private _setQuizData(quizUserEntryId: number, quizData: KalturaQuiz, quizAnswers: KalturaQuizAnswer[] = []) {
    this._dataManager.setQuizUserEntryId(quizUserEntryId);
    this._dataManager.addQuizData(quizData);
    this._dataManager.addQuizAnswers(quizAnswers);
  }

  private _getQuiz() {
    this._player.provider
      .doRequest([{loader: QuizLoader, params: {entryId: this._player.sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(QuizLoader.id)) {
          // get general quiz data, userEntryId and answers
          const quizLoader = data.get(QuizLoader.id);
          const quizUserEntryId = quizLoader?.response?.userEntries[0]?.id;
          const quizData = quizLoader?.response?.quiz;
          const quizAnswers = quizLoader?.response?.quizAnswers;
          if (!quizData) {
            this.logger.warn('quiz data absent');
          } else {
            if (!quizUserEntryId) {
              // in case if quizUserEntryId doesn't exist - create new one
              return this._player.provider
                .doRequest([{loader: QuizUserEntryIdLoader, params: {entryId: this._player.sources.id}}])
                .then((data: Map<string, any>) => {
                  if (data && data.has(QuizUserEntryIdLoader.id)) {
                    const quizUserEntryIdLoader = data.get(QuizUserEntryIdLoader.id);
                    const quizNewUserEntryId = quizUserEntryIdLoader?.response?.userEntry?.id;
                    if (!quizNewUserEntryId) {
                      this.logger.warn('quizUserEntryId absent');
                    } else {
                      this._dataManager.syncEvents();
                      this._setQuizData(quizNewUserEntryId, quizData, quizAnswers);
                    }
                  }
                })
                .catch((e: any) => {
                  this.logger.warn(e);
                });
            } else {
              this._dataManager.syncEvents();
              this._setQuizData(quizUserEntryId, quizData, quizAnswers);
            }
            // TODO: discuss with product about auto-play
            // if (this._dataManager.quizData?.showWelcomePage) {
            //   this.eventManager.listenOnce(this._player, EventType.FIRST_PLAY, () => {
            //     this._player.pause();
            //     this._showWelcomeScreen(quizData);
            //   });
            // }
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
